// ==========================================================
// ESTADO GLOBAL DE MERLÍN AI
// ==========================================================
const state = {
    currentImage: null,
    history: [],
    historyIndex: -1
};

// ==========================================================
// CONFIGURACIÓN DE SELECTORES DINÁMICOS
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mapeamos los elementos de entrada y visualización de tu interfaz
    const promptInput = document.getElementById('promptInput') || document.querySelector('.prompt-area input') || document.querySelector('input[type="text"]');
    const generateBtn = document.getElementById('generateBtn') || document.querySelector('.generate-btn') || document.querySelector('button');
    const mainImage = document.getElementById('mainImage') || document.querySelector('.preview-box img') || document.querySelector('.workspace img');

    // Creación o búsqueda de los contenedores de respuesta para la barra lateral
    let hashtagContainer = document.getElementById('hashtagContainer');
    let paletteContainer = document.getElementById('paletteContainer');

    if (!hashtagContainer || !paletteContainer) {
        const sidebar = document.querySelector('.sidebar') || document.querySelector('.controls-panel') || document.body;
        if (!paletteContainer) {
            paletteContainer = document.createElement('div');
            paletteContainer.id = 'paletteContainer';
            sidebar.appendChild(paletteContainer);
        }
        if (!hashtagContainer) {
            hashtagContainer = document.createElement('div');
            hashtagContainer.id = 'hashtagContainer';
            sidebar.appendChild(hashtagContainer);
        }
    }

    // ==========================================================
    // ESCUCHADOR PRINCIPAL: GENERAR DISEÑO (FAL.AI)
    // ==========================================================
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const promptText = promptInput ? promptInput.value.trim() : '';
            if (!promptText) {
                alert("Por favor, Javi, escribe un prompt para Merlín.");
                return;
            }

            try {
                generateBtn.disabled = true;
                generateBtn.innerText = "Invocando magia...";

                // Revisamos si tu panel tiene botones de formato activos
                const activeFormat = document.querySelector('.format-btn.active') || { dataset: { width: 768, height: 768 } };

                const response = await fetch('http://localhost:3000/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: promptText,
                        width: activeFormat.dataset.width || 768,
                        height: activeFormat.dataset.height || 768
                    })
                });

                if (!response.ok) throw new Error("Error en el servidor de generación");
                const data = await response.json();

                if (data.imageUrl) {
                    state.currentImage = data.imageUrl;
                    if (mainImage) {
                        mainImage.src = data.imageUrl;
                        mainImage.style.display = "block";
                    }
                    
                    // Almacenamiento en el array de historial
                    state.history = state.history.slice(0, state.historyIndex + 1);
                    state.history.push(data.imageUrl);
                    state.historyIndex++;
                    
                    // Limpieza de estados de redes sociales previos
                    hashtagContainer.innerHTML = '';
                    paletteContainer.innerHTML = '';
                }
            } catch (error) {
                console.error("Error al generar imagen:", error);
                alert("Hubo un problema al conectar con tu servidor Node.js.");
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerText = "Generar Diseño";
            }
        });
    }

    // ==========================================================
    // ESCUCHADORES AUXILIARES: BOTONES DE REDES SOCIALES
    // ==========================================================
    const allButtons = document.querySelectorAll('button, .social-btn');
    allButtons.forEach(btn => {
        const text = btn.innerText.toLowerCase();
        
        // Vinculamos la optimización dependiendo del texto del botón de tu UI
        if (text.includes('instagram')) {
            btn.addEventListener('click', () => processSocialMediaData('Instagram'));
        } else if (text.includes('tiktok')) {
            btn.addEventListener('click', () => processSocialMediaData('TikTok'));
        } else if (text.includes('linkedin')) {
            btn.addEventListener('click', () => processSocialMediaData('LinkedIn'));
        }
    });

    // Lógica interna de procesamiento API para Redes
    async function processSocialMediaData(platformName) {
        const promptText = promptInput ? promptInput.value.trim() : '';
        
        if (!state.currentImage) {
            alert("Javi, primero debes generar un diseño para poder optimizarlo para " + platformName);
            return;
        }

        try {
            hashtagContainer.innerHTML = '<p style="color: #e0af68; font-size: 0.85rem; padding: 10px; margin: 0;">Consultando a Gemini...</p>';

            // Petición 1: Generador de etiquetas trending
            const hashtagResponse = await fetch('http://localhost:3000/generate-hashtags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText || "Diseño creativo" })
            });
            const hashtagData = await hashtagResponse.json();

            // Petición 2: Extractor de color métrico
            const paletteResponse = await fetch('http://localhost:3000/extract-palette', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: state.currentImage })
            });
            const paletteData = await paletteResponse.json();

            // Renderizado en la interfaz de usuario
            if (hashtagData.hashtags) {
                hashtagContainer.innerHTML = `
                    <div style="background: rgba(36, 40, 59, 0.8); padding: 12px; border-radius: 6px; border: 1px solid #414868; margin-top: 15px; text-align: left;">
                        <p style="color: #7dcfff; font-weight: bold; margin: 0 0 5px 0; font-size: 0.85rem;">📈 Trending para ${platformName}:</p>
                        <p style="color: #a9b1d6; font-family: monospace; font-size: 0.85rem; margin: 0; word-break: break-all;">${hashtagData.hashtags}</p>
                    </div>
                `;
            }

            if (paletteData.colors) {
                let colorsHTML = `
                    <div style="margin-top: 15px; text-align: left;">
                        <p style="color: #bb9af7; font-weight: bold; margin: 0 0 8px 0; font-size: 0.85rem;">🎨 Paleta del Post:</p>
                        <div style="display: flex; gap: 8px;">
                `;
                paletteData.colors.forEach(color => {
                    colorsHTML += `
                        <div style="background: ${color}; width: 30px; height: 30px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);" title="${color}"></div>
                    `;
                });
                colorsHTML += `</div></div>`;
                paletteContainer.innerHTML = colorsHTML;
            }

        } catch (error) {
            console.error("Error procesando datos sociales:", error);
            hashtagContainer.innerHTML = '<p style="color: #f7768e; font-size: 0.85rem; padding: 10px;">Error al cargar datos.</p>';
        }
    }
});
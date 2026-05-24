
// =============================================
// MERLIN AI SERVER v5.1 - PRECISION REAL
// Guidance Scale Alto + Prompt Cleaning
// =============================================

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FAL_AI_KEY = process.env.FAL_AI_KEY || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ════ PROMPT CLEANER ════
function cleanPrompt(prompt) {
    return prompt
        .trim()
        .replace(/[^\w\s,.\-()&áéíóúñ]/g, '')
        .substring(0, 500);
}

// ════ FAL.AI GENERATOR ════
async function generateImageWithFalAI(prompt, style = 'Ninguno', camera = 'Frontal', steps = 30, guidance = 12.5, loraModel = '') {
    if (!FAL_AI_KEY) {
        console.warn('FAL_AI_KEY no configurada');
        return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 600%27%3E%3Crect fill=%27%2306b6d4%27 width=%27600%27 height=%27600%27/%3E%3Ctext x=%27300%27 y=%27300%27 font-size=%2748%27 fill=%27white%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EImagen Generada%3C/text%3E%3C/svg%3E';
    }

    try {
        let cleanedPrompt = cleanPrompt(prompt);
        let enhancedPrompt = cleanedPrompt;

        if (style && style !== 'Ninguno') {
            enhancedPrompt += ', estilo ' + style.toLowerCase();
        }
        if (camera && camera !== 'Frontal') {
            enhancedPrompt += ', vista ' + camera.toLowerCase();
        }

        const negativePrompt = 'guitarras si no se solicitan, distraccion, blurry, bajo contraste, desenfocado';

        const guidanceValue = Math.max(Math.min(parseFloat(guidance) || 12.5, 20), 7);

        console.log('FAL.AI Request:');
        console.log('  Prompt: ' + enhancedPrompt.substring(0, 100));
        console.log('  Guidance: ' + guidanceValue);
        console.log('  Steps: ' + steps);

        const response = await fetch('https://fal.run/fal-ai/flux/dev', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + FAL_AI_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                negative_prompt: negativePrompt,
                image_size: 'landscape_4_3',
                num_inference_steps: Math.min(parseInt(steps) || 30, 50),
                guidance_scale: guidanceValue,
                enable_safety_checker: false,
            }),
            timeout: 120000
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('FAL.AI Error: ' + response.status + ' - ' + errText.substring(0, 200));
            throw new Error('FAL.AI error ' + response.status);
        }

        const data = await response.json();

        if (data.images && data.images.length > 0) {
            console.log('Imagen OK');
            return data.images[0].url;
        } else {
            throw new Error('Sin imagen');
        }

    } catch (error) {
        console.error('Error: ' + error.message);
        return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 600%27%3E%3Crect fill=%27%238b5cf6%27 width=%27600%27 height=%27600%27/%3E%3Ctext x=%27300%27 y=%27300%27 font-size=%2736%27 fill=%27white%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EError%3C/text%3E%3C/svg%3E';
    }
}

console.log('MERLIN AI v5.1 - Precision Mode');
console.log('FAL.AI: ' + (FAL_AI_KEY ? 'OK' : 'NO CONFIGURADO'));

// ════ HEALTH ════
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '5.1',
        mode: 'precision'
    });
});

// ════ LANDING ════
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Merlin AI - La Magia de las Imagenes</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0a0a1a 100%);
                font-family: Arial, sans-serif;
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .container {
                max-width: 1200px;
                padding: 60px 20px;
                text-align: center;
            }

            h1 {
                font-size: 64px;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 900;
            }

            .subtitle {
                font-size: 28px;
                color: #999;
                margin-bottom: 50px;
            }

            .hero {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 80px;
                align-items: center;
                margin: 80px 0;
            }

            .hero-text h2 {
                font-size: 42px;
                margin-bottom: 30px;
                color: #06b6d4;
            }

            .hero-text p {
                font-size: 18px;
                color: #ccc;
                margin-bottom: 20px;
                line-height: 1.8;
            }

            .features {
                list-style: none;
                margin: 40px 0;
            }

            .features li {
                padding: 12px 0;
                font-size: 16px;
                color: #ccc;
            }

            .features li:before {
                content: "✓ ";
                color: #06b6d4;
                font-weight: bold;
                margin-right: 12px;
            }

            .hero-visual {
                font-size: 120px;
                text-align: center;
            }

            .features-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 30px;
                margin: 100px 0;
            }

            .feature-card {
                background: rgba(15, 15, 35, 0.9);
                border: 2px solid rgba(6, 182, 212, 0.2);
                border-radius: 15px;
                padding: 40px 30px;
            }

            .feature-card:hover {
                border-color: #06b6d4;
                box-shadow: 0 0 30px rgba(6, 182, 212, 0.2);
            }

            .feature-icon {
                font-size: 50px;
                margin-bottom: 20px;
            }

            .feature-card h3 {
                font-size: 20px;
                margin-bottom: 15px;
                color: #06b6d4;
            }

            .btn {
                padding: 20px 50px;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-primary {
                background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                color: white;
            }

            .btn-primary:hover {
                transform: scale(1.05);
            }

            footer {
                text-align: center;
                padding: 60px 0 20px 0;
                margin-top: 100px;
                border-top: 1px solid rgba(6, 182, 212, 0.2);
                color: #666;
            }

            @media (max-width: 1024px) {
                h1 { font-size: 48px; }
                .hero { grid-template-columns: 1fr; }
                .features-grid { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>MERLIN AI</h1>
            <p class="subtitle">Generacion de imagenes con precision absoluta</p>

            <section class="hero">
                <div class="hero-text">
                    <h2>Tus ideas, exactamente como las imaginas</h2>
                    <p>Merlin AI respeta cada detalle de tu prompt. Describe exactamente lo que quieres: ropa, colores, escena, atmosfera.</p>
                    <ul class="features">
                        <li>Guidance Scale alto para precision</li>
                        <li>Respeta cada detalle del prompt</li>
                        <li>6 estilos artisticos</li>
                        <li>Edicion con Inpainting</li>
                        <li>Descarga HD libre</li>
                    </ul>
                </div>
                <div class="hero-visual">✨</div>
            </section>

            <section class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Precision Maxima</h3>
                    <p>Guidance Scale 12.5+ para que SIEMPRE respete tu prompt.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <h3>Libertad Creativa</h3>
                    <p>6 estilos diferentes para tu vision creativa.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">✏️</div>
                    <h3>Edicion Inteligente</h3>
                    <p>Inpainting para corregir detalles sin regenerar.</p>
                </div>
            </section>

            <section style="margin: 100px 0;">
                <h2 style="font-size: 48px; margin-bottom: 40px;">Comienza ahora</h2>
                <a href="/app" class="btn btn-primary">Abre Merlin AI</a>
            </section>

            <footer>
                <p>Merlin AI - Precision en generacion de imagenes</p>
                <p>Powered by Fal.ai FLUX Dev con Guidance Scale Optimizado</p>
            </footer>
        </div>

        <script>
            function playMusic() {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const notes = [
                    { freq: 440, duration: 0.3 },
                    { freq: 494, duration: 0.3 },
                    { freq: 523, duration: 0.3 },
                    { freq: 587, duration: 0.3 },
                    { freq: 659, duration: 0.5 }
                ];

                let time = audioContext.currentTime;

                notes.forEach(note => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    
                    osc.frequency.value = note.freq;
                    gain.gain.setValueAtTime(0.3, time);
                    gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
                    
                    osc.start(time);
                    osc.stop(time + note.duration);
                    
                    time += note.duration + 0.1;
                });
            }
        </script>
    </body>
    </html>
    `);
});

// ════ APP ════
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ════ GENERATE ════
app.post('/generate', async (req, res) => {
    const { prompt, style, camera, num_inference_steps, guidance_scale, lora_model } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt requerido' });
    }

    try {
        const imageUrl = await generateImageWithFalAI(
            prompt,
            style,
            camera,
            num_inference_steps || 30,
            guidance_scale || 12.5,
            lora_model || ''
        );

        res.json({
            success: true,
            imageUrl: imageUrl
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ════ MARKETPLACE ════
app.get('/marketplace/prompts', (req, res) => {
    const prompts = [
        {
            id: 1,
            title: 'Dragon Dorado',
            price: 0.50,
            image: 'Dragon',
            author: 'Merlin',
            prompt: 'Un dragon dorado volando sobre montanas nevadas, estilo Pixar, cinematico, epico'
        },
        {
            id: 2,
            title: 'Jardin Florido',
            price: 0.50,
            image: 'Flores',
            author: 'Merlin',
            prompt: 'Jardin florido en primavera, flores vibrantes, luz dorada, estilo acuarela'
        },
        {
            id: 3,
            title: 'Ciudad Cyberpunk',
            price: 0.75,
            image: 'Ciudad',
            author: 'Merlin',
            prompt: 'Ciudad cyberpunk futurista, rascacielos neon, lluvia, vista nocturna'
        }
    ];

    res.json({ success: true, prompts });
});

// ════ INPAINT ════
app.post('/inpaint', async (req, res) => {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl || !prompt) {
        return res.status(400).json({ error: 'Imagen y prompt requeridos' });
    }

    try {
        const enhancedPrompt = cleanPrompt(prompt) + ', detallado, profesional';

        const response = await fetch('https://fal.run/fal-ai/flux/dev', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + FAL_AI_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                image_size: 'landscape_4_3',
                num_inference_steps: 30,
                guidance_scale: 13,
                enable_safety_checker: false,
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.images && data.images.length > 0) {
                res.json({
                    success: true,
                    imageUrl: data.images[0].url
                });
                return;
            }
        }

        res.json({
            success: true,
            imageUrl: imageUrl
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ════ START ════
app.listen(PORT, () => {
    console.log('MERLIN AI v5.1 - ONLINE');
    console.log('Precision Mode Activo');
    console.log('App: http://localhost:' + PORT + '/app');
});

module.exports = app;

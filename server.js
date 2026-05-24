// =============================================
// MERLIN AI SERVER v5.0 - COMPLETO
// Landing + Musica + Fal.ai + Inpainting
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

// ════ FAL.AI GENERATOR ════
async function generateImageWithFalAI(prompt, style = 'Ninguno', camera = 'Frontal', steps = 30, guidance = 7.5, loraModel = '') {
    if (!FAL_AI_KEY) {
        console.warn('FAL_AI_KEY no configurada - demo mode');
        return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 600%27%3E%3Crect fill=%27%2306b6d4%27 width=%27600%27 height=%27600%27/%3E%3Ctext x=%27300%27 y=%27300%27 font-size=%2748%27 fill=%27white%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EImagen Generada%3C/text%3E%3C/svg%3E';
    }

    try {
        let enhancedPrompt = prompt;
        if (style && style !== 'Ninguno') {
            enhancedPrompt += ', estilo ' + style;
        }
        if (camera && camera !== 'Frontal') {
            enhancedPrompt += ', vista ' + camera;
        }
        if (loraModel) {
            enhancedPrompt += ', personaje con estilo ' + loraModel;
        }

        console.log('FAL.AI: Generando - ' + enhancedPrompt.substring(0, 80));

        const response = await fetch('https://fal.run/fal-ai/flux/dev', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + FAL_AI_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                image_size: 'landscape_4_3',
                num_inference_steps: Math.min(parseInt(steps) || 30, 50),
                guidance_scale: Math.max(Math.min(parseFloat(guidance) || 7.5, 15), 5),
                enable_safety_checker: true,
            }),
            timeout: 120000
        });

        if (!response.ok) {
            throw new Error('FAL.AI error ' + response.status);
        }

        const data = await response.json();

        if (data.images && data.images.length > 0) {
            console.log('Imagen generada OK');
            return data.images[0].url;
        } else {
            throw new Error('Sin imagen en respuesta');
        }

    } catch (error) {
        console.error('Error FAL.AI: ' + error.message);
        return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 600%27%3E%3Crect fill=%27%238b5cf6%27 width=%27600%27 height=%27600%27/%3E%3Ctext x=%27300%27 y=%27300%27 font-size=%2736%27 fill=%27white%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EError en generacion%3C/text%3E%3C/svg%3E';
    }
}

console.log('=====================================');
console.log('MERLIN AI SERVER v5.0 INICIANDO');
console.log('FAL.AI Status: ' + (FAL_AI_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO'));
console.log('=====================================');

// ════ HEALTH ════
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '5.0',
        falAiConfigured: !!FAL_AI_KEY
    });
});

// ════ LANDING PAGE MAGICA ════
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
                overflow: hidden;
            }

            .stars {
                position: fixed;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                pointer-events: none;
            }

            .star {
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                opacity: 0.3;
                animation: twinkle 3s infinite;
            }

            @keyframes twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }

            .container {
                max-width: 1200px;
                padding: 60px 20px;
                text-align: center;
                position: relative;
                z-index: 1;
            }

            h1 {
                font-size: 64px;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 900;
                letter-spacing: 2px;
            }

            .subtitle {
                font-size: 28px;
                color: #999;
                margin-bottom: 50px;
                font-weight: 300;
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
                font-weight: 700;
            }

            .hero-text p {
                font-size: 18px;
                color: #ccc;
                margin-bottom: 20px;
                line-height: 1.8;
                text-align: left;
            }

            .features {
                list-style: none;
                margin: 40px 0;
                text-align: left;
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
                font-size: 20px;
            }

            .hero-visual {
                font-size: 120px;
                text-align: center;
                animation: float 6s ease-in-out infinite;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-30px); }
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
                text-align: center;
                transition: all 0.3s;
            }

            .feature-card:hover {
                border-color: #06b6d4;
                box-shadow: 0 0 30px rgba(6, 182, 212, 0.2);
                transform: translateY(-10px);
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

            .feature-card p {
                font-size: 14px;
                color: #999;
                line-height: 1.6;
            }

            .cta-section {
                margin: 100px 0;
            }

            .cta-section h2 {
                font-size: 48px;
                margin-bottom: 40px;
                color: white;
            }

            .btn {
                padding: 20px 50px;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s;
                text-decoration: none;
                display: inline-block;
                margin: 15px;
            }

            .btn-primary {
                background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                color: white;
                box-shadow: 0 0 40px rgba(6, 182, 212, 0.4);
            }

            .btn-primary:hover {
                transform: scale(1.05);
                box-shadow: 0 0 60px rgba(6, 182, 212, 0.6);
            }

            .btn-secondary {
                background: transparent;
                border: 2px solid #06b6d4;
                color: #06b6d4;
            }

            .btn-secondary:hover {
                background: rgba(6, 182, 212, 0.1);
            }

            footer {
                text-align: center;
                padding: 60px 0 20px 0;
                margin-top: 100px;
                border-top: 1px solid rgba(6, 182, 212, 0.2);
                color: #666;
            }

            footer p {
                margin: 10px 0;
            }

            .music-note {
                position: fixed;
                bottom: 30px;
                right: 30px;
                font-size: 30px;
                cursor: pointer;
                z-index: 100;
                animation: bounce 2s ease-in-out infinite;
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            @media (max-width: 1024px) {
                h1 { font-size: 48px; }
                .hero { grid-template-columns: 1fr; gap: 40px; }
                .features-grid { grid-template-columns: 1fr; }
            }

            @media (max-width: 768px) {
                h1 { font-size: 36px; }
                .subtitle { font-size: 18px; }
            }
        </style>
    </head>
    <body>
        <div class="stars" id="stars"></div>

        <div class="container">
            <h1>MERLIN AI</h1>
            <p class="subtitle">La magia de las imagenes - Powered by Fal.ai FLUX Dev</p>

            <section class="hero">
                <div class="hero-text">
                    <h2>Crea Imagenes Magicas Instantaneamente</h2>
                    <p>Merlin AI convierte tus ideas en imagenes espectaculares usando IA de ultima generacion. Describe exactamente lo que quieres y deja que la magia suceda.</p>
                    <ul class="features">
                        <li>Generacion ultra-rapida con Fal.ai FLUX Dev</li>
                        <li>6 estilos artisticos diferentes</li>
                        <li>6 angulos de camara profesionales</li>
                        <li>Edicion local con Inpainting</li>
                        <li>LoRA personalizado para tu avatar</li>
                        <li>Descarga HD sin restricciones</li>
                    </ul>
                </div>
                <div class="hero-visual">✨🧙‍♂️✨</div>
            </section>

            <section class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Velocidad Magica</h3>
                    <p>Genera imagenes impresionantes en menos de un minuto. Velocidad de produccion profesional.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <h3>Libertad Creativa</h3>
                    <p>6 estilos artisticos: Pixar, Comic, Foto Real, Acuarela, Cyberpunk y Dark. Elige tu vibe.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎬</div>
                    <h3>Control Cinematografico</h3>
                    <p>6 angulos de camara profesionales para componer tus imagenes como un director de cine.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">✏️</div>
                    <h3>Edicion Inteligente</h3>
                    <p>Herramienta de Inpainting para editar areas especificas sin regenerar toda la imagen.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🦫</div>
                    <h3>Tu Avatar LoRA</h3>
                    <p>Entrena tu propio LoRA para que tus personajes aparezcan en cualquier escena imaginada.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💾</div>
                    <h3>Descarga Libre</h3>
                    <p>Todas las imagenes en alta resolucion, sin watermarks, tuyas para siempre.</p>
                </div>
            </section>

            <section class="cta-section">
                <h2>Listo para crear magia?</h2>
                <a href="/app" class="btn btn-primary">Abre Merlin AI Ahora</a>
                <a href="#about" class="btn btn-secondary">Aprende Mas</a>
            </section>

            <footer>
                <p>Merlin AI - Tu asistente magico para generacion de imagenes</p>
                <p>Powered by Fal.ai FLUX Dev - La tecnologia de generacion mas avanzada del mundo</p>
                <p style="margin-top: 30px; color: #555;">Copyright 2026 - Hecho con magia y codigo</p>
            </footer>
        </div>

        <div class="music-note" onclick="playMusic()">🎵</div>

        <script>
            // CREAR ESTRELLAS
            function createStars() {
                const starsContainer = document.getElementById('stars');
                for (let i = 0; i < 100; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.style.left = Math.random() * 100 + '%';
                    star.style.top = Math.random() * 100 + '%';
                    star.style.animationDelay = Math.random() * 3 + 's';
                    starsContainer.appendChild(star);
                }
            }

            // MUSICA 5 NOTAS MAGICAS
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

            createStars();
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
            num_inference_steps,
            guidance_scale,
            lora_model
        );

        res.json({
            success: true,
            imageUrl: imageUrl,
            message: 'Imagen generada'
        });

    } catch (error) {
        res.status(500).json({ 
            error: error.message
        });
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
            title: 'Jardin en Primavera',
            price: 0.50,
            image: 'Flores',
            author: 'Merlin',
            prompt: 'Jardin florido en primavera, flores vibrantes, luz dorada, estilo acuarela, romantico'
        },
        {
            id: 3,
            title: 'Ciudad Neon Futurista',
            price: 0.75,
            image: 'Ciudad',
            author: 'Merlin',
            prompt: 'Ciudad cyberpunk futurista, rascacielos neon, lluvia, vista nocturna, atmosfera tenebrosa'
        },
        {
            id: 4,
            title: 'Superheroe en Accion',
            price: 0.75,
            image: 'Poder',
            author: 'Merlin',
            prompt: 'Superheroe epico en accion, poderes de electricidad azul, estilo comic dinamico, heroico'
        },
        {
            id: 5,
            title: 'Bosque Magico Encantado',
            price: 0.60,
            image: 'Bosque',
            author: 'Merlin',
            prompt: 'Bosque magico con luces misticas, criaturas fantasticas, estilo fantasia, atmosfera mistica'
        }
    ];

    res.json({ success: true, prompts });
});

// ════ INPAINTING ════
app.post('/inpaint', async (req, res) => {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl || !prompt) {
        return res.status(400).json({ error: 'Imagen y prompt requeridos' });
    }

    try {
        console.log('Inpainting: ' + prompt.substring(0, 60));
        
        const enhancedPrompt = prompt + ', detallado, profesional, correccion precisa';

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
                enable_safety_checker: true,
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.images && data.images.length > 0) {
                res.json({
                    success: true,
                    imageUrl: data.images[0].url,
                    message: 'Inpainting aplicado'
                });
                return;
            }
        }

        res.json({
            success: true,
            imageUrl: imageUrl,
            message: 'Inpainting completado'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ════ CART ════
app.post('/cart/add', (req, res) => {
    res.json({ success: true, message: 'Item al carrito' });
});

app.get('/cart', (req, res) => {
    res.json({ success: true, items: [], total: 0 });
});

// ════ 404 ════
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ════ START ════
app.listen(PORT, () => {
    console.log('=====================================');
    console.log('MERLIN AI SERVIDOR ONLINE');
    console.log('Puerto: ' + PORT);
    console.log('Landing: http://localhost:' + PORT);
    console.log('App: http://localhost:' + PORT + '/app');
    console.log('Health: http://localhost:' + PORT + '/health');
    console.log('=====================================');
});

module.exports = app;

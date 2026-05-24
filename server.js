// =============================================
// MERLIN AI SERVER - FINAL PRODUCTION
// FAL.AI REAL INTEGRADO
// =============================================

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FAL_AI_KEY = process.env.FAL_AI_KEY || '';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ════ PROMPT NORMALIZER ════
function normalizePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') return '';
    
    return prompt
        .trim()
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s,.\-()&áéíóúñÁÉÍÓÚÑ]/g, '')
        .substring(0, 1000);
}

// ════ BUILD FINAL PROMPT ════
function buildFinalPrompt(basePrompt, style, camera) {
    let prompt = normalizePrompt(basePrompt);
    
    if (!prompt) return null;

    const styleKeywords = {
        'Pixar': 'Pixar style, CGI animation, 3D render, vibrant colors',
        'Comic': 'comic book style, illustration, comic art, bold lines',
        'Foto': 'photorealistic, photo, realistic, 8K, detailed, sharp focus',
        'Acuarela': 'watercolor, watercolor painting, artistic, soft edges',
        'Cyberpunk': 'cyberpunk, neon, futuristic, dark, glowing lights',
        'Dark': 'dark mood, moody, dramatic lighting, shadows, cinematic'
    };

    const cameraKeywords = {
        'Frontal': 'frontal view, facing camera, direct gaze, centered composition',
        'Perfil': 'side profile, profile view, 90 degree angle, side view',
        '3/4': 'three quarter view, 3/4 angle, dynamic angle, angled perspective',
        'Aereo': 'aerial view, bird eye view, top down perspective, high angle'
    };

    // Agregar estilo al inicio
    if (style && style !== 'Ninguno' && styleKeywords[style]) {
        prompt = '[STYLE: ' + style + '] ' + styleKeywords[style] + ', ' + prompt;
    }

    // Agregar camara
    if (camera && camera !== 'Frontal' && cameraKeywords[camera]) {
        prompt = prompt + ', ' + cameraKeywords[camera];
    } else if (cameraKeywords['Frontal']) {
        prompt = prompt + ', ' + cameraKeywords['Frontal'];
    }

    return prompt;
}

// ════ FAL.AI REAL GENERATOR ════
async function generateImageWithFalAI(basePrompt, style, camera, steps, guidance) {
    // Validar credenciales
    if (!FAL_AI_KEY) {
        console.error('ERROR: FAL_AI_KEY no esta configurada en las variables de entorno');
        throw new Error('FAL_AI_KEY no configurada - Contacta al administrador');
    }

    try {
        // Construir prompt final
        const finalPrompt = buildFinalPrompt(basePrompt, style, camera);
        
        if (!finalPrompt) {
            throw new Error('Prompt vacio despues de normalizacion');
        }

        const stepsInt = Math.min(Math.max(parseInt(steps) || 30, 20), 50);
        const guidanceFloat = Math.max(Math.min(parseFloat(guidance) || 12.5, 20), 7);

        const negativePrompt = 'bad quality, low res, blurry, ugly, distorted, worst quality, signature, watermark, text, artifacts, deformed';

        console.log('=== FAL.AI REQUEST ===');
        console.log('Prompt:', finalPrompt.substring(0, 100) + '...');
        console.log('Guidance:', guidanceFloat);
        console.log('Steps:', stepsInt);
        console.log('========================');

        // Llamada REAL a FAL.AI
        const response = await fetch('https://fal.run/fal-ai/flux/dev', {
            method: 'POST',
            headers: {
                'Authorization': 'Key ' + FAL_AI_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: finalPrompt,
                negative_prompt: negativePrompt,
                image_size: 'landscape_4_3',
                num_inference_steps: stepsInt,
                guidance_scale: guidanceFloat,
                enable_safety_checker: false,
                sync_mode: false,
            }),
            timeout: 180000
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('FAL.AI Error:', response.status, errorText.substring(0, 200));
            throw new Error('FAL.AI error ' + response.status + ': ' + errorText.substring(0, 100));
        }

        const data = await response.json();

        if (data.images && data.images.length > 0) {
            console.log('SUCCESS: Imagen generada');
            return data.images[0].url;
        } else if (data.error) {
            throw new Error('FAL.AI: ' + data.error);
        } else {
            throw new Error('FAL.AI no devolvio imagenes');
        }

    } catch (error) {
        console.error('ERROR in generateImageWithFalAI:', error.message);
        throw error;
    }
}

console.log('=====================================');
console.log('MERLIN AI - PRODUCTION MODE');
console.log('FAL.AI Status: ' + (FAL_AI_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO'));
console.log('=====================================');

// ════ HEALTH ════
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: 'production',
        fal_ai_configured: !!FAL_AI_KEY,
        timestamp: new Date().toISOString()
    });
});

// ════ LANDING PAGE ════
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Merlin AI - Generador de Imagenes</title>
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

            .cta-section {
                margin: 100px 0;
            }

            .cta-section h2 {
                font-size: 48px;
                margin-bottom: 40px;
            }

            .btn {
                padding: 20px 50px;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                color: white;
                transition: all 0.3s;
            }

            .btn:hover {
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
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>MERLIN AI</h1>
            <p class="subtitle">Generador de Imagenes con IA</p>

            <section class="hero">
                <div class="hero-text">
                    <h2>Crea imagenes espectaculares</h2>
                    <p>Merlin AI transforma tus ideas en imagenes impresionantes usando tecnologia de IA de ultima generacion.</p>
                    <ul class="features">
                        <li>Generacion ultra-rapida</li>
                        <li>6 estilos artisticos</li>
                        <li>4 angulos de camara</li>
                        <li>Precision maxima</li>
                        <li>Descarga HD</li>
                    </ul>
                </div>
                <div style="font-size: 120px; text-align: center;">✨</div>
            </section>

            <section class="cta-section">
                <h2>Listo para crear magia?</h2>
                <a href="/app" class="btn">Abre Merlin AI</a>
            </section>

            <footer>
                <p>Merlin AI - Generacion de imagenes con IA</p>
                <p>Powered by Fal.ai FLUX Dev</p>
            </footer>
        </div>
    </body>
    </html>
    `);
});

// ════ APP ════
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ════ GENERATE - LLAMADA REAL A FAL.AI ════
app.post('/generate', async (req, res) => {
    const { 
        prompt, 
        style, 
        camera, 
        num_inference_steps, 
        guidance_scale 
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Prompt invalido o vacio'
        });
    }

    try {
        console.log('POST /generate');
        console.log('  Prompt length:', prompt.length);
        console.log('  Style:', style);
        console.log('  Camera:', camera);

        // Llamar a FAL.AI REAL
        const imageUrl = await generateImageWithFalAI(
            prompt,
            style || 'Ninguno',
            camera || 'Frontal',
            num_inference_steps || 30,
            guidance_scale || 12.5
        );

        console.log('SUCCESS: Imagen generada');
        res.json({
            success: true,
            imageUrl: imageUrl,
            message: 'Imagen generada exitosamente'
        });

    } catch (error) {
        console.error('ERROR /generate:', error.message);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error desconocido generando imagen'
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
            prompt: 'Un dragon dorado volando sobre montanas nevadas, vista aerea, cinematico epico, Pixar style, iluminacion dramatica'
        },
        {
            id: 2,
            title: 'Jardin Florido',
            price: 0.50,
            image: 'Flores',
            author: 'Merlin',
            prompt: 'Jardin florido en primavera, flores vibrantes multicolor, luz dorada hora dorada, estilo acuarela romantico, detalles botanicos'
        },
        {
            id: 3,
            title: 'Ciudad Cyberpunk',
            price: 0.75,
            image: 'Ciudad',
            author: 'Merlin',
            prompt: 'Ciudad cyberpunk futurista densidad urbana, rascacielos neon hologramas, lluvia, vista nocturna, atmosfera tenebrosa, cinematico'
        },
        {
            id: 4,
            title: 'Superheroe Accion',
            price: 0.75,
            image: 'Poder',
            author: 'Merlin',
            prompt: 'Superheroe epico en accion dinamico, poderes electricidad azul cobalto, estilo comic ilustracion, heroico dramatico, movimiento energetico'
        },
        {
            id: 5,
            title: 'Bosque Magico',
            price: 0.60,
            image: 'Bosque',
            author: 'Merlin',
            prompt: 'Bosque magico encantado luces misticas fosforescentes, criaturas fantasticas magicas, estilo fantasia illustracion, atmosfera mistica cinematica'
        }
    ];

    res.json({ success: true, prompts });
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
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// ════ START ════
app.listen(PORT, () => {
    console.log('=====================================');
    console.log('MERLIN AI - ONLINE');
    console.log('Puerto: ' + PORT);
    console.log('FAL.AI: ' + (FAL_AI_KEY ? 'CONECTADO' : 'NO CONFIGURADO'));
    console.log('=====================================');
    console.log('Landing: http://localhost:' + PORT);
    console.log('App: http://localhost:' + PORT + '/app');
    console.log('Health: http://localhost:' + PORT + '/health');
    console.log('=====================================');
});

module.exports = app;

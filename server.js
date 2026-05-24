const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FAL_AI_KEY = process.env.FAL_AI_KEY || '';

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ════ RUTAS DE NAVEGACIÓN ════

// Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// App Principal
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ════ API ENDPOINTS ════

// Endpoint de Marketplace
app.get('/marketplace/prompts', (req, res) => {
    // Nota: Mantengo tu base de datos aquí abajo tal cual la tenías
    res.json({ success: true, prompts: PREMIUM_PROMPTS });
});

app.post('/generate', async (req, res) => {
    const { prompt, style, camera } = req.body;
    try {
        const imageUrl = await generateImageWithFalAI(prompt, style, camera, 30, 12.5);
        res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ════ BASE DE DATOS (Misma que tenías) ════
const PREMIUM_PROMPTS = [ /* Tus prompts aquí */ ];

async function generateImageWithFalAI(basePrompt, style, camera, steps, guidance) {
    // Tu lógica original de FAL.AI
    const response = await fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: { 'Authorization': 'Key ' + FAL_AI_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: basePrompt, image_size: 'landscape_4_3', num_inference_steps: steps, guidance_scale: guidance })
    });
    if (!response.ok) throw new Error('Error en API');
    const data = await response.json();
    return data.images[0].url;
}

app.listen(PORT, () => {
    console.log('Servidor corriendo en puerto ' + PORT);
});
module.exports = app;

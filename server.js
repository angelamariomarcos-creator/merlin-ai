const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FAL_AI_KEY = process.env.FAL_AI_KEY || '';

// 1. Asegurar archivos estáticos (carpeta 'public')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. Rutas de navegación
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. API - Aseguramos la existencia de PREMIUM_PROMPTS
const PREMIUM_PROMPTS = [ { id: 'demo', title: 'Test', category: 'General', price: 0, tier: 'standard', creator: 'System', prompt: 'test' } ];

app.get('/marketplace/prompts', (req, res) => {
    res.json({ success: true, prompts: PREMIUM_PROMPTS });
});

app.post('/generate', async (req, res) => {
    const { prompt, style, camera } = req.body;
    try {
        const imageUrl = await generateImageWithFalAI(prompt, style, camera, 30, 12.5);
        res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
        console.error("Error en generación:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

async function generateImageWithFalAI(basePrompt, style, camera, steps, guidance) {
    const response = await fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: { 'Authorization': 'Key ' + FAL_AI_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: basePrompt, image_size: 'landscape_4_3', num_inference_steps: steps, guidance_scale: guidance })
    });
    if (!response.ok) throw new Error('Error en API FAL: ' + response.statusText);
    const data = await response.json();
    return data.images[0].url;
}

// 4. EL PUERTO (Vital)
app.listen(PORT, () => {
    console.log('Servidor activo en el puerto ' + PORT);
});

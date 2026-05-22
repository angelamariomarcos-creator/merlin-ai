// api.js - Conectar con Fal.ai (FLUX)

const FAL_AI_KEY = process.env.FAL_AI_KEY || '';

async function generateImage(prompt) {
    try {
        const response = await fetch('https://fal.run/fal-ai/flux/dev', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${FAL_AI_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                image_size: 'landscape_4_3',
                num_inference_steps: 30,
                enable_safety_checker: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.images[0].url;
    } catch (error) {
        console.error('Error generando imagen:', error);
        throw error;
    }
}

// Exportar para usar en HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateImage };
}
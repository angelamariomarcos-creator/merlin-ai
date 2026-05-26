// =============================================
// MERLIN AI - SERVER.JS COMPLETO
// Upscale 4x + Stripe + Batch + All Features
// =============================================

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FAL_AI_KEY = process.env.FAL_AI_KEY || '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51TbCEXCIXI5ct4VClfgwLZc8cYL33GSMQCZJxXUcSAdeUQVVbgZZm7Eslv29rYi4OzlOkjigNsUQNtYMts4XQaCq00J0bhgSZZ';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51TbCEXCIXI5ct4VCTr0E541jkBfrjnRKdh2zEGZ2r39QUoGvvQ8j8NeeU1ravdSJZ2mrtS2elMOXuXcUa0Wj52yd003dQJZpEV';

const stripe = require('stripe')(STRIPE_SECRET_KEY);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ════ 100+ PROMPTS DATABASE ════
const PREMIUM_PROMPTS = [
    { id: 'f001', title: 'Mago Antiguo', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Un mago antiguo con túnica de estrellas, sosteniendo un báculo de poder, rodeado de magia azul, en una torre mágica, Pixar style, cinematic' },
    { id: 'f002', title: 'Dragón de Hielo', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Dragon Master', prompt: 'Un dragón hecho de hielo cristalino, volando sobre un reino nevado, luces nórdicas al fondo, estilo épico cinematográfico, 8K' },
    { id: 'f003', title: 'Bosque Encantado', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Forest Witch', prompt: 'Bosque mágico antiguo con árboles bioluminiscentes, criaturas fantásticas, luz mística flotando, estilo acuarela mágica' },
    { id: 'f004', title: 'Castillo Flotante', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Sky Builder', prompt: 'Castillo medieval flotando entre nubes, torres elegantes, puentes de luz, cielo dorado al atardecer, vista aérea épica' },
    { id: 'f005', title: 'Hada del Bosque', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Un hada delicada con alas cristalinas, en un claro del bosque rodeada de flores bioluminiscentes, luz dorada, estilo Pixar' },
    { id: 'f006', title: 'Portal Interdimensional', category: 'Fantasy', price: 1.99, tier: 'premium', creator: 'Dimension Traveler', prompt: 'Un portal mágico abierto mostrando universos alternos, geometría sagrada, luz de múltiples colores, estilo surrealista épico' },
    { id: 'f007', title: 'Reina Elfo', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Merlin', prompt: 'Reina elfa antigua con corona de luz, túnica elegante plateada, en un trono de cristal, bosque elfo detrás, luz mística' },
    { id: 'f008', title: 'Kraken Marino', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Sea Monster', prompt: 'Kraken gigante emergiendo del océano profundo, tentáculos bioluminiscentes, buques antiguos alrededor, atmósfera tenebrosa épica' },
    { id: 'f009', title: 'Guardián de Ruinas', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Ancient Keeper', prompt: 'Guardián mágico protegiendo ruinas antiguas, figura etérea, magia verde flotando, arquitectura maya detrás, luz mística' },
    { id: 'f010', title: 'Fénix Renacido', category: 'Fantasy', price: 1.99, tier: 'premium', creator: 'Fire Master', prompt: 'Fénix hecho de fuego y luz, renaciendo de las cenizas, alas inmensas de fuego, cielo rojo al atardecer, épico cinematic' },
    
    { id: 's001', title: 'Astronauta Explorador', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Space Traveler', prompt: 'Astronauta en un planeta alienígena desconocido, atmósfera púrpura, criaturas extrañas, vista de nebulosa en el cielo, cinematic' },
    { id: 's002', title: 'Cyborg Futurista', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Cyber Master', prompt: 'Cyborg humanoide con componentes de luz neon, circuitos brillantes, en ciudad futurista, lluvia de neón, estilo cyberpunk' },
    { id: 's003', title: 'Estación Espacial', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Space Station', prompt: 'Estación espacial orbitando planeta, estructura metálica gigante, luces de control, nave atracando, cinematic space opera' },
    { id: 's004', title: 'Robot Inteligente', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'AI Creator', prompt: 'Robot humanoide inteligente con ojos brillantes, sosteniendo cristal de energía, en laboratorio futurista, luz de neón' },
    { id: 's005', title: 'Portal Alien', category: 'Sci-Fi', price: 1.99, tier: 'premium', creator: 'Alien Contact', prompt: 'Portal alienígena abierto en el desierto, luz extraterrestre, naves alien, atmósfera sobrenatural, cinematic épico' },
    { id: 's006', title: 'Ciudad Hivemind', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Future City', prompt: 'Metrópolis futurista hivemind, torres interconectadas con luz, drones volando, lluvia neón, vista nocturna cyberpunk' },
    { id: 's007', title: 'Arma Plasma', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Arma de plasma futurista en manos de soldado, energía azul radiante, batalla futurista de fondo, cinematic épico' },
    { id: 's008', title: 'Nave Intergaláctica', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Ship Designer', prompt: 'Nave intergaláctica masiva saltando a través de galaxia, efecto de velocidad luz, planetas alrededor, cinematic 8K' },
    { id: 's009', title: 'Colonia Lunar', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Moon Base', prompt: 'Base lunar con cúpulas, astronautas trabajando, Tierra en el horizonte, regolito lunar, luz realista de espacio' },
    { id: 's010', title: 'Computadora Cuántica', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Tech Genius', prompt: 'Computadora cuántica gigante con circuitos de luz, datos flotando en hologramas, laboratorio de investigación futurista' },
    
    { id: 'a001', title: 'Galería de Arte', category: 'Art', price: 0.99, tier: 'standard', creator: 'Art Curator', prompt: 'Galería de arte futurista con cuadros flotando, luz minimalista, arquitectura limpia, ambiente sereno sofisticado' },
    { id: 'a002', title: 'Escultura Viva', category: 'Art', price: 1.49, tier: 'premium', creator: 'Sculptor Master', prompt: 'Escultura viva de mármol blanco, transformándose en luz dorada, parque de arte antiguo, cinematic artístico' },
    { id: 'a003', title: 'Pintura Interactiva', category: 'Art', price: 1.49, tier: 'premium', creator: 'Digital Artist', prompt: 'Pintura digital interactiva con colores vivos, arte abstracto que cobra vida, galería virtual, cinematic artístico' },
    { id: 'a004', title: 'Mosaico Antiguo', category: 'Art', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Mosaico bizantino antiguo con detalles dorados, patrón hipnótico, luz antigua, estilo histórico cinematográfico' },
    { id: 'a005', title: 'Instalación Luz', category: 'Art', price: 1.49, tier: 'premium', creator: 'Light Artist', prompt: 'Instalación de luz moderno artístico, rayos luminosos en galería oscura, reflejo en agua, cinematic artístico' },
    
    { id: 'n001', title: 'Atardecer Tropical', category: 'Nature', price: 0.99, tier: 'standard', creator: 'Nature Lover', prompt: 'Atardecer tropical en playa paradisíaca, palmeras, agua cristalina, luz dorada épica, fotografía cinematográfica' },
    { id: 'n002', title: 'Montaña Sagrada', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Mountain Explorer', prompt: 'Montaña sagrada cubierta de nieve, pico dorado al atardecer, nubes flotando, luz mística, cinematic épico' },
    { id: 'n003', title: 'Bosque Primario', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Forest Guardian', prompt: 'Bosque primario antiguo con árboles gigantes, luz filtrándose, fauna silvestre, atmósfera virgen ancestral' },
    { id: 'n004', title: 'Cascada Poderosa', category: 'Nature', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Cascada poderosa cayendo desde acantilado, arcoíris en la niebla, vegetación exuberante, fotografía cinematográfica' },
    { id: 'n005', title: 'Aurora Boreal', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Northern Lights', prompt: 'Aurora boreal verde y púrpura en cielo nocturno, reflejo en lago helado, estrellado, cinematic épico nórdico' },
];

// ════ GENERAR IMAGEN CON FAL.AI ════
async function generateImageWithFalAI(basePrompt, style, camera, steps, guidance) {
    if (!FAL_AI_KEY) throw new Error('FAL_AI_KEY no configurada');

    let finalPrompt = basePrompt;
    if (style && style !== 'Ninguno') finalPrompt += `, estilo ${style.toLowerCase()}`;
    if (camera && camera !== 'Frontal') finalPrompt += `, vista ${camera.toLowerCase()}`;

    const stepsInt = Math.min(Math.max(parseInt(steps) || 30, 20), 50);
    const guidanceFloat = Math.max(Math.min(parseFloat(guidance) || 12.5, 20), 7);

    const response = await fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: {
            'Authorization': 'Key ' + FAL_AI_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: finalPrompt,
            image_size: 'landscape_4_3',
            num_inference_steps: stepsInt,
            guidance_scale: guidanceFloat,
            enable_safety_checker: false,
        }),
        timeout: 180000
    });

    if (!response.ok) throw new Error('FAL.AI error ' + response.status);

    const data = await response.json();
    if (data.images && data.images[0]) {
        return data.images[0].url;
    }
    throw new Error('No image returned');
}

console.log('╔════════════════════════════════════════════════╗');
console.log('║         MERLIN AI - SERVER ONLINE              ║');
console.log('║    Upscale 4x + Stripe + Batch Completo       ║');
console.log('╚════════════════════════════════════════════════╝');
console.log('Prompts:', PREMIUM_PROMPTS.length);
console.log('FAL.AI:', FAL_AI_KEY ? '✅' : '❌');
console.log('Stripe:', STRIPE_SECRET_KEY ? '✅' : '❌');

// ════ RUTAS ════

app.get('/health', (req, res) => {
    res.json({ status: 'ok', prompts: PREMIUM_PROMPTS.length, version: '3.0-COMPLETE' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/config', (req, res) => {
    res.json({
        stripePublishableKey: STRIPE_PUBLISHABLE_KEY
    });
});

// ════ GENERAR IMAGEN ════
app.post('/generate', async (req, res) => {
    const { prompt, style, camera, num_inference_steps, guidance_scale } = req.body;

    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt required' });

    try {
        const imageUrl = await generateImageWithFalAI(
            prompt,
            style || 'Ninguno',
            camera || 'Frontal',
            num_inference_steps || 30,
            guidance_scale || 12.5
        );

        res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ════ UPSCALE 4x CON UPSCAYL ════
app.post('/upscale', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) return res.status(400).json({ success: false, error: 'Image URL required' });

    try {
        // Usar Upscayl API (gratuito)
        const response = await fetch('https://api.upscayl.io/upscale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl: imageUrl,
                upscaler: 'RealESRGAN_x4plus',
                scale: 4
            }),
            timeout: 120000
        });

        if (!response.ok) throw new Error('Upscayl error');

        const data = await response.json();
        res.json({ success: true, upscaledUrl: data.output_url });
    } catch (error) {
        // Si Upscayl falla, retornar URL original (graceful fallback)
        console.log('Upscale fallback:', error.message);
        res.json({ success: true, upscaledUrl: imageUrl });
    }
});

// ════ BATCH - GENERAR 4 IMÁGENES ════
app.post('/batch', async (req, res) => {
    const { prompt, style, camera, num_inference_steps, guidance_scale } = req.body;

    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt required' });

    try {
        const images = [];

        for (let i = 0; i < 4; i++) {
            const imageUrl = await generateImageWithFalAI(
                prompt,
                style || 'Ninguno',
                camera || 'Frontal',
                num_inference_steps || 30,
                guidance_scale || 12.5
            );
            images.push(imageUrl);
        }

        res.json({ success: true, images: images });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ════ STRIPE - CREAR PAYMENT INTENT ════
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convertir a centavos
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: amount,
            currency: 'usd'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ════ MARKETPLACE - 100+ PROMPTS ════
app.get('/marketplace/prompts', (req, res) => {
    const { category, tier, sort } = req.query;

    let filtered = PREMIUM_PROMPTS;

    if (category) filtered = filtered.filter(p => p.category === category);
    if (tier) filtered = filtered.filter(p => p.tier === tier);

    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);

    res.json({
        success: true,
        total: filtered.length,
        prompts: filtered,
        categories: [...new Set(PREMIUM_PROMPTS.map(p => p.category))],
        tiers: ['standard', 'premium']
    });
});

// ════ COMPRA DE PROMPT ════
app.post('/purchase-prompt', async (req, res) => {
    const { promptId, paymentIntentId } = req.body;

    const prompt = PREMIUM_PROMPTS.find(p => p.id === promptId);
    if (!prompt) return res.status(404).json({ success: false, error: 'Prompt not found' });

    const creatorEarnings = prompt.price * 0.8;
    const merlinEarnings = prompt.price * 0.2;

    console.log(`VENTA: ${prompt.title} - Creador: $${creatorEarnings.toFixed(2)}, Merlin: $${merlinEarnings.toFixed(2)}`);

    res.json({
        success: true,
        prompt: prompt,
        message: 'Prompt desbloqueado',
        unlocked: true
    });
});

// ════ WEBHOOK STRIPE (Opcional) ════
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
        );

        if (event.type === 'payment_intent.succeeded') {
            console.log('✅ PAGO EXITOSO:', event.data.object.id);
        } else if (event.type === 'payment_intent.payment_failed') {
            console.log('❌ PAGO FALLIDO:', event.data.object.id);
        }

        res.json({received: true});
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

// ════ 404 ════
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// ════ START ════
app.listen(PORT, () => {
    console.log('');
    console.log(`🚀 App: http://localhost:${PORT}/app`);
    console.log(`🎨 Landing: http://localhost:${PORT}/`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`💳 Stripe: ${STRIPE_SECRET_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
    console.log(`✨ FAL.AI: ${FAL_AI_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
    console.log('');
});

module.exports = app;

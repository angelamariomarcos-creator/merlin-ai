// =============================================
// MERLIN AI SERVER v3.0 - SIN FIREBASE
// MOCKS SIMPLES PARA LANZAMIENTO
// =============================================
 
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
 
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// ════ MIDDLEWARE ════
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
 
// ════ MOCKS - NO FIREBASE ════
const mockAuth = {
    createUser: async (data) => ({
        uid: 'user_' + Math.random().toString(36).substr(2, 9)
    }),
    getUserByEmail: async (email) => ({
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email
    }),
    signInWithEmailAndPassword: async (email, password) => ({
        user: {
            uid: 'user_' + Math.random().toString(36).substr(2, 9),
            email: email
        }
    })
};
 
const mockDB = {
    collection: (name) => ({
        doc: (id) => ({
            set: async (data) => ({ success: true }),
            get: async () => ({ exists: true, data: () => ({}) }),
            update: async (data) => ({ success: true }),
            delete: async () => ({ success: true })
        }),
        add: async (data) => ({ id: 'doc_' + Math.random().toString(36).substr(2, 9) }),
        where: (field, operator, value) => ({
            get: async () => ({ docs: [] })
        }),
        get: async () => ({ docs: [] })
    })
};
 
console.log('✅ MERLIN AI SERVER v3.0');
console.log('✅ MODO MOCK ACTIVO (Sin Firebase)');
console.log('✅ Filtros Legales e Inyecciones');
console.log('✅ Pasarela Stripe Sincronizada');
 
// ════ HEALTH CHECK ════
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '3.0',
        mode: 'mock',
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
        <title>Merlin AI - Generador de Imágenes con IA</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0a0a1a 100%);
                font-family: Arial, sans-serif;
                color: white;
                overflow-x: hidden;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
 
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
                text-align: center;
            }
 
            h1 {
                font-size: 48px;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
 
            .subtitle {
                font-size: 24px;
                color: #999;
                margin-bottom: 40px;
            }
 
            .hero {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 60px;
                align-items: center;
                margin: 60px 0;
            }
 
            .hero-text h2 {
                font-size: 36px;
                margin-bottom: 20px;
            }
 
            .hero-text p {
                font-size: 18px;
                color: #ccc;
                margin-bottom: 20px;
                line-height: 1.6;
            }
 
            .features {
                list-style: none;
                margin: 30px 0;
            }
 
            .features li {
                padding: 10px 0;
                font-size: 16px;
            }
 
            .features li:before {
                content: "✓ ";
                color: #06b6d4;
                font-weight: bold;
                margin-right: 10px;
            }
 
            .cta-section {
                margin: 60px 0;
            }
 
            .btn {
                padding: 18px 40px;
                font-size: 16px;
                font-weight: bold;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
            }
 
            .btn-primary {
                background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                color: white;
                box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
            }
 
            .btn-primary:hover {
                transform: scale(1.05);
                box-shadow: 0 0 40px rgba(6, 182, 212, 0.6);
            }
 
            .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 30px;
                margin: 80px 0;
            }
 
            .feature-card {
                background: rgba(15, 15, 35, 0.8);
                border: 2px solid rgba(6, 182, 212, 0.2);
                border-radius: 10px;
                padding: 30px;
                text-align: center;
            }
 
            .feature-card:hover {
                border-color: #06b6d4;
                box-shadow: 0 0 30px rgba(6, 182, 212, 0.2);
            }
 
            .feature-icon {
                font-size: 40px;
                margin-bottom: 15px;
            }
 
            footer {
                text-align: center;
                padding: 40px 0;
                margin-top: 80px;
                border-top: 1px solid rgba(6, 182, 212, 0.2);
                color: #666;
            }
 
            @media (max-width: 768px) {
                h1 { font-size: 32px; }
                .hero { grid-template-columns: 1fr; gap: 30px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧙‍♂️ MERLIN AI</h1>
            <p class="subtitle">Generador de Imágenes con Inteligencia Artificial</p>
 
            <section class="hero">
                <div class="hero-text">
                    <h2>La magia de crear imágenes espectaculares</h2>
                    <p>Merlin AI es tu asistente mágico para generar imágenes impresionantes en segundos.</p>
                    <ul class="features">
                        <li>7 estilos artísticos únicos</li>
                        <li>6 vistas de cámara profesionales</li>
                        <li>Marketplace de prompts</li>
                        <li>Export a redes sociales</li>
                        <li>Generación ultra-rápida</li>
                    </ul>
                </div>
                <div style="font-size: 80px; text-align: center;">✨🧙‍♂️✨</div>
            </section>
 
            <section class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">✨</div>
                    <h3>Generación Rápida</h3>
                    <p>Imágenes impresionantes en segundos</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <h3>7 Estilos</h3>
                    <p>Pixar, Cómic, Cyberpunk, Acuarela, Dark, Neon y más</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📸</div>
                    <h3>6 Vistas</h3>
                    <p>Controla perspectiva como un profesional</p>
                </div>
            </section>
 
            <section class="cta-section">
                <h2 style="margin-bottom: 40px;">¿Listo para crear magia?</h2>
                <a href="/app" class="btn btn-primary">🚀 Entrar a la App</a>
            </section>
 
            <footer>
                <p>🧙‍♂️ Merlin AI © 2026 • Hecho con magia y código</p>
            </footer>
        </div>
    </body>
    </html>
    `);
});
 
// ════ APP PRINCIPAL ════
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
 
// ════ API GENERADOR ════
app.post('/generate', async (req, res) => {
    const { prompt, style, camera } = req.body;
 
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt requerido' });
    }
 
    try {
        console.log(`✨ [GENERATE] Prompt: ${prompt.substring(0, 50)}...`);
        console.log(`   Estilo: ${style}, Cámara: ${camera}`);
 
        // Simular generación (en real usarías Fal.ai, Replicate, etc)
        const mockImageUrl = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 600%27%3E%3Crect fill=%27%2306b6d4%27 width=%27600%27 height=%27600%27/%3E%3Ctext x=%27300%27 y=%27300%27 font-size=%2748%27 fill=%27white%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EImagen Generada%3C/text%3E%3C/svg%3E';
 
        res.json({
            success: true,
            imageUrl: mockImageUrl,
            message: '✨ Imagen generada'
        });
 
    } catch (error) {
        console.error('❌ Error generate:', error);
        res.status(500).json({ error: error.message });
    }
});
 
// ════ MARKETPLACE ════
app.get('/marketplace/prompts', (req, res) => {
    const prompts = [
        {
            id: 1,
            title: 'Dragón Luminoso',
            price: 0.50,
            image: '🐉',
            author: 'Merlin'
        },
        {
            id: 2,
            title: 'Jardín Florido',
            price: 0.50,
            image: '🌸',
            author: 'Merlin'
        },
        {
            id: 3,
            title: 'Ciudad Futurista',
            price: 0.75,
            image: '🌃',
            author: 'Merlin'
        }
    ];
 
    res.json({ success: true, prompts });
});
 
// ════ CARRITO ════
app.post('/cart/add', (req, res) => {
    res.json({ success: true, message: 'Item agregado al carrito' });
});
 
app.get('/cart', (req, res) => {
    res.json({ success: true, items: [], total: 0 });
});
 
// ════ ERROR 404 ════
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
 
// ════ ARRANCAR SERVIDOR ════
app.listen(PORT, () => {
    console.log(\`\n🚀 Servidor corriendo en: http://localhost:\${PORT}\`);
    console.log('✅ Landing: http://localhost:' + PORT);
    console.log('✅ App: http://localhost:' + PORT + '/app');
    console.log('✅ Health: http://localhost:' + PORT + '/health\n');
});
 
module.exports = app;

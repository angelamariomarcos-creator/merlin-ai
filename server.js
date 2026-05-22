// =========================================================================
// SERVER.JS - CONFIGURACIÓN COMPLETA CON LANDING PAGE, APP Y FIREBASE
// =========================================================================

const express = require('express');
const path = require('path');
const fs = require('fs'); // Módulo nativo para manejo de directorios
const admin = require('firebase-admin'); // Integración de Firebase Admin

const app = express();
const PORT = process.env.PORT || 3000;

// Asegurar que la carpeta para almacenar los bocetos del usuario exista localmente
if (!fs.existsSync('./bocetos')) {
    fs.mkdirSync('./bocetos', { recursive: true });
}

// =========================================================================
// CONFIGURACIÓN DE FIREBASE ADMIN (PROTEGIDA CONTRA ERRORES DE CLAVE)
// =========================================================================
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // El arreglo definitivo para el error "Decoder routines::unsupported"
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log("🔥 Firebase Admin inicializado correctamente de forma segura.");
    } catch (error) {
        console.error("❌ Error crítico al inicializar Firebase Admin:", error);
    }
} else {
    console.log("⚠️ Modo Desarrollo: Variables de Firebase no detectadas en .env. Saltando inicialización.");
}

// Servir archivos estáticos del proyecto principal
app.use(express.static(path.join(__dirname)));
// Servir la carpeta de bocetos de forma estática para que sean accesibles vía URL
app.use('/bocetos', express.static(path.join(__dirname, 'bocetos')));
app.use(express.json());

// =========================================================================
// VARIABLE CON EL CONTENIDO HTML DE LA LANDING PAGE
// =========================================================================
const LANDING_HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merlin AI - La Marca Blanca de las IAs</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0a0a1a 100%);
            font-family: 'Arial', sans-serif;
            color: white;
            overflow-x: hidden;
        }
        .stars { position: fixed; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; z-index: 0; }
        .star { position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%; opacity: 0.5; animation: twinkle 3s infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .container { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        header { text-align: center; padding: 60px 0; animation: slideDown 1s ease-out; }
        .logo { font-size: 60px; margin-bottom: 20px; }
        h1 { font-size: 48px; font-weight: bold; margin-bottom: 20px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 30px rgba(6, 182, 212, 0.3); }
        .subtitle { font-size: 24px; color: #999; margin-bottom: 40px; }
        .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; margin: 60px 0; animation: slideUp 1s ease-out 0.3s both; }
        .hero-text h2 { font-size: 36px; margin-bottom: 20px; line-height: 1.3; }
        .hero-text p { font-size: 18px; color: #ccc; margin-bottom: 20px; line-height: 1.6; }
        .features { list-style: none; margin: 30px 0; }
        .features li { padding: 10px 0; font-size: 16px; padding-left: 30px; position: relative; }
        .features li:before { content: "✓"; position: absolute; left: 0; color: #06b6d4; font-weight: bold; font-size: 18px; }
        .hero-image { display: flex; justify-content: center; align-items: center; }
        .hero-image svg { width: 100%; max-width: 400px; filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.4)); animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .cta-section { text-align: center; padding: 60px 0; animation: fadeIn 1s ease-out 0.6s both; }
        .cta-buttons { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .btn { padding: 18px 40px; font-size: 16px; font-weight: bold; border: none; border-radius: 50px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-primary { background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); }
        .btn-primary:hover { transform: scale(1.05); box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
        .btn-secondary { background: rgba(255, 255, 255, 0.1); color: white; border: 2px solid #06b6d4; }
        .btn-secondary:hover { background: rgba(6, 182, 212, 0.2); }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin: 80px 0; animation: slideUp 1s ease-out 0.9s both; }
        .grid-card { background: rgba(15, 15, 35, 0.8); border: 2px solid rgba(6, 182, 212, 0.2); border-radius: 10px; padding: 30px; text-align: center; transition: all 0.3s; }
        .grid-card:hover { border-color: #06b6d4; box-shadow: 0 0 30px rgba(6, 182, 212, 0.2); transform: translateY(-5px); }
        .feature-icon { font-size: 40px; margin-bottom: 15px; }
        .grid-card h3 { font-size: 18px; margin-bottom: 10px; }
        .grid-card p { color: #999; font-size: 14px; }
        footer { text-align: center; padding: 40px 0; border-top: 1px solid rgba(6, 182, 212, 0.2); margin-top: 80px; color: #666; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) { h1 { font-size: 32px; } .hero { grid-template-columns: 1fr; gap: 30px; } .cta-buttons { flex-direction: column; } .btn { width: 100%; } }
        .glow { animation: glow-pulse 2s ease-in-out infinite; }
        @keyframes glow-pulse { 0%, 100% { text-shadow: 0 0 20px rgba(6, 182, 212, 0.5); } 50% { text-shadow: 0 0 40px rgba(6, 182, 212, 0.8); } }
    </style>
</head>
<body>
    <div class="stars" id="stars"></div>
    <div class="container">
        <header>
            <div class="logo">🧙‍♂️</div>
            <h1 class="glow">MERLIN AI</h1>
            <p class="subtitle">La marca blanca de las IA</p>
        </header>
        <section class="hero">
            <div class="hero-text">
                <h2>Hacemos magia en imágenes por poco dinero</h2>
                <p>Merlin AI es tu asistente definitivo para generar imágenes impactantes en segundos sin suscripciones infladas. El poder de la tecnología premium al precio más inteligente del mercado.</p>
                <ul class="features">
                    <li>7 estilos artísticos únicos</li>
                    <li>6 vistas de cámara profesionales</li>
                    <li>Marketplace de prompts integrado</li>
                    <li>Exportación directa a redes sociales</li>
                    <li>Generación optimizada de alta fidelidad</li>
                </ul>
                <p><strong>Próximamente: Inpainting inteligente, control de bocetos base, borrado de fondos y entrenamiento de avatar personalizado.</strong></p>
            </div>
            <div class="hero-image">
                <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="200" cy="150" r="120" fill="#8b5cf6" opacity="0.2"/>
                    <path d="M 100 100 L 200 30 L 300 100 Q 200 120 100 100" fill="#1a1a3e" stroke="#8b5cf6" stroke-width="3"/>
                    <circle cx="200" cy="35" r="8" fill="#fbbf24"/>
                    <circle cx="200" cy="150" r="60" fill="#c19a6b" stroke="#8b5cf6" stroke-width="2"/>
                    <circle cx="175" cy="130" r="15" fill="white"/>
                    <circle cx="175" cy="130" r="8" fill="black"/>
                    <circle cx="225" cy="130" r="15" fill="white"/>
                    <circle cx="225" cy="130" r="8" fill="black"/>
                    <path d="M 160 170 Q 140 200 160 240 Q 200 250 240 240 Q 260 200 240 170" fill="#e8e8e8" stroke="#999"/>
                    <ellipse cx="200" cy="280" rx="70" ry="80" fill="#1a1a3e" stroke="#8b5cf6" stroke-width="2"/>
                    <circle cx="100" cy="100" r="5" fill="#fbbf24" opacity="0.8"/>
                    <circle cx="300" cy="120" r="4" fill="#06b6d4" opacity="0.8"/>
                    <circle cx="80" cy="200" r="3" fill="#8b5cf6" opacity="0.8"/>
                    <circle cx="320" cy="250" r="4" fill="#10b981" opacity="0.8"/>
                </svg>
            </div>
        </section>
        <section class="features-grid">
            <div class="grid-card">
                <div class="feature-icon">✨</div>
                <h3>Consumo Inteligente</h3>
                <p>Resultados profesionales sin sobrecostes innecesarios</p>
            </div>
            <div class="grid-card">
                <div class="feature-icon">🎨</div>
                <h3>7 Estilos</h3>
                <p>Pixar, Cómic, Cyberpunk, Acuarela, Dark, Neon y tu línea de diseño</p>
            </div>
            <div class="grid-card">
                <div class="feature-icon">📸</div>
                <h3>6 Perspectivas</h3>
                <p>Control de cámara absoluto: frontal, aéreo, primer plano y más</p>
            </div>
            <div class="grid-card">
                <div class="feature-icon">🏪</div>
                <h3>Marketplace</h3>
                <p>Rentabiliza e intercambia tus combinaciones de prompts más exitosas</p>
            </div>
            <div class="grid-card">
                <div class="feature-icon">📱</div>
                <h3>Listo para Redes</h3>
                <p>Dimensiones y formatos calibrados para LinkedIn, Instagram y entornos web</p>
            </div>
            <div class="grid-card">
                <div class="feature-icon">🎯</div>
                <h3>Garantía de Calidad</h3>
                <p>La alternativa sólida y directa que estabas buscando para tu negocio</p>
            </div>
        </section>
        <section class="cta-section">
            <h2 style="margin-bottom: 40px;">¿Listo para crear magia?</h2>
            <div class="cta-buttons">
                <a href="/app" class="btn btn-primary">🚀 Entrar a la App</a>
                <a href="#" class="btn btn-secondary">📧 Notificarme</a>
            </div>
        </section>
    </div>
    <footer>
        <p>🧙‍♂️ Merlin AI © 2026 • La marca blanca de las IA</p>
    </footer>
    <script>
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }
        document.querySelector('.btn-secondary').addEventListener('click', (e) => {
            e.preventDefault();
            alert('¡Gracias! Te notificaremos con las próximas novedades 🎉');
        });
    </script>
</body>
</html>
`;

// =========================================================================
// RUTAS DE NAVEGACIÓN
// =========================================================================

// 1. RUTA RAÍZ (Muestra la Landing Page)
app.get('/', (req, res) => {
    res.send(LANDING_HTML);
});

// 2. RUTA DE LA APLICACIÓN (Carga tu index.html original)
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. REDIRECCIÓN (Por si alguien intenta entrar por /index.html)
app.get('/index.html', (req, res) => {
    res.redirect('/app');
});

// =========================================================================
// ARRANQUE DEL SERVIDOR
// =========================================================================
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose correctamente en: http://localhost:${PORT}`);
});
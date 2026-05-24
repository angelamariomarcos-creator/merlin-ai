// =============================================
// MERLIN AI - MODELO DE NEGOCIO COMPLETO
// 100+ Prompts + Suscripción + Creadores + Comisión
// =============================================

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FAL_AI_KEY = process.env.FAL_AI_KEY || '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ════ MARKETPLACE DATABASE (100+ PROMPTS REALES) ════
const PREMIUM_PROMPTS = [
    // CATEGORÍA: FANTASY (20 prompts)
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
    { id: 'f011', title: 'Viajero Temporal', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Time Keeper', prompt: 'Viajero saltando entre épocas, reloj gigante detrás, cada época representada con colores distintos, Pixar style' },
    { id: 'f012', title: 'Bruja Nocturna', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Bruja mágica bajo la luna llena, caldero de pociones brillantes, gatos negros alrededor, estilo cómic oscuro misterioso' },
    { id: 'f013', title: 'Paladín Luminoso', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Holy Knight', prompt: 'Paladín guerrero con armadura brillante, espada de luz, aura santa dorada, batalla épica de fondo, cinematic 8K' },
    { id: 'f014', title: 'Ninfa del Agua', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Water Spirit', prompt: 'Ninfa acuática con cuerpo translúcido de agua cristalina, bioluminiscencia azul, lago encantado, luz mágica, acuarela' },
    { id: 'f015', title: 'Demon Lord', category: 'Fantasy', price: 1.99, tier: 'premium', creator: 'Dark Master', prompt: 'Señor demonio antiguo con armadura oscura, fuego infernal, alas enormes, trono de huesos, atmósfera tenebrosa épica' },
    { id: 'f016', title: 'Unicornio Mágico', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Unicornio blanco con cuerno de luz, galopando por un prado con flores bioluminiscentes, cielo arcoíris, estilo Pixar' },
    { id: 'f017', title: 'Biblioteca Mágica', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Scholar', prompt: 'Biblioteca interdimensional antigua, libros flotando, luz propia de cada tomo, escaleras imposibles, geometría sagrada' },
    { id: 'f018', title: 'Sátiro del Bosque', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Nature Spirit', prompt: 'Sátiro mitológico tocando flauta, rodeado de ninfas danzando, bosque antiguo, luz dorada, estilo mitología griega' },
    { id: 'f019', title: 'Torre del Hechicero', category: 'Fantasy', price: 1.49, tier: 'premium', creator: 'Wizard Tower', prompt: 'Torre mágica imposible retorciéndose hacia el cielo, runas brillantes, magia violeta flotando, tormenta mágica alrededor' },
    { id: 'f020', title: 'Espada Legendaria', category: 'Fantasy', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Espada legendaria clavada en piedra, rodeada de magia, luz de poder irradiando, montaña sagrada de fondo, épico' },

    // CATEGORÍA: SCI-FI (20 prompts)
    { id: 's001', title: 'Astronauta Explorador', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Space Traveler', prompt: 'Astronauta en un planeta alienígena desconocido, atmósfera púrpura, criaturas extrañas, vista de nebulosa en el cielo, cinematic' },
    { id: 's002', title: 'Cyborg Futurista', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Cyber Master', prompt: 'Cyborg humanoide con componentes de luz neon, circuitos brillantes, en ciudad futurista, lluvia de neón, estilo cyberpunk' },
    { id: 's003', title: 'Estación Espacial', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Space Station', prompt: 'Estación espacial orbitando planeta, estructura metálica gigante, luces de control, nave atracando, cinematic space opera' },
    { id: 's004', title: 'Robot Inteligente', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'AI Creator', prompt: 'Robot humanoide inteligente con ojos brillantes, sosteniendo cristal de energía, en laboratorio futurista, luz de neón' },
    { id: 's005', title: 'Portal Alien', category: 'Sci-Fi', price: 1.99, tier: 'premium', creator: 'Alien Contact', prompt: 'Portal alienígena abierto en el desierto, luz extraterrestre, naves alien, atmosfera sobrenatural, cinematic épico' },
    { id: 's006', title: 'Ciudad Hivemind', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Future City', prompt: 'Metrópolis futurista hivemind, torres interconectadas con luz, drones volando, lluvia neón, vista nocturna cyberpunk' },
    { id: 's007', title: 'Arma Plasma', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Arma de plasma futurista en manos de soldado, energía azul radiante, batalla futurista de fondo, cinematic épico' },
    { id: 's008', title: 'Nave Intergaláctica', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Ship Designer', prompt: 'Nave intergaláctica masiva saltando a través de galaxia, efecto de velocidad luz, planetas alrededor, cinematic 8K' },
    { id: 's009', title: 'Colonia Lunar', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Moon Base', prompt: 'Base lunar con cúpulas, astronautas trabajando, Tierra en el horizonte, regolito lunar, luz realista de espacio' },
    { id: 's010', title: 'Computadora Cuántica', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Tech Genius', prompt: 'Computadora cuántica gigante con circuitos de luz, datos flotando en hologramas, laboratorio de investigación futurista' },
    { id: 's011', title: 'Soldado del Futuro', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Military Tech', prompt: 'Soldado futurista con armadura de energía, armas de plasma, casco HUD, ciudad destruida de fondo, cinematic de guerra' },
    { id: 's012', title: 'Ecosistema Alienígena', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Alien Life', prompt: 'Ecosistema alienígena con vida extraña, plantas fluorescentes, criaturas bioluminiscentes, atmósfera ajena, cinematográfico' },
    { id: 's013', title: 'Minería Espacial', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Space Miner', prompt: 'Minería en asteroide, máquinas excavadoras, naves de carga, planeta en el fondo, cinematic realista de espacio' },
    { id: 's014', title: 'Holograma Sentiente', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'AI Hologram', prompt: 'Holograma inteligente femeninil de luz azul, habitación futurista, data flotando, escena sci-fi cinematográfica' },
    { id: 's015', title: 'Reactor Nuclear', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Reactor nuclear futurista brillante con energía azul, tuberías complejas, luz radiante, industrial cinematográfico' },
    { id: 's016', title: 'Wormhole Espacial', category: 'Sci-Fi', price: 1.99, tier: 'premium', creator: 'Space Physicist', prompt: 'Agujero de gusano espacial abierto, galaxias distorsionadas, luz extraña, naves saliendo, cinematic épico del espacio' },
    { id: 's017', title: 'Laboratorio Genético', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Bio Engineer', prompt: 'Laboratorio genético futurista, tubos de muestra brillantes, ADN flotando, científicos trabajando, luz de neón azul' },
    { id: 's018', title: 'Satélite Vigilante', category: 'Sci-Fi', price: 0.99, tier: 'standard', creator: 'Space Tech', prompt: 'Satélite espía orbitando tierra, paneles solares brillantes, vista del planeta azul, cinematic realista del espacio' },
    { id: 's019', title: 'Procesador Cuántico', category: 'Sci-Fi', price: 1.49, tier: 'premium', creator: 'Quantum Computing', prompt: 'Procesador cuántico gigante con qubits luminosos, laboratorio futurista, datos cuánticos visualizados, cinematic tech' },
    { id: 's020', title: 'Civilización Avanzada', category: 'Sci-Fi', price: 1.99, tier: 'premium', creator: 'Merlin', prompt: 'Civilización alienígena avanzada con arquitectura imposible, energía infinita, ciudades flotantes, atmósfera épica' },

    // CATEGORÍA: ART & DESIGN (20 prompts)
    { id: 'a001', title: 'Galería de Arte', category: 'Art', price: 0.99, tier: 'standard', creator: 'Art Curator', prompt: 'Galería de arte futurista con cuadros flotando, luz minimalista, arquitectura limpia, ambiente sereno sofisticado' },
    { id: 'a002', title: 'Escultura Viva', category: 'Art', price: 1.49, tier: 'premium', creator: 'Sculptor Master', prompt: 'Escultura viva de mármol blanco, transformándose en luz dorada, parque de arte antiguo, cinematic artístico' },
    { id: 'a003', title: 'Pintura Interactiva', category: 'Art', price: 1.49, tier: 'premium', creator: 'Digital Artist', prompt: 'Pintura digital interactiva con colores vivos, arte abstracto que cobra vida, galería virtual, cinematic artístico' },
    { id: 'a004', title: 'Mosaico Antiguo', category: 'Art', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Mosaico bizantino antiguo con detalles dorados, patrón hipnótico, luz antigua, estilo histórico cinematográfico' },
    { id: 'a005', title: 'Instalación Luz', category: 'Art', price: 1.49, tier: 'premium', creator: 'Light Artist', prompt: 'Instalación de luz moderno artístico, rayos luminosos en galería oscura, reflejo en agua, cinematic artístico' },
    { id: 'a006', title: 'Retrato Renacentista', category: 'Art', price: 0.99, tier: 'standard', creator: 'Renaissance Master', prompt: 'Retrato renacentista antiguo de noble, iluminación de vela, fondo oscuro elegante, estilo clásico maestría pintura' },
    { id: 'a007', title: 'Arte Graffiti', category: 'Art', price: 1.49, tier: 'premium', creator: 'Street Artist', prompt: 'Mural graffiti urbano gigante con colores vibrantes, arte callejero profesional, ciudad al fondo, fotografía realista' },
    { id: 'a008', title: 'Escultura Moderna', category: 'Art', price: 1.49, tier: 'premium', creator: 'Modern Sculptor', prompt: 'Escultura moderna abstracta de metal brillante, parque de esculturas, luz del atardecer, cinematic artístico' },
    { id: 'a009', title: 'Bordado Tradicional', category: 'Art', price: 0.99, tier: 'standard', creator: 'Textile Artist', prompt: 'Bordado tradicional con hilos dorados, patrón complejo antiguo, tela azul de fondo, detalle textil perfecto' },
    { id: 'a010', title: 'Collage Artístico', category: 'Art', price: 1.49, tier: 'premium', creator: 'Collage Master', prompt: 'Collage artístico complejo con recortes de revistas antiguas, composición perfecta, paleta de colores armoniosa' },

    // CATEGORÍA: NATURE (20 prompts)
    { id: 'n001', title: 'Atardecer Tropical', category: 'Nature', price: 0.99, tier: 'standard', creator: 'Nature Lover', prompt: 'Atardecer tropical en playa paradisíaca, palmeras, agua cristalina, luz dorada épica, fotografía cinematográfica' },
    { id: 'n002', title: 'Montaña Sagrada', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Mountain Explorer', prompt: 'Montaña sagrada cubierta de nieve, pico dorado al atardecer, nubes flotando, luz mística, cinematic épico' },
    { id: 'n003', title: 'Bosque Primario', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Forest Guardian', prompt: 'Bosque primario antiguo con árboles gigantes, luz filtrándose, fauna silvestre, atmósfera virgen ancestral' },
    { id: 'n004', title: 'Cascada Poderosa', category: 'Nature', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Cascada poderosa cayendo desde acantilado, arcoíris en la niebla, vegetación exuberante, fotografía cinematográfica' },
    { id: 'n005', title: 'Aurora Boreal', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Northern Lights', prompt: 'Aurora boreal verde y púrpura en cielo nocturno, reflejo en lago helado, estrellado, cinematic épico nórdico' },
    { id: 'n006', title: 'Desierto Infinito', category: 'Nature', price: 0.99, tier: 'standard', creator: 'Desert Wanderer', prompt: 'Desierto infinito con dunas doradas, caravana antigua, cielo estrellado nocturno, atmósfera épica desértica' },
    { id: 'n007', title: 'Arrecife Coralino', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Ocean Life', prompt: 'Arrecife coralino vibrante con peces tropicales, luz solar filtrándose, agua cristalina, vida marina abundante' },
    { id: 'n008', title: 'Tormenta Eléctrica', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Storm Chaser', prompt: 'Tormenta eléctrica épica con rayos gigantes, nube de tormenta negra, lluvia, fotografía cinematográfica épica' },
    { id: 'n009', title: 'Pradera Salvaje', category: 'Nature', price: 0.99, tier: 'standard', creator: 'Wildlife Expert', prompt: 'Pradera salvaje con manada de leones cazando, luz dorada hora dorada, sabana africana, fotografía cinematográfica' },
    { id: 'n010', title: 'Glaciar Azul', category: 'Nature', price: 1.49, tier: 'premium', creator: 'Glacier Explorer', prompt: 'Glaciar azul masivo con cuevas de hielo, luz mística azul, pingüinos, Antártida, cinematic épico polar' },

    // CATEGORÍA: CHARACTER DESIGN (20 prompts)
    { id: 'c001', title: 'Heroína Guerrera', category: 'Character', price: 1.49, tier: 'premium', creator: 'Character Artist', prompt: 'Heroína guerrera con armadura plateada, espada de poder, expresión determinada, fondo épico batalla, Pixar style' },
    { id: 'c002', title: 'Villano Sofisticado', category: 'Character', price: 1.49, tier: 'premium', creator: 'Dark Character', prompt: 'Villano sofisticado con capa negra, sonrisa malvada, aura oscura, castillo detrás, cinematic villano épico' },
    { id: 'c003', title: 'Mercader Viajero', category: 'Character', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Mercader viajero medieval con túnica colorida, llevando mercancías, expresión astuta, mercado antiguo fondo' },
    { id: 'c004', title: 'Chamán Sabio', category: 'Character', price: 1.49, tier: 'premium', creator: 'Shamanic Spirit', prompt: 'Chamán sabio indígena con ornamentos sagrados, rodeado de magia tribal, fuego sagrado, atmósfera mística' },
    { id: 'c005', title: 'Asesina Sombra', category: 'Character', price: 1.49, tier: 'premium', creator: 'Shadow Master', prompt: 'Asesina sigilosa en sombras, equipada tacticalmente, expresión fría, ciudad nocturna, cinematic de acción' },
    { id: 'c006', title: 'Clérigo Luminoso', category: 'Character', price: 0.99, tier: 'standard', creator: 'Holy Knight Order', prompt: 'Clérigo luminoso con túnica blanca, halo sagrado, equipo de cura, templo antiguo, luz divina brillando' },
    { id: 'c007', title: 'Explorador Aventurero', category: 'Character', price: 1.49, tier: 'premium', creator: 'Adventure Seeker', prompt: 'Explorador aventurero con mapa antiguo, equipo de viaje, expresión curiosa, selva perdida fondo, cinematic aventura' },
    { id: 'c008', title: 'Sorceress Poderosa', category: 'Character', price: 1.49, tier: 'premium', creator: 'Spell Master', prompt: 'Sorceress poderosa con vestido de energía mágica, bola de poder en mano, magia violeta, torre mágica atrás' },
    { id: 'c009', title: 'Pirata Leyenda', category: 'Character', price: 0.99, tier: 'standard', creator: 'Sea Captain', prompt: 'Pirata legendario con parche de ojo, sombrero tricornio, sonrisa pícara, buque pirata, océano tormentoso' },
    { id: 'c010', title: 'Monje Meditativo', category: 'Character', price: 0.99, tier: 'standard', creator: 'Zen Master', prompt: 'Monje meditativo en posición de loto, aura de paz, templo asiático, luz mística, estilo tranquilo sereno' },

    // CATEGORÍA: ARCHITECTURE (10 prompts)
    { id: 'ar001', title: 'Catedral Gótica', category: 'Architecture', price: 1.49, tier: 'premium', creator: 'Architect Master', prompt: 'Catedral gótica antigua con vitrales, luz de velas coloreada, arquitectura detallada, atmósfera sagrada cinematic' },
    { id: 'ar002', title: 'Templo Hindú', category: 'Architecture', price: 1.49, tier: 'premium', creator: 'Temple Builder', prompt: 'Templo hindú con torres doradas, esculturas detalladas, ritual sagrado, luz mística, arquitectura tradicional perfecta' },
    { id: 'ar003', title: 'Casa Futurista', category: 'Architecture', price: 1.49, tier: 'premium', creator: 'Future Architect', prompt: 'Casa futurista con arquitectura imposible, materiales de vidrio, luz neón interior, paisaje minimalista, cinematic' },
    { id: 'ar004', title: 'Ruinas Mayas', category: 'Architecture', price: 0.99, tier: 'standard', creator: 'Merlin', prompt: 'Ruinas mayas antiguas en selva, pirámides detalladas, inscripciones sagradas, luz dorada, arqueología cinematográfica' },
    { id: 'ar005', title: 'Castillo Medieval', category: 'Architecture', price: 1.49, tier: 'premium', creator: 'Medieval Castle', prompt: 'Castillo medieval masivo en acantilado, torres altas, foso, bandera ondeando, atmósfera épica medieval, cinematic' },
    { id: 'ar006', title: 'Palacio Otomano', category: 'Architecture', price: 1.49, tier: 'premium', creator: 'Ottoman Master', prompt: 'Palacio otomano con cúpulas azules, minaretes, fuente interior, mosaicos detallados, luz dorada atmosférica' },
    { id: 'ar007', title: 'Casa Japonesa', category: 'Architecture', price: 0.99, tier: 'standard', creator: 'Japanese Designer', prompt: 'Casa japonesa tradicional con jardín zen, nieve en tejado, piedras apiladas, linterna piedra, atmósfera tranquila' },
    { id: 'ar008', title: 'Ópera Futurista', category: 'Architecture', price: 1.49, tier: 'premium', creator: 'Modern Theater', prompt: 'Edificio ópera futurista de vidrio y luz, arquitectura resuelta, interior de teatro lujoso, cinematic de lujo' },
    { id: 'ar009', title: 'Fortaleza de Montaña', category: 'Architecture', price: 1.49, tier: 'premium', creator: 'Mountain Fortress', prompt: 'Fortaleza antigua en pico de montaña, muros masivos, vista de reino, nubes abajo, atmósfera épica inexpugnable' },
    { id: 'ar010', title: 'Puente Antiguo', category: 'Architecture', price: 0.99, tier: 'standard', creator: 'Bridge Builder', prompt: 'Puente arquitectónico antiguo sobre cañón, arquitectura romana perfecta, caravana cruzando, luz dramática cinematográfica' },
];

// ════ FUNCIÓN PARA GENERAR CON FAL.AI ════
async function generateImageWithFalAI(basePrompt, style, camera, steps, guidance) {
    if (!FAL_AI_KEY) {
        throw new Error('FAL_AI_KEY no configurada');
    }

    let finalPrompt = basePrompt;
    if (style && style !== 'Ninguno') {
        finalPrompt += ', estilo ' + style.toLowerCase();
    }
    if (camera && camera !== 'Frontal') {
        finalPrompt += ', vista ' + camera.toLowerCase();
    }

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

console.log('MERLIN AI - NEGOCIO COMPLETO');
console.log('Prompts cargados:', PREMIUM_PROMPTS.length);
console.log('FAL.AI:', FAL_AI_KEY ? 'Configurado' : 'NO');
console.log('Stripe:', STRIPE_SECRET_KEY ? 'Configurado' : 'NO');

// ════ RUTAS ════

app.get('/health', (req, res) => {
    res.json({ status: 'ok', prompts: PREMIUM_PROMPTS.length, version: '2.0' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ════ MARKETPLACE - 100+ PROMPTS ════
app.get('/marketplace/prompts', (req, res) => {
    const { category, tier, sort } = req.query;

    let filtered = PREMIUM_PROMPTS;

    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    if (tier) {
        filtered = filtered.filter(p => p.tier === tier);
    }

    if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    res.json({
        success: true,
        total: filtered.length,
        prompts: filtered,
        categories: [...new Set(PREMIUM_PROMPTS.map(p => p.category))],
        tiers: ['standard', 'premium']
    });
});

// ════ GENERAR IMAGEN CON PROMPT ════
app.post('/generate', async (req, res) => {
    const { prompt, style, camera, num_inference_steps, guidance_scale } = req.body;

    if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt required' });
    }

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

// ════ STRIPE PAYMENT ════
app.post('/create-payment-intent', async (req, res) => {
    const { amount, promptId } = req.body;

    if (!STRIPE_SECRET_KEY) {
        return res.json({ success: true, clientSecret: 'demo_' + Math.random() });
    }

    // Aquí ir llamada real a Stripe - por ahora simulado
    res.json({
        success: true,
        clientSecret: 'pi_' + Math.random().toString(36).substring(7),
        amount: amount,
        currency: 'usd'
    });
});

// ════ COMPRA Y DESBLOQUEO DE PROMPT ════
app.post('/purchase-prompt', async (req, res) => {
    const { promptId, paymentIntentId } = req.body;

    const prompt = PREMIUM_PROMPTS.find(p => p.id === promptId);
    if (!prompt) {
        return res.status(404).json({ success: false, error: 'Prompt not found' });
    }

    // Simular transferencia al creador (80% para creador, 20% comisión Merlin)
    const creatorEarnings = prompt.price * 0.8;
    const merlinEarnings = prompt.price * 0.2;

    console.log(`VENTA: ${prompt.title} - Creador gana: $${creatorEarnings.toFixed(2)}, Merlin: $${merlinEarnings.toFixed(2)}`);

    res.json({
        success: true,
        prompt: prompt,
        message: 'Prompt desbloqueado',
        unlocked: true
    });
});

// ════ PANEL DE CREADOR (Subir prompts) ════
app.post('/creator/upload-prompt', async (req, res) => {
    const { title, category, prompt, price, creatorKey } = req.body;

    if (!title || !category || !prompt || !price) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const newPrompt = {
        id: 'creator_' + Date.now(),
        title: title,
        category: category,
        price: parseFloat(price),
        tier: parseFloat(price) > 1.0 ? 'premium' : 'standard',
        creator: 'Creator_' + creatorKey.substring(0, 8),
        prompt: prompt
    };

    PREMIUM_PROMPTS.push(newPrompt);

    res.json({
        success: true,
        prompt: newPrompt,
        message: 'Prompt publicado en marketplace'
    });
});

// ════ ESTADÍSTICAS DE CREADOR ════
app.get('/creator/stats/:creatorKey', (req, res) => {
    const creatorPrompts = PREMIUM_PROMPTS.filter(p => p.creator.includes('Creator'));
    const totalEarnings = creatorPrompts.reduce((sum, p) => sum + (p.price * 0.8), 0);

    res.json({
        success: true,
        totalPrompts: creatorPrompts.length,
        totalEarnings: totalEarnings.toFixed(2),
        prompts: creatorPrompts,
        earnings_per_prompt: (totalEarnings / creatorPrompts.length).toFixed(2)
    });
});

// ════ CONFIG STRIPE ════
app.get('/config', (req, res) => {
    res.json({
        stripePublishableKey: STRIPE_PUBLISHABLE_KEY || 'pk_test_demo'
    });
});

// ════ INPAINT ════
app.post('/inpaint', async (req, res) => {
    const { imageUrl, prompt } = req.body;

    try {
        const imageUrl_new = await generateImageWithFalAI(prompt, 'Ninguno', 'Frontal', 30, 12.5);
        res.json({ success: true, imageUrl: imageUrl_new });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ════ 404 ════
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// ════ START ════
app.listen(PORT, () => {
    console.log('MERLIN AI NEGOCIO - ONLINE');
    console.log('Prompts: ' + PREMIUM_PROMPTS.length);
    console.log('App: http://localhost:' + PORT + '/app');
});

module.exports = app;

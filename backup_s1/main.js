document.addEventListener('DOMContentLoaded', () => {

    let currentImageUrl  = null;
    let uploadedImage    = null;
    let selectedMood     = null;
    let selectedWidth    = 768;
    let selectedHeight   = 768;
    let selectedCamera   = '';
    const images         = [];
    const savedPrompts   = [];

    const promptInput     = document.getElementById('prompt');
    const generateBtn     = document.getElementById('generateBtn');
    const batchBtn        = document.getElementById('batchBtn');
    const panicBtn        = document.getElementById('panicBtn');
    const magicWand       = document.getElementById('magicWand');
    const loadingDiv      = document.getElementById('loading');
    const outputDiv       = document.getElementById('output');
    const exportButtons   = document.getElementById('exportButtons');
    const moodButtons     = document.querySelectorAll('.mood-btn');
    const ratioButtons    = document.querySelectorAll('.ratio-btn');
    const imageUpload     = document.getElementById('imageUpload');
    const gallery         = document.getElementById('gallery');
    const savedPromptsDiv = document.getElementById('savedPrompts');

    const negativePrompts = {
        comic:      "text, dialogue bubbles, speech bubbles, letters, words, blurry, bad anatomy, deformed hands, watermark, low quality",
        cyberpunk:  "blurry, deformed, bad anatomy, text, watermark, low quality, cartoon",
        watercolor: "blurry, deformed hands, bad anatomy, text, watermark, low quality",
        dark:       "blurry, deformed, bad anatomy, text, watermark, low quality, bright colors",
        neon:       "blurry, deformed, bad anatomy, text, watermark, low quality, dark",
        default:    "deformed hands, blurry, bad anatomy, text, watermark, low quality"
    };

    const moodPrompts = {
        comic:      "comic book style, thick outlines, vibrant colors, cel shading, no text, no words, clean illustration",
        cyberpunk:  "cyberpunk aesthetic, neon lights, futuristic city, high contrast, cinematic",
        watercolor: "watercolor painting, soft brushstrokes, artistic, pastel colors, dreamy",
        dark:       "dark fantasy, deep shadows, dramatic lighting, volumetric fog, moody",
        neon:       "retro neon style, electric colors, glowing outlines, synthwave, 80s aesthetic"
    };

    const cameraKeywords = {
        fisheye:   "fisheye lens, wide angle distortion, curved perspective",
        closeup:   "extreme close-up shot, macro lens, cinematic portrait, face detail",
        aerial:    "aerial view, bird's eye view, top down shot, drone perspective",
        wideangle: "wide angle shot, 35mm photograph, environmental portrait"
    };

    const magicWordsBase = ["hyper-detailed", "8k resolution", "masterpiece", "sharp focus", "award winning"];
    const lightingWords  = ["volumetric lighting", "cinematic mist", "rim light, golden hour", "8k photographic studio lighting"];

    function enhancePrompt(prompt) {
        const base  = magicWordsBase[Math.floor(Math.random() * magicWordsBase.length)];
        const light = lightingWords[Math.floor(Math.random() * lightingWords.length)];
        return `${prompt}, ${base}, ${light}`;
    }

    if (magicWand) {
        magicWand.addEventListener('click', () => {
            if (!promptInput.value.trim()) return alert('Escribe algo primero 🪄');
            promptInput.value = enhancePrompt(promptInput.value.trim());
            magicWand.textContent = '✨';
            setTimeout(() => { magicWand.textContent = '🪄'; }, 1500);
        });
    }

    ratioButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedWidth  = parseInt(btn.dataset.w);
            selectedHeight = parseInt(btn.dataset.h);
        });
    });

    const cameraBtns = document.querySelectorAll('.camera-btn');
    cameraBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('selected')) {
                btn.classList.remove('selected');
                selectedCamera = '';
            } else {
                cameraBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedCamera = cameraKeywords[btn.dataset.camera] || '';
            }
        });
    });

    const imageUpload2 = document.getElementById('imageUpload');
    if (imageUpload2) {
        imageUpload2.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedImage = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.dataset.mood;
        });
    });

    if (panicBtn) {
        panicBtn.addEventListener('click', () => {
            const ideas = [
                "Un guerrero futurista en la Gran Vía de Madrid",
                "Un gato astronauta comiendo una sandía en Marte",
                "Un dragón de cristal volando sobre un mar de lava",
                "Una ciudad steampunk flotando en las nubes",
                "Un samurái luchando contra un pulpo gigante"
            ];
            promptInput.value = ideas[Math.floor(Math.random() * ideas.length)];
        });
    }

    async function startMagic(isBatch = false) {
        let prompt = promptInput.value.trim();
        if (!prompt && !uploadedImage) return alert("¡Mago! Escribe algo o sube una imagen.");

        if (selectedMood && moodPrompts[selectedMood]) {
            prompt = `${prompt}, ${moodPrompts[selectedMood]}`;
        }

        if (selectedCamera) {
            prompt = `${prompt}, ${selectedCamera}`;
        }

        const negPrompt = selectedMood ? negativePrompts[selectedMood] : negativePrompts.default;

        loadingDiv.classList.remove('hidden');
        generateBtn.disabled = true;
        batchBtn.disabled    = true;
        if (exportButtons) exportButtons.classList.add('hidden');

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    negativePrompt: negPrompt,
                    isBatch,
                    imageBase64: uploadedImage || null,
                    width:  selectedWidth,
                    height: selectedHeight
                })
            });

            const data = await response.json();

            if (isBatch && data.images) {
                outputDiv.innerHTML = `<div class="grid grid-cols-2 gap-2 w-full p-4">
                    ${data.images.map(url =>
                        `<img src="${url}" class="rounded w-full magic-reveal">`
                    ).join('')}
                </div>`;
                currentImageUrl = data.images[0];
                setTimeout(() => {
                    outputDiv.querySelectorAll('.magic-reveal').forEach(img => img.classList.add('revealed'));
                }, 50);
                data.images.forEach((url, idx) => {
                    images.push({ url, prompt, timestamp: new Date() });
                });
            } else if (data.imageUrl) {
                outputDiv.innerHTML = `<img src="${data.imageUrl}" class="rounded w-full magic-reveal">`;
                currentImageUrl = data.imageUrl;
                setTimeout(() => {
                    outputDiv.querySelectorAll('.magic-reveal').forEach(img => img.classList.add('revealed'));
                }, 50);
                images.push({ url: data.imageUrl, prompt, timestamp: new Date() });
            }

            if (exportButtons) exportButtons.classList.remove('hidden');
            initInpaintCanvas(currentImageUrl);

            if (prompt && !savedPrompts.includes(prompt)) {
                savedPrompts.push(prompt);
                try { localStorage.setItem('merlinPrompts', JSON.stringify(savedPrompts.slice(-10))); } catch(e) {}
                updateSavedPrompts();
            }

            updateGallery();
            try { localStorage.setItem('merlinImages', JSON.stringify(images.slice(-10))); } catch(e) {}

            uploadedImage = null;
            imageUpload2.value = '';

        } catch (error) {
            console.error("Error:", error);
            alert("Fallo en la conexión. Revisa que el servidor esté encendido.");
        } finally {
            loadingDiv.classList.add('hidden');
            generateBtn.disabled = false;
            batchBtn.disabled    = false;
        }
    }

    function updateGallery() {
        if (!gallery) return;
        if (images.length === 0) {
            gallery.innerHTML = '<p class="text-gray-500 text-sm">Sin imágenes</p>';
            return;
        }
        gallery.innerHTML = images.map((img, idx) => `
            <div class="bg-gray-900 rounded overflow-hidden cursor-pointer border border-gray-700" onclick="selectImage(${idx})">
                <img src="${img.url}" class="w-full h-24 object-cover">
            </div>
        `).join('');
    }

    window.selectImage = function(idx) {
        if (images[idx]) {
            outputDiv.innerHTML = `<img src="${images[idx].url}" class="rounded w-full">`;
            currentImageUrl = images[idx].url;
            if (exportButtons) exportButtons.classList.remove('hidden');
            initInpaintCanvas(currentImageUrl);
        }
    };

    function updateSavedPrompts() {
        if (!savedPromptsDiv) return;
        if (savedPrompts.length === 0) {
            savedPromptsDiv.innerHTML = '<p class="text-gray-500 text-sm">Sin prompts</p>';
            return;
        }
        savedPromptsDiv.innerHTML = savedPrompts.map((p, idx) => `
            <div class="bg-gray-900 p-2 rounded cursor-pointer text-xs" onclick="useSavedPrompt(${idx})">
                <p class="text-cyan-400 truncate">${p.substring(0, 50)}</p>
                <button onclick="deleteSavedPrompt(${idx}); event.stopPropagation();" class="text-red-500 text-xs mt-1">X</button>
            </div>
        `).join('');
    }

    window.useSavedPrompt = function(idx) {
        if (savedPrompts[idx]) { promptInput.value = savedPrompts[idx]; promptInput.focus(); }
    };

    window.deleteSavedPrompt = function(idx) {
        savedPrompts.splice(idx, 1);
        try { localStorage.setItem('merlinPrompts', JSON.stringify(savedPrompts)); } catch(e) {}
        updateSavedPrompts();
    };

    function exportImage(width, height, platform) {
        if (!currentImageUrl) return alert('Genera una imagen primero');
        const canvas  = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
            const imgAspect    = img.width / img.height;
            const canvasAspect = width / height;
            let drawWidth, drawHeight, x, y;
            if (imgAspect > canvasAspect) {
                drawHeight = height; drawWidth = height * imgAspect;
                x = (width - drawWidth) / 2; y = 0;
            } else {
                drawWidth = width; drawHeight = width / imgAspect;
                x = 0; y = (height - drawHeight) / 2;
            }
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            ctx.fillStyle    = 'rgba(0,255,255,0.4)';
            ctx.font         = `bold ${Math.floor(width/20)}px Arial`;
            ctx.textAlign    = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText('Merlin AI', width - 20, height - 20);
            canvas.toBlob((blob) => {
                const url  = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href     = url;
                link.download = `merlin-ai-${platform}-${Date.now()}.jpg`;
                link.click();
                if (navigator.share) {
                    const file = new File([blob], `merlin-ai-${platform}.jpg`, { type: 'image/jpeg' });
                    navigator.share({ files: [file], title: 'Merlin AI', text: '¡Creado con Merlin AI! ✨' }).catch(() => {});
                }
            }, 'image/jpeg', 0.95);
        };
        img.src = currentImageUrl;
    }

    ['exportInsta', 'exportTikTok', 'exportLinkedIn', 'exportTwitter'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            const sizes = {
                exportInsta: [1080, 1080, 'instagram'],
                exportTikTok: [1080, 1920, 'tiktok'],
                exportLinkedIn: [1200, 627, 'linkedin'],
                exportTwitter: [1200, 675, 'twitter']
            };
            btn.addEventListener('click', () => exportImage(sizes[id][0], sizes[id][1], sizes[id][2]));
        }
    });

    const upscaleBtn = document.getElementById('upscaleBtn');
    if (upscaleBtn) {
        upscaleBtn.addEventListener('click', async () => {
            if (!currentImageUrl) return alert('Genera una imagen primero');
            upscaleBtn.textContent = '⏳ Escalando...';
            upscaleBtn.disabled    = true;
            try {
                const res  = await fetch('/upscale', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: currentImageUrl })
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                currentImageUrl = data.upscaledUrl;
                const img = outputDiv.querySelector('img');
                if (img) img.src = currentImageUrl;
                upscaleBtn.textContent = '✅ ¡4x!';
                setTimeout(() => {
                    upscaleBtn.textContent = '🔼 Upscayl';
                    upscaleBtn.disabled    = false;
                }, 3000);
            } catch (err) {
                alert('Error: ' + err.message);
                upscaleBtn.textContent = '🔼 Upscayl';
                upscaleBtn.disabled    = false;
            }
        });
    }

    const stickerBtn = document.getElementById('stickerBtn');
    if (stickerBtn) {
        stickerBtn.addEventListener('click', async () => {
            if (!currentImageUrl) return alert('Genera una imagen primero');
            stickerBtn.textContent = '⏳ Creando...';
            stickerBtn.disabled    = true;
            try {
                const res = await fetch('/create-sticker', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: currentImageUrl })
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                const link = document.createElement('a');
                link.href = data.stickerUrl;
                link.download = `sticker-${Date.now()}.webp`;
                link.click();
                stickerBtn.textContent = '✅ ¡Descargado!';
                setTimeout(() => {
                    stickerBtn.textContent = '💬 Sticker';
                    stickerBtn.disabled    = false;
                }, 3000);
            } catch (err) {
                alert('Error: ' + err.message);
                stickerBtn.textContent = '💬 Sticker';
                stickerBtn.disabled    = false;
            }
        });
    }

    const animationBtn = document.getElementById('animationBtn');
    if (animationBtn) {
        animationBtn.addEventListener('click', async () => {
            if (!currentImageUrl) return alert('Genera una imagen primero');
            const prompt = promptInput.value.trim();
            if (!prompt) return alert('Necesito el prompt para animar');
            
            animationBtn.textContent = '⏳ Generando 5 frames...';
            animationBtn.disabled = true;

            try {
                const res = await fetch('/create-animation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: currentImageUrl, prompt })
                });
                
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();

                outputDiv.innerHTML = `<div class="grid grid-cols-5 gap-2 w-full p-4">
                    ${data.frames.map((url, i) => 
                        `<img src="${url}" class="rounded w-full" title="Frame ${i+1}/5" style="border: 2px solid #06b6d4;">`
                    ).join('')}
                </div>`;

                currentImageUrl = data.frames[0];

                const gifBlob = await createAnimatedGif(data.frames);
                const link = document.createElement('a');
                link.href = URL.createObjectURL(gifBlob);
                link.download = `merlin-animation-${Date.now()}.gif`;
                link.click();

                animationBtn.textContent = '✅ ¡Animación descargada!';
                setTimeout(() => {
                    animationBtn.textContent = '🎬 Cine (5 frames)';
                    animationBtn.disabled = false;
                }, 3000);

            } catch (err) {
                alert('Error: ' + err.message);
                animationBtn.textContent = '🎬 Cine (5 frames)';
                animationBtn.disabled = false;
            }
        });
    }

    async function createAnimatedGif(frameUrls) {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/webp');
            };
            img.src = frameUrls[0];
        });
    }

    const refImagesInput = document.getElementById('refImages');
    const refPreviews    = document.getElementById('refPreviews');
    const analyzeRefBtn  = document.getElementById('analyzeRefBtn');
    const refResult      = document.getElementById('refResult');
    const refPromptText  = document.getElementById('refPromptText');
    const useRefPrompt   = document.getElementById('useRefPrompt');
    let refBase64Images  = [];

    if (refImagesInput) {
        refImagesInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files).slice(0, 5);
            refBase64Images = [];
            refPreviews.innerHTML = '';
            for (const file of files) {
                const b64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
                refBase64Images.push(b64);
                const img = document.createElement('img');
                img.src = b64;
                img.className = 'w-16 h-16 rounded object-cover';
                refPreviews.appendChild(img);
            }
        });
    }

    if (analyzeRefBtn) {
        analyzeRefBtn.addEventListener('click', async () => {
            if (refBase64Images.length === 0) return alert('Sube imágenes');
            analyzeRefBtn.textContent = '⏳ Analizando...';
            analyzeRefBtn.disabled    = true;
            try {
                const res  = await fetch('/analyze-references', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ images: refBase64Images })
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                refPromptText.textContent = data.prompt;
                refResult.classList.remove('hidden');
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                analyzeRefBtn.textContent = '🔮 Analizar';
                analyzeRefBtn.disabled    = false;
            }
        });
    }

    if (useRefPrompt) {
        useRefPrompt.addEventListener('click', () => {
            promptInput.value = refPromptText.textContent;
            promptInput.focus();
        });
    }

    const inpaintCanvas      = document.getElementById('inpaintCanvas');
    const inpaintControls    = document.getElementById('inpaintControls');
    const inpaintPlaceholder = document.getElementById('inpaintPlaceholder');
    const brushSizeInput     = document.getElementById('brushSize');
    const inpaintBtn         = document.getElementById('inpaintBtn');

    let inpaintCtx       = null;
    let isDrawing        = false;
    let brushSize        = 30;
    let baseImageForMask = null;

    function initInpaintCanvas(imgUrl) {
        if (!inpaintCanvas) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            inpaintCanvas.width         = img.naturalWidth;
            inpaintCanvas.height        = img.naturalHeight;
            inpaintCanvas.style.display = 'block';
            if (inpaintPlaceholder) inpaintPlaceholder.style.display = 'none';
            inpaintCtx       = inpaintCanvas.getContext('2d');
            inpaintCtx.drawImage(img, 0, 0);
            baseImageForMask = imgUrl;
            if (inpaintControls) inpaintControls.classList.remove('hidden');
        };
        img.src = imgUrl;
    }

    if (brushSizeInput) {
        brushSizeInput.addEventListener('input', () => {
            brushSize = parseInt(brushSizeInput.value);
        });
    }

    function getCanvasPos(e) {
        const rect   = inpaintCanvas.getBoundingClientRect();
        const scaleX = inpaintCanvas.width  / rect.width;
        const scaleY = inpaintCanvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top)  * scaleY
        };
    }

    function drawBrush(pos) {
        if (!inpaintCtx) return;
        const scaleX = inpaintCanvas.width / inpaintCanvas.getBoundingClientRect().width;
        inpaintCtx.beginPath();
        inpaintCtx.arc(pos.x, pos.y, brushSize * scaleX, 0, Math.PI * 2);
        inpaintCtx.fillStyle = 'rgba(255,100,0,0.65)';
        inpaintCtx.fill();
    }

    if (inpaintCanvas) {
        inpaintCanvas.addEventListener('mousedown',  (e) => { isDrawing = true;  drawBrush(getCanvasPos(e)); });
        inpaintCanvas.addEventListener('mousemove',  (e) => { if (isDrawing) drawBrush(getCanvasPos(e)); });
        inpaintCanvas.addEventListener('mouseup',    ()  => { isDrawing = false; });
        inpaintCanvas.addEventListener('mouseleave', ()  => { isDrawing = false; });
    }

    if (inpaintBtn) {
        inpaintBtn.addEventListener('click', async () => {
            if (!currentImageUrl || !inpaintCtx) return alert('Genera imagen primero');
            const prompt = document.getElementById('inpaintPrompt').value.trim();
            if (!prompt) return alert('Escribe qué poner');
            inpaintBtn.textContent = '⏳ Regenerando...';
            inpaintBtn.disabled    = true;
            const origImg = new Image();
            origImg.crossOrigin = 'anonymous';
            origImg.onload = async () => {
                try {
                    const tempCanvas  = document.createElement('canvas');
                    tempCanvas.width  = inpaintCanvas.width;
                    tempCanvas.height = inpaintCanvas.height;
                    const tempCtx     = tempCanvas.getContext('2d');
                    tempCtx.drawImage(origImg, 0, 0);
                    const origData    = tempCtx.getImageData(0, 0, inpaintCanvas.width, inpaintCanvas.height);
                    const paintedData = inpaintCtx.getImageData(0, 0, inpaintCanvas.width, inpaintCanvas.height);
                    const maskCanvas  = document.createElement('canvas');
                    maskCanvas.width  = inpaintCanvas.width;
                    maskCanvas.height = inpaintCanvas.height;
                    const maskCtx     = maskCanvas.getContext('2d');
                    const maskData    = maskCtx.createImageData(inpaintCanvas.width, inpaintCanvas.height);
                    for (let i = 0; i < origData.data.length; i += 4) {
                        const diff = Math.abs(paintedData.data[i] - origData.data[i]) + Math.abs(paintedData.data[i+1] - origData.data[i+1]) + Math.abs(paintedData.data[i+2] - origData.data[i+2]);
                        const val = diff > 20 ? 255 : 0;
                        maskData.data[i] = maskData.data[i+1] = maskData.data[i+2] = val;
                        maskData.data[i+3] = 255;
                    }
                    maskCtx.putImageData(maskData, 0, 0);
                    const maskBase64 = maskCanvas.toDataURL('image/png');
                    const res = await fetch('/inpaint', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageUrl: currentImageUrl, maskBase64, prompt })
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();
                    currentImageUrl = data.imageUrl;
                    const imgEl = outputDiv.querySelector('img');
                    if (imgEl) imgEl.src = currentImageUrl;
                    initInpaintCanvas(currentImageUrl);
                } catch (err) {
                    alert('Error: ' + err.message);
                } finally {
                    inpaintBtn.textContent = '🎨 Regenerar';
                    inpaintBtn.disabled    = false;
                }
            };
            origImg.src = baseImageForMask || currentImageUrl;
        });
    }

    try {
        const savedImgs = localStorage.getItem('merlinImages');
        if (savedImgs) { images.push(...JSON.parse(savedImgs)); updateGallery(); }
    } catch(e) {}
    try {
        const savedPromptsData = localStorage.getItem('merlinPrompts');
        if (savedPromptsData) { savedPrompts.push(...JSON.parse(savedPromptsData)); updateSavedPrompts(); }
    } catch(e) {}

    if (generateBtn) generateBtn.addEventListener('click', () => startMagic(false));
    if (batchBtn)    batchBtn.addEventListener('click',    () => startMagic(true));

});
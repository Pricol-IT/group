// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- LENIS SMOOTH SCROLL SETUP ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Get ScrollTrigger to update on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis's ticker to GSAP's ticker for smoothness
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Disable GSAP's lag smoothing to prevent stutter causing jumps
    gsap.ticker.lagSmoothing(0);

    /* 
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    */

    const threeApp = new ThreeScene();

    // Loader
    const loader = document.querySelector('#loader');
    const progressBar = document.querySelector('.progress');

    if (loader && progressBar) {
        gsap.to(progressBar, {
            width: '100%',
            duration: 2.0, // Longer load for "Systems Online" feel
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.8,
                    onComplete: () => {
                        loader.style.display = 'none';
                        initScrollInteraction(threeApp);
                    }
                });
            }
        });
    } else {
        // If no loader, just start interaction
        initScrollInteraction(threeApp);
    }

    initAtmosphericEffects();

    // Handle Resize
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });


});

function initScrollInteraction(threeApp) {
    const isMobile = window.innerWidth < 900;

    // --- GLOBAL SCROLL DRIVE ---
    // The entire page scroll drives the 3D scene's "progress"
    // 0 = Top, 1 = Bottom
    ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // Smooth scrubbing
        onUpdate: (self) => {
            if (threeApp && threeApp.updateScroll) {
                threeApp.updateScroll(self.progress);
            }
        }
    });



    // --- INTRO CANVAS ANIMATION ---
    const introCanvas = document.getElementById('intro-canvas');
    const introFrames = [];
    const introFileList = [
        "frame_0_00_1f.jpeg",
        "frame_0_00_4f.jpeg",
        "frame_0_00_7f.jpeg",
        "frame_0_00_9f.jpeg",
        "frame_0_00_12f.jpeg",
        "frame_0_00_18f.jpeg",
        "frame_0_01_4f.jpeg",
        "frame_0_01_13f.jpeg",
        "frame_0_01_18f.jpeg",
        "frame_0_01_23f.jpeg",
        "frame_0_02_2f.jpeg",
        "frame_0_02_5f.jpeg",
        "frame_0_02_8f.jpeg",
        "frame_0_02_13f.jpeg",
        "frame_0_02_16f.jpeg",
        "frame_0_02_21f.jpeg",
        "frame_0_03_0f.jpeg",
        "frame_0_03_2f.jpeg",
        "frame_0_03_4f.jpeg",
        "frame_0_03_6f.jpeg",
        "frame_0_03_9f.jpeg",
        "frame_0_03_11f.jpeg",
        "frame_0_03_13f.jpeg",
        "frame_0_03_16f.jpeg",
        "frame_0_03_22f.jpeg",
        "frame_0_04_1f.jpeg",
        "frame_0_04_5f.jpeg",
        "frame_0_04_8f.jpeg",
        "frame_0_04_12f.jpeg",
        "frame_0_04_15f.jpeg",
        "frame_0_04_18f.jpeg",
        "frame_0_04_21f.jpeg",
        "frame_0_05_0f.jpeg",
        "frame_0_05_2f.jpeg",
        "frame_0_05_6f.jpeg",
        "frame_0_05_8f.jpeg",
        "frame_0_05_10f.jpeg",
        "frame_0_05_12f.jpeg",
        "frame_0_05_14f.jpeg",
        "frame_0_05_16f.jpeg",
        "frame_0_05_18f.jpeg",
        "frame_0_06_1f.jpeg",
        "frame_0_06_7f.jpeg",
        "frame_0_06_11f.jpeg",
        "frame_0_06_12f.jpeg",
        "frame_0_06_15f.jpeg",
        "frame_0_06_21f.jpeg",
        "frame_0_07_3f.jpeg",
        "frame_0_07_8f.jpeg",
        "frame_0_07_13f.jpeg",
        "frame_0_08_0f.jpeg"
    ];

    // User wants backwards movement: 8s -> 0s. 
    // So Start Frame = last index, End Frame = 0.
    const introImagesCtx = { currentFrame: introFileList.length - 1 };

    // Preload
    introFileList.forEach(file => {
        const img = new Image();
        img.src = `images/ExtractedFrames_2026-02-06_10-07-33/${file}`;
        introFrames.push(img);
    });

    function renderIntroFrame() {
        if (!introCanvas) return;
        const ctx = introCanvas.getContext('2d');
        // Ensure index is valid
        const index = Math.min(Math.max(Math.round(introImagesCtx.currentFrame), 0), introFrames.length - 1);
        const img = introFrames[index];

        if (img && img.complete) {
            const canvasWidth = introCanvas.width;
            const canvasHeight = introCanvas.height;

            // Cover logic
            const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height) * 1.05;
            const x = (canvasWidth / 2) - (img.width / 2) * scale;
            const y = (canvasHeight / 2) - (img.height / 2) * scale;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    function resizeIntroCanvas() {
        if (introCanvas) {
            introCanvas.width = window.innerWidth;
            introCanvas.height = window.innerHeight;
            renderIntroFrame();
        }
    }

    if (introCanvas) {
        window.addEventListener('resize', resizeIntroCanvas);
        resizeIntroCanvas();

        // Try to verify if the first image (last in list) is loaded
        const startImg = introFrames[introFrames.length - 1];
        if (startImg && startImg.complete) {
            renderIntroFrame();
        } else if (startImg) {
            startImg.onload = renderIntroFrame;
        }
    }

    // --- MOUNTAIN REVEAL (Multi-Layer) ---
    const revealTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '+=4000',
            scrub: 1,
            pin: true
        }
    });

    // --- FOG SEQUENCE SECTION (User Provided) ---
    const fogCanvas = document.getElementById('fog-sequence-canvas');
    const fogFrames = [];
    const fogImagesCtx = { currentFrame: 0 };

    // Explicit list based on user request (0 to 7 second marks approx)
    const fogFileList = [
        "frame_0_00_0f.jpeg",
        "frame_0_00_9f.jpeg",
        "frame_0_01_1f.jpeg",
        "frame_0_01_7f.jpeg",
        "frame_0_01_18f.jpeg",
        "frame_0_02_3f.jpeg",
        "frame_0_02_20f.jpeg",
        "frame_0_03_2f.jpeg",
        "frame_0_03_9f.jpeg",
        "frame_0_03_19f.jpeg",
        "frame_0_04_11f.jpeg",
        "frame_0_04_22f.jpeg",
        "frame_0_05_3f.jpeg",
        "frame_0_05_9f.jpeg",
        "frame_0_05_15f.jpeg",
        "frame_0_05_21f.jpeg",
        "frame_0_06_3f.jpeg",
        "frame_0_06_6f.jpeg",
        "frame_0_06_12f.jpeg",
        "frame_0_06_15f.jpeg",
        "frame_0_06_21f.jpeg",
        "frame_0_07_3f.jpeg",
        "frame_0_07_7f.jpeg",
        "frame_0_07_12f.jpeg",
        "frame_0_07_15f.jpeg",
        "frame_0_07_19f.jpeg"
    ];

    // Preload with cache buster to satisfy "images not updated" report
    const cacheBuster = new Date().getTime();
    fogFileList.forEach(file => {
        const img = new Image();
        img.src = `images/fog/${file}?v=${cacheBuster}`;
        fogFrames.push(img);
    });

    function renderFogFrame() {
        if (!fogCanvas) return;
        const ctx = fogCanvas.getContext('2d');
        const index = Math.min(Math.max(Math.round(fogImagesCtx.currentFrame), 0), fogFrames.length - 1);
        const img = fogFrames[index];

        if (img && img.complete) {
            const canvasWidth = fogCanvas.width;
            const canvasHeight = fogCanvas.height;

            // Cover logic
            const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height) * 1.05;
            const x = (canvasWidth / 2) - (img.width / 2) * scale;
            const y = (canvasHeight / 2) - (img.height / 2) * scale;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    function resizeFogCanvas() {
        if (fogCanvas) {
            fogCanvas.width = window.innerWidth;
            fogCanvas.height = window.innerHeight;
            renderFogFrame();
        }
    }

    if (fogCanvas) {
        // Initial render: Start from last frame as requested
        const startImgIndex = fogFrames.length - 1;
        fogImagesCtx.currentFrame = startImgIndex;

        window.addEventListener('resize', resizeFogCanvas);
        resizeFogCanvas();

        const checkLoad = setInterval(() => {
            const img = fogFrames[startImgIndex];
            if (img && img.complete) {
                renderFogFrame();
                clearInterval(checkLoad);
            }
        }, 100);
    }

    // SCROLL ANIMATION FOR FOG
    // Fade out canvas at the end to reveal content
    // fogTl.to(fogCanvas, { ... }) - REMOVED

    // FOG SEQUENCE INTEGRATION (Into RevealTl)
    // 1. Fade In Fog Canvas (Covering the video)
    revealTl.to('.fog-sequence-section', { opacity: 0.6, duration: 0.5 }, 0.6);

    // 2. Play Fog Frames (0.6 to 1.0)
    revealTl.fromTo(fogImagesCtx,
        { currentFrame: fogFileList.length - 1 },
        {
            currentFrame: 0,
            snap: "currentFrame",
            ease: "none",
            onUpdate: renderFogFrame,
            duration: 0.4
        },
        0.6
    );

    // 3. Fade Out Fog to Reveal Next Section (Pricol Limited)
    revealTl.to('.fog-sequence-section', { opacity: 0, duration: 0.5 }, 0.8);

    // 4. Fade IN Pricol Limited Canvas (Matching Fog Clear)
    // This removes the "Grey Shade" by ensuring the image is visible BEHIND the fog
    revealTl.fromTo('#canvas-limited',
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power1.inOut' },
        0.7 // Start fading in as fog is thickest/clearing
    );

    // --- CLOUD DIVIDER SECTION (Mont-Fort Style) ---
    // 1. Mist Fades IN over Hero
    // 2. Mist Flows
    // 3. Mist Fades OUT revealing Company List (Clean transition)

    const cloudTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.cloud-mist-wrapper',
            // Wrapper starts high up (due to -80vh margin).
            // We scrub through the entire height of the wrapper.
            start: 'top top',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1 // Tight coupling for sequence control
        }
    });

    // PHASE 1: START (Fog Texture) - Overlapping Hero
    cloudTl.to('.fog-start', { opacity: 1, duration: 1, ease: 'power1.in' }, 0);

    // PHASE 2: MID (Transition + Mist) - Blending in
    cloudTl.to('.fog-mid', { opacity: 1, duration: 1 }, 0.5); // Overlap slightly
    cloudTl.to('.mist-layer', { opacity: 1, stagger: 0.1, duration: 1 }, 0.5); // Mist comes in with transition

    // Parallax Flow (Active throughout middle)
    cloudTl.to('.layer-1', { yPercent: 40 }, 0);
    cloudTl.to('.layer-2', { yPercent: 30 }, 0);

    // PHASE 3: END (Texture Closure) - Before Content
    cloudTl.to('.fog-end', { opacity: 1, duration: 1 }, 2);

    // PHASE 4: CLEARING (Fade out ALL fog to reveal text)
    // We group them to fade out together for a clean reveal
    cloudTl.to(['.mist-background'], {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    }, 3.5); // Late in the scroll timeline

    // 2. Content Reveal (Emerges CLEARLY after mist is gone/fading)
    // The content section is padded down, so it naturally appears later in the scroll.
    gsap.fromTo('.mist-overlay-section',
        { autoAlpha: 0, y: 50 },
        {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.mist-overlay-section',
                start: 'top 50%', // Trigger later, when fog is really dense/clearing
                end: 'top 20%',
                scrub: 1
            }
        }
    );

    // --- CLOUD REVEAL ANIMATION (Initial) ---
    revealTl.to('.cloud-reveal-layer', {
        autoAlpha: 0, // Ensures visibility:hidden at end
        scale: 1.5,
        ease: 'power1.in',
        duration: 0.1 // Fade out instantly (sync with brand text)
    }, 0);









    // Canvas Reveal (renamed from Video)
    revealTl.from('#intro-canvas', { scale: 1.1, ease: 'none' }, 0);

    // SKY FOG OVERLAY (Coming from sky)
    revealTl.fromTo('.sky-fog-overlay',
        { autoAlpha: 0, y: '-20%' },
        { autoAlpha: 1, y: '0%', duration: 0.4, ease: 'power1.out' },
        0.3 // Start mid-way through building scroll
    );
    revealTl.to('.sky-fog-overlay',
        { autoAlpha: 0, duration: 0.2, ease: 'power1.in' },
        0.7 // Fade out as main fog takes over
    );

    // Animate Frames (Backwards 8s -> 0s)
    revealTl.to(introImagesCtx, {
        currentFrame: 0,
        snap: "currentFrame",
        ease: "none",
        onUpdate: renderIntroFrame
    }, 0);

    // ZOOM INTO PRICOL LIMITED (Transition) - REMOVED
    // revealTl.to('#intro-canvas', { scale: 5, ... });

    // ZOOM into Mist (Sudden) - REMOVED
    // revealTl.to('#intro-canvas', { scale: 15, ... });

    // Instead, just ensure it fades out if not covered by fog, or let fog cover it.
    // The fog covers it at 0.6.
    // So we might not need to do anything else for the canvas here.
    // But let's check if opacity needs to go to 0.
    revealTl.to('#intro-canvas', {
        opacity: 0,
        duration: 0.5,
        ease: 'power1.inOut'
    }, 0.7); // Fade out naturally behind fog




    // --- HERO INTRO ---
    // 1. Brand (Welcome/Logo) - Fades OUT as mountains open / Clouds dissolve
    revealTl.to('.hero-brand', {
        opacity: 0,
        scale: 1.1, // Zoom out slightly with clouds
        ease: 'power1.in',
        duration: 0.1 // Fade out almost instantly on scroll start
    }, 0);

    // 2. About Text - Fades IN over video, then FADES OUT before Fog
    // User Request: "about text should end in building text itself don't need in foggy effect"
    revealTl.to('.hero-about', {
        opacity: 1,
        y: -20,
        ease: 'power1.out',
        duration: 0.2 // Quick fade in
    }, 0.3); // Start earlier

    revealTl.to('.hero-about', {
        opacity: 0,
        y: -40, // Float up and disappear
        ease: 'power1.in',
        duration: 0.1
    }, 0.7); // Fade out BEFORE the zoom/mist (at 0.7)

    // ZOOM into Mist (Sudden) - REMOVED
    // revealTl.to('#intro-canvas', { scale: 15, ... });

    const heroTl = gsap.timeline();

    // Initial Load - Only Brand appears first
    heroTl.from('.hero-brand > *', {
        y: 40, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out'
    });

    // Ensure Hero Story is active at top
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top center',
        onEnter: () => threeApp.highlightSection(0), // Hero Story
        onEnterBack: () => threeApp.highlightSection(0)
    });


    // --- SECTION REVEALS ---
    // Text elements entering "Glass" panes
    const companySections = document.querySelectorAll('.company');

    // Map for Backgrounds (shared for animation)
    const bgMap = {
        1: '#canvas-limited',
        2: '#bg-precision',
        3: '#canvas-engineering',
        4: '#canvas-travel',
        5: '#bg-bluorb',
        6: '#canvas-gourmet',
        7: '#bg-retreats',
        8: '#bg-durapack',
        9: '#canvas-logistics',
        10: '#bg-asia',
        11: '#bg-surya',
        12: '#bg-holdings'
    };

    // --- PRICOL LIMITED CANVAS ANIMATION ---
    const limitedCanvas = document.getElementById('canvas-limited');
    const limitedFrames = [];
    const limitedFrameCount = 40; // ezgif-frame-001 to 040
    const limitedImagesCtx = { currentFrame: 0 };

    // Preload Pricol Limited Images
    for (let i = 1; i <= limitedFrameCount; i++) {
        const img = new Image();
        const num = i.toString().padStart(3, '0');
        img.src = `images/ezgif-4b345fe35756b584-jpg/ezgif-frame-${num}.jpg`;
        limitedFrames.push(img);
    }

    function renderLimitedFrame() {
        if (!limitedCanvas) return;
        const ctx = limitedCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const img = limitedFrames[Math.round(limitedImagesCtx.currentFrame)];

        if (img && img.complete) {
            const canvasWidth = limitedCanvas.width;
            const canvasHeight = limitedCanvas.height;
            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;

            // Robust 'cover' logic with slight overscale
            const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height) * 1.05;

            const x = (canvasWidth / 2) - (img.width / 2) * scale;
            const y = (canvasHeight / 2) - (img.height / 2) * scale;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    function resizeLimitedCanvas() {
        if (limitedCanvas) {
            const dpr = window.devicePixelRatio || 1;
            limitedCanvas.width = window.innerWidth * dpr;
            limitedCanvas.height = window.innerHeight * dpr;
            limitedCanvas.style.width = window.innerWidth + 'px';
            limitedCanvas.style.height = window.innerHeight + 'px';
            renderLimitedFrame();
        }
    }

    if (limitedCanvas) {
        window.addEventListener('resize', resizeLimitedCanvas);
        resizeLimitedCanvas();
        // Initial render
        limitedFrames[0].onload = renderLimitedFrame;
    }
    const engineeringCanvas = document.getElementById('canvas-engineering');
    const engineeringFrames = [];
    const engineeringFrameCount = 36; // ezgif-frame-001 to 036
    const engineeringImagesCtx = { currentFrame: 0 };

    // Preload Engineering Images
    for (let i = 1; i <= engineeringFrameCount; i++) {
        const img = new Image();
        const num = i.toString().padStart(3, '0');
        img.src = `images/ezgif-8ed1bcf388f22c34-jpg/ezgif-frame-${num}.jpg`;
        engineeringFrames.push(img);
    }

    function renderEngineeringFrame() {
        if (!engineeringCanvas) return;
        const ctx = engineeringCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const img = engineeringFrames[Math.round(engineeringImagesCtx.currentFrame)];

        if (img && img.complete) {
            const canvasWidth = engineeringCanvas.width;
            const canvasHeight = engineeringCanvas.height;
            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;

            let renderW, renderH, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
                renderW = canvasWidth;
                renderH = canvasWidth / imgRatio;
                offsetX = 0;
                offsetY = (canvasHeight - renderH) / 2;
            } else {
                renderW = canvasHeight * imgRatio;
                renderH = canvasHeight;
                offsetX = (canvasWidth - renderW) / 2;
                offsetY = 0;
            }

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        }
    }

    function resizeEngineeringCanvas() {
        if (engineeringCanvas) {
            const dpr = window.devicePixelRatio || 1;
            engineeringCanvas.width = window.innerWidth * dpr;
            engineeringCanvas.height = window.innerHeight * dpr;
            engineeringCanvas.style.width = window.innerWidth + 'px';
            engineeringCanvas.style.height = window.innerHeight + 'px';
            renderEngineeringFrame();
        }
    }

    if (engineeringCanvas) {
        window.addEventListener('resize', resizeEngineeringCanvas);
        resizeEngineeringCanvas();
        // Initial render
        engineeringFrames[0].onload = renderEngineeringFrame;
    }

    // --- LOGISTICS CANVAS ANIMATION ---
    const logisticsCanvas = document.getElementById('canvas-logistics');
    const logisticsFrames = [];
    const logisticsFrameCount = 26; // ezgif-frame-001 to 026
    const logisticsImagesCtx = { currentFrame: 0 };

    // Preload Logistics Images
    for (let i = 1; i <= logisticsFrameCount; i++) {
        const img = new Image();
        const num = i.toString().padStart(3, '0');
        img.src = `images/ezgif-1cabe3ad26f14bde-jpg/ezgif-frame-${num}.jpg`;
        logisticsFrames.push(img);
    }

    function renderLogisticsFrame() {
        if (!logisticsCanvas) return;
        const ctx = logisticsCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const img = logisticsFrames[Math.round(logisticsImagesCtx.currentFrame)];

        if (img && img.complete) {
            const canvasWidth = logisticsCanvas.width;
            const canvasHeight = logisticsCanvas.height;
            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;

            let renderW, renderH, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
                renderW = canvasWidth;
                renderH = canvasWidth / imgRatio;
                offsetX = 0;
                offsetY = (canvasHeight - renderH) / 2;
            } else {
                renderW = canvasHeight * imgRatio;
                renderH = canvasHeight;
                offsetX = (canvasWidth - renderW) / 2;
                offsetY = 0;
            }

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        }
    }

    function resizeLogisticsCanvas() {
        if (logisticsCanvas) {
            const dpr = window.devicePixelRatio || 1;
            logisticsCanvas.width = window.innerWidth * dpr;
            logisticsCanvas.height = window.innerHeight * dpr;
            logisticsCanvas.style.width = window.innerWidth + 'px';
            logisticsCanvas.style.height = window.innerHeight + 'px';
            renderLogisticsFrame();
        }
    }

    if (logisticsCanvas) {
        window.addEventListener('resize', resizeLogisticsCanvas);
        resizeLogisticsCanvas();
        // Initial render
        logisticsFrames[0].onload = renderLogisticsFrame;
    }
    /* 
    // Old sequence logic removed in favor of canvas below
    const gourmetFrames = [];
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = `images/gourmet_seq/frame_${i}.jpg`;
        gourmetFrames.push(img);
    }
    */

    // --- TRAVELCANVAS ANIMATION ---
    const travelCanvas = document.getElementById('canvas-travel');
    const travelFrames = [];
    const travelFrameCount = 26; // ezgif-frame-001 to 026
    const travelImagesCtx = { currentFrame: 0 }; // Object to tween

    // Preload Travel Images
    for (let i = 1; i <= travelFrameCount; i++) {
        const img = new Image();
        const num = i.toString().padStart(3, '0');
        img.src = `images/ezgif-17b64c835af88672-jpg/ezgif-frame-${num}.jpg`;
        travelFrames.push(img);
    }

    // Canvas Resize & Draw
    function renderTravelFrame() {
        if (!travelCanvas) return;
        const ctx = travelCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const img = travelFrames[Math.round(travelImagesCtx.currentFrame)];

        if (img && img.complete) {
            // Mimic object-fit: cover
            const canvasWidth = travelCanvas.width;
            const canvasHeight = travelCanvas.height;
            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;

            let renderW, renderH, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
                renderW = canvasWidth;
                renderH = canvasWidth / imgRatio;
                offsetX = 0;
                offsetY = (canvasHeight - renderH) / 2;
            } else {
                renderW = canvasHeight * imgRatio;
                renderH = canvasHeight;
                offsetX = (canvasWidth - renderW) / 2;
                offsetY = 0;
            }

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        }
    }

    function resizeTravelCanvas() {
        if (travelCanvas) {
            const dpr = window.devicePixelRatio || 1;
            travelCanvas.width = window.innerWidth * dpr;
            travelCanvas.height = window.innerHeight * dpr;
            travelCanvas.style.width = window.innerWidth + 'px';
            travelCanvas.style.height = window.innerHeight + 'px';
            renderTravelFrame();
        }
    }

    if (travelCanvas) {
        window.addEventListener('resize', resizeTravelCanvas);
        resizeTravelCanvas();
        // Force initial render once first image loads
        travelFrames[0].onload = renderTravelFrame;
    }

    // --- GOURMET CANVAS ANIMATION ---
    const gourmetCanvas = document.getElementById('canvas-gourmet');
    const gourmetFrames = [];
    const gourmetFrameCount = 26; // ezgif-frame-001 to 026
    const gourmetImagesCtx = { currentFrame: 0 };

    // Preload Gourmet Images
    for (let i = 1; i <= gourmetFrameCount; i++) {
        const img = new Image();
        const num = i.toString().padStart(3, '0');
        img.src = `images/ezgif-1ad6cebd5ce710a4-jpg/ezgif-frame-${num}.jpg`;
        gourmetFrames.push(img);
    }

    function renderGourmetFrame() {
        if (!gourmetCanvas) return;
        const ctx = gourmetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const img = gourmetFrames[Math.round(gourmetImagesCtx.currentFrame)];

        if (img && img.complete) {
            // Mimic object-fit: cover
            const canvasWidth = gourmetCanvas.width;
            const canvasHeight = gourmetCanvas.height;
            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;

            // Robust 'cover' logic with slight overscale
            const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height) * 1.02;

            const x = (canvasWidth / 2) - (img.width / 2) * scale;
            const y = (canvasHeight / 2) - (img.height / 2) * scale;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    function resizeGourmetCanvas() {
        if (gourmetCanvas) {
            const dpr = window.devicePixelRatio || 1;
            gourmetCanvas.width = window.innerWidth * dpr;
            gourmetCanvas.height = window.innerHeight * dpr;
            gourmetCanvas.style.width = window.innerWidth + 'px';
            gourmetCanvas.style.height = window.innerHeight + 'px';
            renderGourmetFrame();
        }
    }

    if (gourmetCanvas) {
        window.addEventListener('resize', resizeGourmetCanvas);
        resizeGourmetCanvas();
        gourmetFrames[0].onload = renderGourmetFrame;
    }


    companySections.forEach((section, index) => {
        // Content Fade In
        gsap.from(section.querySelector('.content'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 50%',
                scrub: 1
            },
            y: 60,
            opacity: 0
        });

        const sectionIndex = index + 1;
        const bgId = bgMap[sectionIndex];

        // Background Animation (Zoom/Parallax)
        if (bgId) {
            const bgEl = document.querySelector(bgId);

            // SPECIAL CASE: Pricol Limited Canvas Animation
            if (index === 0) { // Pricol Limited is index 0 (0-based) -> section #c1
                gsap.to(limitedImagesCtx, {
                    currentFrame: limitedFrameCount - 1,
                    snap: "currentFrame",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0,
                        onUpdate: () => renderLimitedFrame()
                    }
                });
            }
            // SPECIAL CASE: Engineering Canvas Animation
            else if (index === 2) { // Pricol Engineering is index 2 (0-based) -> section #c3
                gsap.to(engineeringImagesCtx, {
                    currentFrame: engineeringFrameCount - 1,
                    snap: "currentFrame",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0,
                        onUpdate: () => renderEngineeringFrame()
                    }
                });
            }
            // SPECIAL CASE: Travel Canvas Animation
            else if (index === 3) { // Pricol Travel is index 3 (0-based) -> section #c4
                gsap.to(travelImagesCtx, {
                    currentFrame: travelFrameCount - 1,
                    snap: "currentFrame",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0,
                        onUpdate: () => renderTravelFrame()
                    }
                });
            }
            // SPECIAL CASE: Logistics Canvas Animation
            else if (index === 8) { // Pricol Logistics is index 8 (0-based) -> section #c9
                gsap.to(logisticsImagesCtx, {
                    currentFrame: logisticsFrameCount - 1,
                    snap: "currentFrame",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0,
                        onUpdate: () => renderLogisticsFrame()
                    }
                });
            }
            // SPECIAL CASE: Gourmet Canvas Animation
            else if (index === 5) { // Pricol Gourmet is index 5 (0-based) -> section #c6
                gsap.to(gourmetImagesCtx, {
                    currentFrame: gourmetFrameCount - 1,
                    snap: "currentFrame",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0,
                        onUpdate: () => renderGourmetFrame()
                    }
                });
            }
            else if (bgEl && bgEl.tagName !== 'CANVAS') {
                // Shared Zoom Effect for Standard Images
                const anim = gsap.fromTo(bgEl,
                    { scale: 1.0, y: 0 },
                    {
                        scale: 1.15,
                        y: 50,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true
                        }
                    }
                );
            }

            // Background Focus & Image Swap
            ScrollTrigger.create({
                trigger: section,
                start: "top center",
                end: "bottom center",
                onEnter: () => {
                    threeApp.highlightSection(index + 1);
                    updateBackground(index + 1);
                },
                onEnterBack: () => {
                    threeApp.highlightSection(index + 1);
                    updateBackground(index + 1);
                },
                onLeave: () => {
                    // Optional: Fade out if leaving into footer? 
                    // Mostly handled by next section's onEnter
                },
                onLeaveBack: () => {
                    // If going back up to Hero (index 0)
                    if (index === 0) updateBackground(0);
                }
            });
        }

    });

    // Handle Hero Background (Index 0)
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top center',
        onEnter: () => updateBackground(0),
        onEnterBack: () => updateBackground(0)
    });

    // --- FOOTER ---
    gsap.from('.footer .container', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 90%',
        },
        y: 30, opacity: 0, duration: 1
    });

    // Helper for Background Switching
    function updateBackground(index) {
        // bgMap is defined above now locally or reset here? 
        // We can reuse the map if defined in higher scope, but for safety in this function update:
        const bgSwitchMap = {
            1: '#canvas-limited',
            2: '#bg-precision',
            3: '#canvas-engineering',
            4: '#canvas-travel',
            5: '#bg-bluorb',
            6: '#canvas-gourmet',
            7: '#bg-retreats',
            8: '#bg-durapack',
            9: '#canvas-logistics',
            10: '#bg-asia',
            11: '#bg-surya',
            12: '#bg-holdings'
        };


        // Reset all specific layers to opacity 0
        document.querySelectorAll('.bg-layer').forEach(el => el.style.opacity = '0');

        // Activate specific layer if exists
        const targetId = bgSwitchMap[index];
        if (targetId) {
            const el = document.querySelector(targetId);
            if (el) {
                el.style.opacity = '1';
            }
        }
    }

    // --- GLOBAL FOG TRANSITION LOOP ---
    // Apply fog wipe between ALL company sections
    companySections.forEach((section, i) => {
        // Skip the first transition (handled by Hero -> Pricol Limited logic above)
        // or we can unify it. But Hero transition is special.
        // Let's do it for i >= 1 (Pricol Limited -> Pricol Precision and onwards)

        if (i >= 0) { // Actually, let's try to apply it to all transitions between companies?
            // i=0 is Hero -> Limited (Handled separately in revealTl)
            // So we want transition exiting section i to section i+1?
            // Or entering section i+1?

            // Let's trigger it on entering section i+1
            const nextSection = companySections[i + 1];
            if (nextSection) {
                ScrollTrigger.create({
                    trigger: nextSection,
                    start: "top bottom", // Starts when next section enters viewport
                    end: "top 80%",   // Ends very soon (immediate transition)
                    scrub: 1, // Smooth scrub
                    onUpdate: (self) => {
                        // We want:
                        // 0.0 -> 0.2: Fog Opacity 0 -> 0.75 (Quick Fade In)
                        // 0.2 -> 0.8: Fog Opacity 0.75 (Hold while sequence plays)
                        // 0.8 -> 1.0: Fog Opacity 0.75 -> 0 (Fade Out cleanup)

                        const p = self.progress;
                        const opacityIn = Math.min(1, p / 0.2);
                        const opacityOut = Math.max(0, (1 - p) / 0.2);

                        // Sequence progress (mapped 0.3 to 0.8) - Wiping after background switch (~0.33)
                        let frameProgress = (p - 0.3) / 0.5;
                        frameProgress = Math.max(0, Math.min(1, frameProgress));

                        // Decide Opacity
                        let finalOpacity = 0;
                        const maxOpacity = 0.75; // Lighter/Cleaner fog

                        if (p < 0.2) finalOpacity = opacityIn * maxOpacity;
                        else if (p > 0.8) finalOpacity = opacityOut * maxOpacity;
                        else finalOpacity = maxOpacity;

                        // Set Canvas Opacity
                        const fogSection = document.querySelector('.fog-sequence-section');
                        if (fogSection) { // reuse the same element
                            fogSection.style.opacity = finalOpacity;
                        }

                        // Render Frame
                        // Inverse logic if reusing same frames (or forward?)
                        // Hero used backwards (length -> 0). Let's stick to that for consistency?
                        // Or forward? "Wipe" usually implies forward movement.
                        // Hero was backwards: currentFrame: fogFileList.length - 1 -> 0

                        const frameIndex = (1 - frameProgress) * (fogFileList.length - 1);
                        fogImagesCtx.currentFrame = frameIndex;
                        renderFogFrame();
                    }
                });
            }
        }
    });

}

// --- CLOUD DUAL SCROLL SEQUENCE (Upward Drift) - V2 ---
// Added here to bypass previous code blocks and ensure correct scope

if (document.querySelector('.cloud-mist-wrapper-v2')) {
    const cloudTlV2 = gsap.timeline({
        scrollTrigger: {
            trigger: '.cloud-mist-wrapper-v2',
            // Overlapping hero (-80vh)
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        }
    });

    // 1. Fade In (Start of transition)
    cloudTlV2.to('.cloud-scroll-layer', { opacity: 1, duration: 1, stagger: 0.1 }, 0);

    // 2. Upward Drift (Parallax)
    // Moving UP (negative y) as we scroll down to simulate rising mist
    cloudTlV2.to('.layer-top', { yPercent: -30 }, 0);
    cloudTlV2.to('.layer-bottom', { yPercent: -60, scale: 1.1 }, 0);

    // 3. Fade Out (EARLY CLEANUP)
    // Ensure mist is gone before content (Pricol Limited) appears
    cloudTlV2.to('.cloud-scroll-layer', { opacity: 0, duration: 0.5, stagger: 0 }, 2.5);
}

function initAtmosphericEffects() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const fogContainer = document.querySelector('.fog-container');
    const isMobile = window.innerWidth <= 768;

    // Scroll Logic
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // 1. Parallax - ENHANCED MOVEMENT
        parallaxLayers.forEach(layer => {
            // Increased multiplier from default 1x to higher for dramatic effect
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            // Negative direction for "rising mist" effect or positive for falling? 
            // Let's make it move faster.
            layer.style.setProperty('--scroll-offset', `${scrollY * speed * 2.5}px`);
        });

        // 2. Opacity Fade - REMOVED FADE OUT
        // We want the fog to persist throughout all sections
        let opacity = 1;
        // Optional: Make it slightly subtler at the very bottom if needed, but for now constant or slightly dynamic
        // opacity = 0.8 + Math.sin(scrollY * 0.002) * 0.2; // Pulse effect?

        if (fogContainer) {
            fogContainer.style.opacity = opacity;
        }
    });

    // Mouse Logic (Desktop Only)
    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
                const depth = speed * 150; // Increased depth for more interaction

                const x = (mouseX - 0.5) * depth;
                const y = (mouseY - 0.5) * depth;

                layer.style.setProperty('--mouse-x', `${x}px`);
                layer.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // Back to Top Button Logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

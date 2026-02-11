document.addEventListener('DOMContentLoaded', () => {
    // Only init if the section exists
    const cloudSection = document.getElementById('cloud-tunnel-section');
    const cloudCanvas = document.getElementById('cloud-tunnel-canvas');

    if (!cloudSection || !cloudCanvas) return;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();

    // 1. Transparent Background (Fixes "White Screen")
    scene.background = null;

    // 2. Soft Fog (Creates depth for "floating mist")
    // Color matches light grey/white steam
    scene.fog = new THREE.FogExp2(0xffffff, 0.0015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 10;
    camera.rotation.z = Math.PI / 180 * -5; // Slight tilt

    const renderer = new THREE.WebGLRenderer({
        canvas: cloudCanvas,
        alpha: true, // Allow transparency
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear color must be transparent
    renderer.setClearColor(0x000000, 0);

    // --- LIGHTS ---
    const ambientInfo = new THREE.AmbientLight(0x555555);
    scene.add(ambientInfo);

    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    // --- CLOUD PARTICLES ---
    const cloudParticles = [];
    const loader = new THREE.TextureLoader();

    // Load ONLY the requested texture: smoke-background.jpg
    // "use this foggy effect alone"
    loader.load('images/smoke-background.jpg', function (texture) {
        const cloudGeo = new THREE.PlaneGeometry(500, 500);

        // Single material with motion emphasis
        const cloudMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            opacity: 0.55, // Stronger visibility
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        // Loop to create cloud tunnel
        for (let p = 0; p < 45; p++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);

            cloud.position.set(
                Math.random() * 400 - 200,
                Math.random() * 400 - 200,
                -Math.random() * 1000 // Z depth
            );

            cloud.rotation.z = Math.random() * 2 * Math.PI;
            cloud.material.opacity = 0.4 + Math.random() * 0.4;

            cloudParticles.push(cloud);
            scene.add(cloud);
        }

        animate();
    });

    // --- SCROLL TRIGGER LOGIC ---
    gsap.registerPlugin(ScrollTrigger);

    // Store original positions for morphing
    cloudParticles.forEach(p => {
        p.userData = {
            x: p.position.x,
            y: p.position.y,
            z: p.position.z,
            phase: Math.random() * Math.PI * 2 // Random starting phase
        };
    });

    let scrollProgress = 0;

    ScrollTrigger.create({
        trigger: '#cloud-tunnel-section',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
            scrollProgress = self.progress;

            // Move camera forward through the tunnel
            camera.position.z = 10 - (scrollProgress * 900);

            // Camera Rotation (Spiral feel)
            camera.rotation.z = (scrollProgress * 0.3) + (Math.PI / 180 * -5);
        }
    });

    // --- ANIMATION LOOP (Fluid Morphing) ---
    function animate() {
        requestAnimationFrame(animate);

        const time = Date.now() * 0.001; // Time factor

        cloudParticles.forEach((p, i) => {
            // internal rotation
            p.rotation.z += 0.002;

            // FLUID MORPHING LOGIC
            // We gently distort the x/y positions based on time & scroll to simulate "morphing shape"
            // Like the GSAP demo, we want organic, non-linear movement.

            const morphIntensity = 30 + (scrollProgress * 20); // More distortion as we go deep

            // Use Sine/Cos waves to create fluid motion offset
            const offsetX = Math.sin(time * 0.5 + p.userData.phase) * morphIntensity;
            const offsetY = Math.cos(time * 0.3 + p.userData.phase * 2) * morphIntensity;

            p.position.x = p.userData.x + offsetX;
            p.position.y = p.userData.y + offsetY;

            // Optional: breathing scale
            // p.scale.setScalar(1 + Math.sin(time + i) * 0.1);
        });

        renderer.render(scene, camera);
    }

    // --- RESIZE ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

class ThreeScene {
    constructor() {
        this.container = document.querySelector('#webgl');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Adaptive Performance Setup
        this.isMobile = window.innerWidth < 900;
        this.pixelRatio = Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2);

        // Story Groups
        this.stories = {
            hero: null, // Network/Grid (Default)
            limited: null, // Automotive
            precision: null, // CNC/Parts
            engineering: null, // Factory/Robotics
            logistics: null, // Flow/Routes
            gourmet: null, // Food/Warm
            retreats: null, // Nature/Calm
            footer: null
        };

        this.currentStory = 'hero';
        this.targetStory = 'hero';

        this.materials = []; // Track materials for disposal

        // Animation State
        this.time = 0;
        this.scrollProgress = 0;

        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();

        this.loadTextures().then(() => {
            this.createCloudBackground(); // New Cloud Layer
            this.loadMountains(); // Load 3D Mountains
            // Initialize Stories
            this.createStoryHero(); // Base Industrial Layer
            this.createStoryLimited();
            this.createStoryEngineering();
            this.createStoryLogistics();
            this.createStoryGourmet();
            this.createStoryPrecision();
            this.createStoryRetreats();

            this.createLighting();
            this.addListeners();
            this.animate();
        });
    }

    createScene() {
        this.scene = new THREE.Scene();
        // Light Blue Fog to blend with clouds
        this.scene.background = new THREE.Color(0xe0f2f1);
        this.scene.fog = new THREE.FogExp2(0xe0f2f1, 0.015);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 200);
        this.camera.position.set(0, 0, 30);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: !this.isMobile,
            alpha: true,
            powerPreference: "high-performance"
        });

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    }

    loadTextures() {
        return new Promise((resolve) => {
            const loader = new THREE.TextureLoader();
            const images = {
                limited: 'images/bg-limited.jpg',
                engineering: 'images/bg-engineering.jpg',
                logistics: 'images/bg-logistics.jpg',
                gourmet: 'images/bg-gourmet.jpg',
                clouds: 'images/cloud-pattern.png' // New Pattern
            };
            const keys = Object.keys(images);
            let loaded = 0;
            if (keys.length === 0) resolve();

            keys.forEach(key => {
                loader.load(images[key], (tex) => {
                    tex.encoding = THREE.sRGBEncoding;
                    // For clouds, wrap needs to be repeating
                    if (key === 'clouds') {
                        tex.wrapS = THREE.RepeatWrapping;
                        tex.wrapT = THREE.RepeatWrapping;
                    }
                    this.textures[key] = tex;
                    loaded++;
                    if (loaded === keys.length) resolve();
                }, undefined, () => {
                    loaded++;
                    if (loaded === keys.length) resolve();
                });
            });
        });
    }

    createCloudBackground() {
        if (!this.textures.clouds) return;

        // Large Plane covering the view behind everything
        const geometry = new THREE.PlaneGeometry(200, 100);

        // Material with Brand Blue Tint #0072bc
        const material = new THREE.MeshBasicMaterial({
            map: this.textures.clouds,
            transparent: true,
            opacity: 0.4, // Soft blend
            color: 0x0072bc, // Tint it Pricol Blue
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.cloudMesh = new THREE.Mesh(geometry, material);
        this.cloudMesh.position.z = -20; // Behind content but visible
        this.cloudMesh.rotation.z = 0.1; // Slight angle
        this.scene.add(this.cloudMesh);

        // Second layer for depth/parallax
        const mat2 = material.clone();
        mat2.opacity = 0.2;
        this.cloudMesh2 = new THREE.Mesh(geometry, mat2);
        this.cloudMesh2.position.z = -30;
        this.cloudMesh2.scale.set(1.5, 1.5, 1);
        this.scene.add(this.cloudMesh2);
    }

    // --- STORY IMPLEMENTATIONS ---

    // 0. HERO: Intelligent Network (Existing)
    createStoryHero() {
        this.stories.hero = new THREE.Group();

        // 1. Grid
        const grid = new THREE.GridHelper(200, 80, 0x7b1fa2, 0x4fc3f7); // Purple/Blue
        grid.position.y = -10;
        grid.position.z = -50;
        grid.material.opacity = 0.15;
        grid.material.transparent = true;
        this.stories.hero.add(grid);

        // 2. Network Particles (Simplified for brevity, similar to previous)
        const particleCount = this.isMobile ? 60 : 120;
        const radius = 60;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];

        const palette = [new THREE.Color(0x0277bd), new THREE.Color(0xd32f2f), new THREE.Color(0x388e3c)];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * radius * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * radius;
            positions[i * 3 + 2] = (Math.random() - 0.5) * radius;
            velocities.push({ x: (Math.random() - 0.5) * 0.03, y: (Math.random() - 0.5) * 0.03, z: (Math.random() - 0.5) * 0.03 });

            const color = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pMaterial = new THREE.PointsMaterial({
            size: 0.6, transparent: true, opacity: 0.8,
            vertexColors: true, blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, pMaterial);
        particles.userData = { velocities: velocities };
        this.stories.hero.add(particles);
        this.stories.hero.userData = { type: 'network', particles: particles };

        this.scene.add(this.stories.hero);
    }

    // 1. LIMITED: Smooth Precision (Rings/Dashboards)
    createStoryLimited() {
        this.stories.limited = new THREE.Group();
        this.stories.limited.visible = false;

        // Concentric Arcs representing gauges/precision
        const count = 5;
        for (let i = 0; i < count; i++) {
            const radius = 5 + i * 3;
            const tube = 0.05 + i * 0.02;
            const geo = new THREE.TorusGeometry(radius, tube, 16, 100, Math.PI * (1 + Math.random()));
            const mat = new THREE.MeshBasicMaterial({
                color: 0x00bcd4, transparent: true, opacity: 0.3, wireframe: false
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.z = Math.random() * Math.PI;
            mesh.userData = { rSpeed: (Math.random() - 0.5) * 0.01 };
            this.stories.limited.add(mesh);
        }

        // Floating 'Sensor' Dots
        const dotsGeo = new THREE.BufferGeometry();
        const dotsPos = [];
        for (let i = 0; i < 30; i++) {
            dotsPos.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10);
        }
        dotsGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotsPos, 3));
        const dotsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
        const dots = new THREE.Points(dotsGeo, dotsMat);
        this.stories.limited.add(dots);

        this.scene.add(this.stories.limited);
    }

    // 2. PRECISION: Controlled Motion (Cubes/Parts)
    createStoryPrecision() {
        this.stories.precision = new THREE.Group();
        this.stories.precision.visible = false;

        // Grid of small Instanced Meshes for performance
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0xcfd8dc, transparent: true, opacity: 0.6 });
        const count = 40;
        const instances = new THREE.InstancedMesh(geometry, material, count);

        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20
            );
            dummy.scale.setScalar(Math.random() * 0.5 + 0.5);
            dummy.updateMatrix();
            instances.setMatrixAt(i, dummy.matrix);
        }

        this.stories.precision.add(instances);
        this.stories.precision.userData = { instances: instances, count: count };
        this.scene.add(this.stories.precision);
    }

    // 3. ENGINEERING: Strong Industrial (Robotics/Arms)
    createStoryEngineering() {
        this.stories.engineering = new THREE.Group();
        this.stories.engineering.visible = false;

        // Large structural beams
        const beamGeo = new THREE.BoxGeometry(30, 1, 1);
        const beamMat = new THREE.MeshStandardMaterial({
            color: 0xe65100, roughness: 0.2, metalness: 0.8
        });

        const beam1 = new THREE.Mesh(beamGeo, beamMat);
        beam1.position.set(-10, 5, -10);
        beam1.rotation.z = Math.PI / 4;
        this.stories.engineering.add(beam1);

        const beam2 = new THREE.Mesh(beamGeo, beamMat);
        beam2.position.set(10, -5, -15);
        beam2.rotation.z = -Math.PI / 4;
        this.stories.engineering.add(beam2);

        // Moving mechanical parts (abstract cylinders)
        const cylGeo = new THREE.CylinderGeometry(1, 1, 5, 16);
        const cylMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });

        const part1 = new THREE.Mesh(cylGeo, cylMat);
        part1.position.set(0, 0, -5);
        part1.rotation.z = Math.PI / 2;
        this.stories.engineering.add(part1);
        this.stories.engineering.userData = { part1: part1 };

        this.scene.add(this.stories.engineering);
    }

    // 4. LOGISTICS: Fast Flowing (Lines/Routes)
    createStoryLogistics() {
        this.stories.logistics = new THREE.Group();
        this.stories.logistics.visible = false;

        // Curve paths
        const curvePoints = [];
        for (let i = 0; i < 5; i++) {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-30, (Math.random() - 0.5) * 20, -10),
                new THREE.Vector3(0, (Math.random() - 0.5) * 20, 0),
                new THREE.Vector3(30, (Math.random() - 0.5) * 20, -10),
            ]);
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xffea00, transparent: true, opacity: 0.4
            });
            const line = new THREE.Line(geometry, material);
            this.stories.logistics.add(line);
        }

        // Fast moving particles along lines (simulated in animate)
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(600); // 200 particles * 3

        for (let i = 0; i < 200; i++) {
            pPos[i * 3] = (Math.random() - 0.5) * 60; // x spread
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 30; // y spread
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 10; // z spread
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({
            color: 0xffffff, size: 0.4, transparent: true, opacity: 0.8
        });
        const particles = new THREE.Points(pGeo, pMat);
        // speed property for x-movement
        particles.userData = { speeds: Array(200).fill(0).map(() => 0.2 + Math.random() * 0.5) };
        this.stories.logistics.add(particles);
        this.stories.logistics.userData = { particles: particles };

        this.scene.add(this.stories.logistics);
    }

    // 6. GOURMET: Warm Soft (Organic/Particles)
    createStoryGourmet() {
        this.stories.gourmet = new THREE.Group();
        this.stories.gourmet.visible = false;

        const count = 30;
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffcc80, transparent: true, opacity: 0.6 // Warm Orange/Gold
        });

        const instances = new THREE.InstancedMesh(geometry, material, count);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15
            );
            const scale = 1 + Math.random() * 2;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instances.setMatrixAt(i, dummy.matrix);
        }

        this.stories.gourmet.add(instances);
        this.stories.gourmet.userData = { instances: instances, count: count };
        this.scene.add(this.stories.gourmet);
    }

    // 7. RETREATS: Calm Slow (Nature)
    createStoryRetreats() {
        this.stories.retreats = new THREE.Group();
        this.stories.retreats.visible = false;

        // Gentle floating leaves/shapes
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x81c784, side: THREE.DoubleSide, transparent: true, opacity: 0.5
        }); // Soft Green

        const count = 25;
        const instances = new THREE.InstancedMesh(geometry, material, count);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 10
            );
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            dummy.updateMatrix();
            instances.setMatrixAt(i, dummy.matrix);
        }

        this.stories.retreats.add(instances);
        this.stories.retreats.userData = { instances: instances, count: count };
        this.scene.add(this.stories.retreats);
    }

    createLighting() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1);
        dir.position.set(10, 10, 10);
        this.scene.add(dir);
    }

    highlightSection(index) {
        // Map scroll index to story keys
        const storyMap = [
            'hero',      // 0 - Hero (though usually handled by scroll 0)
            'limited',   // 1
            'precision', // 2
            'engineering',// 3
            'logistics', // 4
            'hero',      // 5 - Travel (fallback to hero/network)
            'gourmet',   // 6
            'retreats'   // 7
        ];

        // Safety check
        if (index < 0 || index >= storyMap.length) return;

        const nextStoryKey = storyMap[index] || 'hero';

        if (this.currentStory !== nextStoryKey) {
            this.transitionStories(this.currentStory, nextStoryKey);
            this.currentStory = nextStoryKey;
        }
    }

    transitionStories(fromKey, toKey) {
        const fromGroup = this.stories[fromKey];
        const toGroup = this.stories[toKey];

        if (!toGroup) return;

        // Fade In ToGroup
        toGroup.visible = true;
        toGroup.traverse((obj) => {
            if (obj.material) {
                obj.material.opacity = 0;
                gsap.to(obj.material, { opacity: obj.userData.originalOpacity || 0.6, duration: 1.5 });
            }
        });

        // Fade Out FromGroup
        if (fromGroup) {
            fromGroup.traverse((obj) => {
                if (obj.material) {
                    // Store original opacity if not stored
                    if (obj.userData.originalOpacity === undefined) obj.userData.originalOpacity = obj.material.opacity;

                    gsap.to(obj.material, {
                        opacity: 0,
                        duration: 1,
                        onComplete: () => { if (this.currentStory !== fromKey) fromGroup.visible = false; }
                    });
                }
            });
        }
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isMobile = window.innerWidth < 900;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    }

    addListeners() {
        window.addEventListener('resize', this.onResize.bind(this));
    }


    updateScroll(prog) {
        // Global camera drift
        this.camera.position.y = -prog * 5;

        // Animate Mountains
        if (this.mountains) {
            // Move mountains up as we scroll down
            // Starting at Y = -10 (just below view), moving to Y = 20 (upwards)
            // Adjust ranges as needed based on model size
            this.mountains.position.y = -20 + (prog * 30);
            this.mountains.rotation.y = prog * 0.5; // Slight rotation
        }
    }

    loadMountains() {
        const loader = new THREE.GLTFLoader();
        loader.load('images/mountains.glb', (gltf) => {
            this.mountains = gltf.scene;

            // Adjust scale and position
            this.mountains.scale.set(5, 5, 5); // Approximate scale, adjust as needed
            this.mountains.position.set(0, -20, -40); // Initial position (low and back)

            // Material adjustments (optional, tinting blue)
            this.mountains.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x0277bd, // Brand Blue
                        roughness: 0.8,
                        metalness: 0.2,
                        transparent: true,
                        opacity: 0.9
                    });
                }
            });

            this.scene.add(this.mountains);
        }, undefined, (error) => {
            console.error('Error loading mountains:', error);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = performance.now() * 0.001;

        // Rotate Hero
        if (this.stories.hero.visible) this.stories.hero.rotation.y = time * 0.05;

        // Animate Image Planes (Float)
        ['limited', 'engineering', 'logistics', 'gourmet'].forEach(key => {
            const grp = this.stories[key];
            if (grp && grp.visible && grp.userData.plane) {
                grp.userData.plane.position.y += Math.sin(time + 1) * 0.002;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}
window.ThreeScene = ThreeScene;

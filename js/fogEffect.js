
class FogEffect {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.material = null;
        this.mesh = null;
        this.startTime = Date.now();
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.init();
    }

    init() {
        // Create Canvas Overlay
        const canvas = document.createElement('canvas');
        canvas.id = 'fog-overlay';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '100'; // Overlay text
        canvas.style.pointerEvents = 'none'; // Click-through
        document.body.appendChild(canvas);
        this.container = canvas;

        // Three.js Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
            antialias: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Fog Shader
        this.createFogPlane();

        // Listeners
        window.addEventListener('resize', this.onResize.bind(this));

        // Start Loop
        this.animate();
    }

    createFogPlane() {
        const geometry = new THREE.PlaneGeometry(2, 2);

        // GLSL Shader for Fractal Brownian Motion (FBM) Smoke/Fog
        // Uses simple pseudo-random noise and layers it (FBM)
        const fragmentShader = `
            uniform float uTime;
            uniform vec2 uResolution;
            
            varying vec2 vUv;

            // Simple Random
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            // 2D Noise
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            // FBM (Fractal Brownian Motion)
            #define NUM_OCTAVES 5
            float fbm(vec2 st) {
                float v = 0.0;
                float a = 0.5;
                vec2 shift = vec2(100.0);
                // Rotate to reduce axial bias
                mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                for (int i = 0; i < NUM_OCTAVES; ++i) {
                    v += a * noise(st);
                    st = rot * st * 2.0 + shift;
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec2 st = gl_FragCoord.xy / uResolution.xy;
                // Correct aspect ratio for noise
                st.x *= uResolution.x / uResolution.y;

                // Animate noise
                float time = uTime * 0.15; // Speed of flow
                
                vec2 q = vec2(0.);
                q.x = fbm( st + 0.1 * time );
                q.y = fbm( st + vec2(1.0) );

                vec2 r = vec2(0.);
                r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
                r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*time);

                float f = fbm(st+r);

                // Color shaping
                // Mix between transparent and misty white
                // Increase contrast to make "clumps"
                float alpha = mix(f*f*f + 0.6*f*f + 0.5*f, 0.0, 0.0);
                
                // Soft edges
                alpha = smoothstep(0.1, 0.9, f);

                // Final color: White mist with calculated alpha
                // Reduce overall strength to be subtle (0.3 max)
                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.25);
            }
        `;

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(this.width, this.height) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (this.material) {
            this.material.uniforms.uResolution.value.set(this.width, this.height);
        }
    }

    animate() {
        const elapsedTime = (Date.now() - this.startTime) / 1000;

        if (this.material) {
            this.material.uniforms.uTime.value = elapsedTime;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Expose to window
window.FogEffect = FogEffect;

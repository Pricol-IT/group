document.addEventListener('DOMContentLoaded', () => {

    // Configuration
    const settings = {
        spawnFreq: 0.2, // Seconds between spawns
        spawnTime: 3, // How long a particle lives (approx)
        wind: 0,
        gravity: -0.5 // Upward movement
    };

    // Load Smoke Image (Shared)
    const smokeImage = new Image();
    smokeImage.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/smoke.png";

    function initSmoke(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const context = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Defaults
        const config = {
            direction: 'bottom', // 'bottom' or 'top'
            ...options
        };

        // Resize
        function resize() {
            // Fit to parent
            const rect = canvas.parentElement.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        }
        window.addEventListener('resize', resize);
        resize();

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;

                if (config.direction === 'top') {
                    this.y = -50; // Spawn above
                    this.vx = (Math.random() - 0.5) * 1;
                    this.vy = (1 + Math.random()); // Downward velocity
                } else {
                    this.y = height + 50; // Spawn below
                    this.vx = (Math.random() - 0.5) * 1;
                    this.vy = -(1 + Math.random()); // Upward velocity
                }

                this.alpha = 0;
                this.size = 50 + Math.random() * 100;
                this.angle = Math.random() * Math.PI * 2;
                this.life = 0;
                this.maxLife = 4 + Math.random() * 3;
            }

            update(dt) {
                this.life += dt;
                this.x += this.vx;
                this.y += this.vy;
                this.angle += 0.002;
                this.size += 0.2;

                // Lifecycle
                if (this.life < 1) {
                    this.alpha = this.life;
                } else if (this.life > this.maxLife - 2) {
                    this.alpha = (this.maxLife - this.life) / 2;
                } else {
                    this.alpha = 1;
                }

                if (this.life >= this.maxLife) {
                    this.alpha = 0;
                    return false;
                }
                return true;
            }

            draw(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha * 0.4));
                if (smokeImage.complete) {
                    ctx.drawImage(smokeImage, -this.size / 2, -this.size / 2, this.size, this.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#aaa';
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        // Animation Loop
        let lastTime = 0;
        let spawnTimer = 0;

        function animate(time) {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            context.clearRect(0, 0, width, height);

            // Spawn
            spawnTimer += dt;
            if (spawnTimer > settings.spawnFreq) {
                spawnTimer = 0;
                particles.push(new Particle());
            }

            // Update & Draw
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                const alive = p.update(dt);
                if (!alive) {
                    particles.splice(i, 1);
                } else {
                    p.draw(context);
                }
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    // Initialize for Footer and Hero (Bottom Up)
    initSmoke('footer-smoke-canvas', { direction: 'bottom' });
    initSmoke('hero-smoke-canvas', { direction: 'bottom' });

    // Pricol Limited (Top Down)
    initSmoke('c1-smoke-canvas', { direction: 'top' });

    // 50 Years Section (Both directions)
    initSmoke('fifty-smoke-top', { direction: 'top' });
    initSmoke('fifty-smoke-bottom', { direction: 'bottom' });
});


/**
 * Procedural Fog Effect
 * High-performance canvas particle system for "Modern Corporate" atmospheric mist.
 */

class FogParticle {
    constructor(canvasWidth, canvasHeight) {
        this.cw = canvasWidth;
        this.ch = canvasHeight;
        this.reset(true);
    }

    reset(initial = false) {
        // Randomize properties
        this.x = Math.random() * this.cw;

        // Spread vertically but generally favor lower/mid screen if desired, 
        // but for full atmosphere we distribute everywhere.
        this.y = Math.random() * this.ch;

        // Parallax Layer: 0 (back/slow), 1 (mid), 2 (front/fast)
        this.layer = Math.floor(Math.random() * 3);

        // Size: vary by layer (closer = bigger)
        const baseSize = this.cw < 600 ? 100 : 250;
        this.radius = baseSize + (Math.random() * baseSize) + (this.layer * 50);

        // Movement (Drift)
        this.vx = (Math.random() - 0.5) * 0.2; // Very slow horizontal drift
        this.vy = (Math.random() - 0.5) * 0.1; // Very slow vertical drift

        // Opacity
        this.initialAlpha = 0.02 + (Math.random() * 0.04); // Very subtle (0.02 - 0.06)
        this.alpha = this.initialAlpha;

        // If not initial, maybe spawn off-screen or fade in
        if (!initial) {
            // Spawn logic if needed, for now just random placement is okay for continuous loop
        }
    }

    update(scrollY) {
        // Continuous Drift
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < -this.radius) this.x = this.cw + this.radius;
        if (this.x > this.cw + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = this.ch + this.radius;
        if (this.y > this.ch + this.radius) this.y = -this.radius;

        // Scroll Parallax connection
        // Layer 0: 10% scroll speed, Layer 1: 20%, Layer 2: 40%
        this.parallaxY = scrollY * (0.1 + (this.layer * 0.15));
    }

    draw(ctx, scrollY) {
        // Draw position includes scroll offset
        // We want the fog to move *against* scroll or with it? 
        // "Foreground moves faster" implies standard parallax. 
        // Since canvas is FIXED, we simulate movement by offsetting Y.
        // If we scroll DOWN (scrollY increases), stuff usually moves UP.
        // So we subtract parallaxY.

        const drawY = this.y - this.parallaxY;

        // Simple wrapping for visual continuity during massive scrolls
        // (This is a naive wrap for vertical scroll, might need more complex logic for long pages,
        // but for atmospheric haze, drifting particles usually just stick to the screen area).
        // Actually, if it's FIXED background, we might not want it to scroll away fully, 
        // just shift slightly to feel alive. 

        // Let's keep it mainly fixed per screen but with slight shift
        const visualY = (drawY % (this.ch + this.radius * 2));
        // Adjust for seamless wrap logic if modulo result is negative

        // Better approach for constant atmosphere: 
        // Don't move the *base* Y with scroll endlessly. 
        // Just shift it a bit.
        const shiftY = (-scrollY * (0.05 * (this.layer + 1)));

        ctx.beginPath();
        // Create radial gradient for soft "puff" look
        // We reuse gradient if possible or just draw simple soft shapes.
        // Radials are expensive if too many. 
        // Optimization: Pre-render simple puff image? 
        // For distinct "corporate" look, lets use simple drawing first.

        const g = ctx.createRadialGradient(this.x, this.y + shiftY, 0, this.x, this.y + shiftY, this.radius);

        // "Light blue / neutral white"
        // RGB: 220, 235, 255 (Azure-ish)
        g.addColorStop(0, `rgba(225, 235, 245, ${this.alpha})`);
        g.addColorStop(1, `rgba(225, 235, 245, 0)`);

        ctx.fillStyle = g;
        ctx.fillRect(this.x - this.radius, (this.y + shiftY) - this.radius, this.radius * 2, this.radius * 2);
    }
}

class FogEngine {
    constructor() {
        this.canvas = document.getElementById('fog-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.count = 40; // Number of puffs
        this.scrollY = 0;

        this.resize();
        this.initParticles();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        }, { passive: true });

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            this.particles.push(new FogParticle(this.width, this.height));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Global Fog Intensity Modulation based on scroll
        // "Intensity increases very slightly during scroll"
        // clamp scrollY impact to 0 - 1500px range maybe
        const scrollFactor = Math.min(this.scrollY / 2000, 1);
        // We can pass this to particles if we want dynamic opacity changes

        this.particles.forEach(p => {
            p.update(this.scrollY);
            p.draw(this.ctx, this.scrollY);
        });

        requestAnimationFrame(this.animate);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FogEngine();
});

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'smoke-cursor';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '9999' // Topmost
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: undefined, y: undefined };
    let lastMouse = { x: undefined, y: undefined };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        const currentX = e.clientX;
        const currentY = e.clientY;

        if (lastMouse.x === undefined) {
            lastMouse.x = currentX;
            lastMouse.y = currentY;
        }

        const dist = Math.hypot(currentX - lastMouse.x, currentY - lastMouse.y);
        const steps = Math.floor(dist / 2); // Spawn every 2 pixels for continuity

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = lastMouse.x + (currentX - lastMouse.x) * t;
            const y = lastMouse.y + (currentY - lastMouse.y) * t;
            spawn(x, y);
        }

        // Also spawn at current
        spawn(currentX, currentY);

        lastMouse.x = currentX;
        lastMouse.y = currentY;
        mouse.x = currentX;
        mouse.y = currentY;
    });

    function spawn(x, y) {
        // Lighter, fewer particles per step to avoid buildup
        particles.push({
            x: x + (Math.random() - 0.5) * 15,
            y: y + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 0.5, // Slower drift
            vy: (Math.random() - 1) * 0.5 - 0.5, // Upward drift
            life: 1,
            decay: 0.008 + Math.random() * 0.005, // Slower decay for continuity
            size: 30 + Math.random() * 30, // Larger soft puffs
            color: `rgba(255, 255, 255, ${0.05 + Math.random() * 0.05})` // Very Light Opacity (0.05 - 0.1)
        });
    }

    function update() {
        ctx.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.size += 0.2; // Slowly expand

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            const alpha = p.life * 0.8; // Fade out multiplier
            // Use the base color/alpha calculated at spawn
            // We need to parse the alpha from p.color or just use white with dynamic alpha
            // Let's just use white for "light" fog
            grad.addColorStop(0, `rgba(255, 255, 255, ${p.life * 0.15})`); // Max alpha 0.15
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grad;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(update);
    }

    update();
});

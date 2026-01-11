import React, { useEffect, useRef } from 'react';

export default function OptimizedBackground() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;
        let dots = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createDots = () => {
            dots = [];
            const numDots = Math.floor((canvas.width * canvas.height) / 10000); // Random dots based on screen size

            for (let i = 0; i < numDots; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                dots.push({
                    baseX: x,
                    baseY: y,
                    x: x,
                    y: y,
                    vx: 0,
                    vy: 0,
                    size: 2,
                    color: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})` // White with random opacity
                });
            }
        };

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            dots.forEach(dot => {
                const dx = mouseRef.current.x - dot.x;
                const dy = mouseRef.current.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    dot.vx -= (dx / distance) * force * 0.5;
                    dot.vy -= (dy / distance) * force * 0.5;
                }

                dot.vx += (dot.baseX - dot.x) * 0.05;
                dot.vy += (dot.baseY - dot.y) * 0.05;
                dot.vx *= 0.99; // Reduced friction for longer damping
                dot.vy *= 0.99;
                dot.x += dot.vx;
                dot.y += dot.vy;

                ctx.fillStyle = dot.color;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        createDots();
        window.addEventListener('resize', () => {
            resizeCanvas();
            createDots();
        });
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
}

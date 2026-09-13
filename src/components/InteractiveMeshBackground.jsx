import { useEffect, useRef } from 'react';

const THEMES = {
  default: { c1: [16, 185, 129], c2: [52, 211, 153], c3: [45, 212, 191] },  // Emerald, Mint, Jade Teal
  coding: { c1: [5, 150, 105], c2: [16, 185, 129], c3: [110, 231, 183] },   // Forest Emerald, Emerald, Light Mint
  design: { c1: [16, 185, 129], c2: [132, 204, 22], c3: [45, 212, 191] },   // Emerald, Spring Lime, Jade Teal
  video: { c1: [4, 120, 87], c2: [16, 185, 129], c3: [167, 243, 208] }      // Deep Pine, Emerald, Frosted Mint
};

export default function InteractiveMeshBackground({ theme = 'default' }) {
  const canvasRef = useRef(null);
  const idleTimer = useRef(null);
  const isIdle = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const colors = THEMES[theme] || THEMES.default;

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#010a05');
    bgGradient.addColorStop(1, '#04160c');

    let time = 0;
    const render = () => {
      if (isIdle.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.0015;
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const drawOrb = (xBase, yBase, radius, r, g, b, a, speedX, speedY) => {
        const x = xBase + Math.sin(time * speedX) * (width * 0.25);
        const y = yBase + Math.cos(time * speedY) * (height * 0.25);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      };

      drawOrb(width * 0.3, height * 0.3, width * 0.45, colors.c1[0], colors.c1[1], colors.c1[2], 0.16, 0.3, 0.4);
      drawOrb(width * 0.7, height * 0.6, width * 0.55, colors.c2[0], colors.c2[1], colors.c2[2], 0.13, 0.2, 0.3);
      drawOrb(width * 0.5, height * 0.5, width * 0.65, colors.c3[0], colors.c3[1], colors.c3[2], 0.09, 0.4, 0.2);

      // Subtle noise shimmer layer
      ctx.fillStyle = 'rgba(255,255,255,0.012)';
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = () => {
      isIdle.current = false;
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        isIdle.current = true;
      }, 5000);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer.current);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  );
}

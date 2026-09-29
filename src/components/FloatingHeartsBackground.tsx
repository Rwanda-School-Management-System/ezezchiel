import React, { useEffect, useRef } from 'react';

interface HeartParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
}

const HEART_COLORS = [
  '#F43F5E', // Rose crimson
  '#EC4899', // Pink
  '#10B981', // Emerald green (Rwanda flag resonance)
  '#F59E0B', // Amber gold (Rwanda sun resonance)
  '#3B82F6', // Sky blue
  '#8B5CF6', // Purple
  '#06B6D4'  // Cyan
];

export const FloatingHeartsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const count = Math.min(35, Math.floor(width / 45));
    const particles: HeartParticle[] = [];

    const createHeart = (initialY?: number): HeartParticle => {
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : height + Math.random() * 50,
        size: Math.random() * 14 + 10,
        speedY: Math.random() * 0.7 + 0.35,
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.18 + 0.08, // Subtle opacity to never obstruct reading
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01
      };
    };

    for (let i = 0; i < count; i++) {
      particles.push(createHeart(Math.random() * height));
    }

    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      opacity: number,
      rotation: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.beginPath();
      context.globalAlpha = opacity;
      context.fillStyle = color;

      // Draw SVG Heart Path
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      context.bezierCurveTo(
        -size / 2,
        -topCurveHeight,
        -size,
        size / 3,
        0,
        size
      );
      context.bezierCurveTo(
        size,
        size / 3,
        size / 2,
        -topCurveHeight,
        0,
        topCurveHeight
      );

      context.closePath();
      context.fill();
      context.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.y -= p.speedY;
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.4;
        p.rotation += p.rotationSpeed;

        if (p.y < -50 || p.x < -50 || p.x > width + 50) {
          particles[idx] = createHeart(height + 20);
        }

        drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};

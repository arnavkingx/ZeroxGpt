import React, { useEffect, useRef } from 'react';

interface ZeroxOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioLevel?: number; // 0.0 to 1.0
  className?: string;
  onClick?: () => void;
}

export const ZeroxOrb: React.FC<ZeroxOrbProps> = ({
  size = 'md',
  state = 'idle',
  audioLevel = 0,
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 72;
      case 'lg':
        return 140;
      case 'hero':
        return 260;
      default:
        return 72;
    }
  };

  const dim = getDimensions();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const particleCount = size === 'hero' ? 40 : size === 'lg' ? 24 : 12;
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      distance: 0.75 + Math.random() * 0.45,
      speed: 0.012 + Math.random() * 0.02,
      size: 1.2 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.6,
    }));

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = (width / 2) * 0.52;

      ctx.clearRect(0, 0, width, height);

      let speedMult = 1;
      let pulseAmp = 0.06;
      if (state === 'thinking') {
        speedMult = 2.6;
        pulseAmp = 0.14;
      } else if (state === 'speaking') {
        speedMult = 1.6;
        pulseAmp = 0.1 + audioLevel * 0.28;
      } else if (state === 'listening') {
        speedMult = 1.2;
        pulseAmp = 0.08 + audioLevel * 0.3;
      }

      const pulse = Math.sin(time * 2 * speedMult) * pulseAmp;
      const currentRadius = baseRadius * (1 + pulse);

      // 1. Soft Ambient outer halo
      const outerGlow = ctx.createRadialGradient(
        cx,
        cy,
        currentRadius * 0.3,
        cx,
        cy,
        currentRadius * 1.6
      );
      outerGlow.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      outerGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.12)');
      outerGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 2. High-Tech Plasma Core
      const coreGrad = ctx.createRadialGradient(
        cx - currentRadius * 0.2,
        cy - currentRadius * 0.2,
        currentRadius * 0.05,
        cx,
        cy,
        currentRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#38bdf8');
      coreGrad.addColorStop(0.7, '#0284c7');
      coreGrad.addColorStop(1, '#0f172a');

      ctx.save();
      ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';
      ctx.shadowBlur = size === 'hero' ? 35 : 16;

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Orbital Energy Wave Rings
      const rings = [
        { rot: time * 0.8 * speedMult, rX: currentRadius * 1.15, rY: currentRadius * 0.45 },
        { rot: -time * 0.6 * speedMult, rX: currentRadius * 1.25, rY: currentRadius * 0.55 },
        { rot: time * 1.1 * speedMult + 1.2, rX: currentRadius * 1.05, rY: currentRadius * 0.7 },
      ];

      rings.forEach((ring, index) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.rot);

        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rX, ring.rY, 0, 0, Math.PI * 2);
        ctx.strokeStyle =
          index === 0
            ? 'rgba(2, 132, 199, 0.85)'
            : index === 1
            ? 'rgba(6, 182, 212, 0.7)'
            : 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = size === 'hero' ? 2.5 : 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // 4. Shimmering Energy Particles
      particles.forEach((p) => {
        p.angle += p.speed * speedMult;
        const dist = currentRadius * p.distance * (1 + Math.sin(time + p.angle) * 0.1);
        const px = cx + Math.cos(p.angle) * dist;
        const py = cy + Math.sin(p.angle) * dist;

        ctx.fillStyle = `rgba(2, 132, 199, ${p.opacity * (0.6 + Math.sin(time * 3 + p.angle) * 0.4)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dim, state, audioLevel, size]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      } ${className}`}
      style={{ width: dim, height: dim }}
    >
      <canvas
        ref={canvasRef}
        width={dim * 2}
        height={dim * 2}
        style={{ width: dim, height: dim }}
        className="pointer-events-none"
      />
    </div>
  );
};

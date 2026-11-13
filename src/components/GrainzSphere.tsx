import React, { useEffect, useRef } from 'react';

/**
 * Animated stippled/dotted particle sphere inspired by GRAINZ Framer template.
 * - Thousands of tiny stippled points arranged on a mathematical sphere surface (Fibonacci spiral).
 * - Rotates smoothly in 3D space with subtle ambient tilting.
 * - Mouse interaction gently tilts the perspective.
 * - Respects prefers-reduced-motion and reduces load when offscreen/background.
 * - Ultra lightweight: pure canvas 2D context, 60fps, no heavy Three.js runtime needed.
 */
export const GrainzSphere: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generate points on sphere using Fibonacci spiral distribution
    const numPoints = 1600;
    const points: Array<{ x: number; y: number; z: number; baseAlpha: number }> = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Random micro variation for authentic grainz texture
      points.push({
        x,
        y,
        z,
        baseAlpha: 0.35 + Math.random() * 0.45,
      });
    }

    let rotX = 0.2;
    let rotY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltY = x * 0.35;
      targetTiltX = -y * 0.35;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tilt damping
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;

      if (!prefersReducedMotion) {
        rotY += 0.0035; // Continuous subtle rotation
        rotX += 0.0008;
      }

      const sphereRadius = Math.min(width, height) * 0.42;
      const centerX = width / 2;
      const centerY = height / 2;

      // Rotation matrix values
      const totalRotY = rotY + currentTiltY;
      const totalRotX = rotX + currentTiltX;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      // Pre-compute transformed points and sort by depth for correct lighting
      const projected: Array<{ px: number; py: number; size: number; alpha: number; isAccent: boolean }> = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Rotate around Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 2.4;
        const perspective = fov / (fov + z2);

        const px = centerX + x1 * sphereRadius * perspective;
        const py = centerY + y2 * sphereRadius * perspective;

        // Depth-based lighting: front points are bright white/lime, back points fade into dark charcoal
        const depthFactor = (z2 + 1) / 2; // 0 (far) to 1 (near)
        if (depthFactor < 0.1) continue; // cull far back

        const alpha = Math.min(1, Math.max(0.06, depthFactor * depthFactor * p.baseAlpha));
        const size = Math.max(0.8, (0.8 + depthFactor * 1.6) * perspective);

        // Every ~18th point has a subtle lime accent tint
        const isAccent = i % 19 === 0 && depthFactor > 0.5;

        projected.push({ px, py, size, alpha, isAccent });
      }

      // Draw stippled dots
      for (let j = 0; j < projected.length; j++) {
        const pt = projected[j];
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);

        if (pt.isAccent) {
          ctx.fillStyle = `rgba(197, 248, 42, ${pt.alpha * 0.95})`; // GRAINZ electric lime
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
        }
        ctx.fill();
      }

      // Subtle ambient core glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sphereRadius * 0.85);
      gradient.addColorStop(0, 'rgba(197, 248, 42, 0.025)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[640px] max-h-[640px] opacity-90 transition-opacity duration-1000"
        style={{ filter: 'contrast(115%) brightness(105%)' }}
        aria-hidden="true"
      />
    </div>
  );
};

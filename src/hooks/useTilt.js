import { useCallback, useRef } from 'react';

/**
 * Custom hook for 3D card tilt effect following cursor position.
 * Uses requestAnimationFrame for smooth 60fps updates.
 *
 * @param {Object} options
 * @param {number} options.maxTilt - Maximum tilt angle in degrees. Default 5
 * @param {number} options.scale - Scale factor on hover. Default 1.02
 * @param {number} options.perspective - CSS perspective value. Default 800
 * @param {number} options.speed - Transition speed in ms for reset. Default 400
 * @returns {{ onMouseMove, onMouseEnter, onMouseLeave }}
 */
export default function useTilt({
  maxTilt = 5,
  scale = 1.02,
  perspective = 800,
  speed = 400,
} = {}) {
  const rafId = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = e.currentTarget;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalize to -1 ... 1
      const normalX = (x - centerX) / centerX;
      const normalY = (y - centerY) / centerY;

      // Invert Y for natural tilt direction
      const rotateX = -normalY * maxTilt;
      const rotateY = normalX * maxTilt;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      el.style.transition = 'transform 0.1s ease-out';
    });
  }, [maxTilt, scale, perspective]);

  const onMouseEnter = useCallback((e) => {
    const el = e.currentTarget;
    if (!el) return;
    el.style.transition = `transform 0.1s ease-out`;
  }, []);

  const onMouseLeave = useCallback((e) => {
    const el = e.currentTarget;
    if (!el) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    el.style.transition = `transform ${speed}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  }, [speed, perspective]);

  return { onMouseMove, onMouseEnter, onMouseLeave };
}

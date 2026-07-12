import { useEffect, useRef, useState } from "react";

/**
 * 3D glass-styled arrow cursor tinted with Busistree logo colors.
 * - Arrow: glassy SVG pointer that tracks the mouse tip.
 * - Trailing ring: follows the pointer with easing (no hover variants).
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
const GlassCursor = () => {
  const arrowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;
    setEnabled(true);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (arrowRef.current) {
        arrowRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.classList.add("glass-cursor-active");

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("glass-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="glass-cursor-ring" />
      <div ref={arrowRef} aria-hidden="true" className="glass-cursor-arrow">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <defs>
            <linearGradient id="glassCursorFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(166 47% 55%)" stopOpacity="0.95" />
              <stop offset="45%" stopColor="hsl(205 60% 60%)" stopOpacity="0.9" />
              <stop offset="75%" stopColor="hsl(260 35% 60%)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(308 45% 58%)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="glassCursorGloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.85" />
              <stop offset="55%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M4 2.5 L4 19 L8.6 15.1 L11.4 21.2 L14.1 20 L11.4 14 L17.5 13.7 Z"
            fill="url(#glassCursorFill)"
            stroke="hsl(0 0% 100% / 0.9)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <path
            d="M4 2.5 L4 12 L7.2 9.4 L9.6 8.6 L14.5 8.8 Z"
            fill="url(#glassCursorGloss)"
          />
        </svg>
      </div>
    </>
  );
};

export default GlassCursor;

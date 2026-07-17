import { useEffect, useRef } from "react";
import videoAsset from "@/assets/templates-hero.mp4.asset.json";

/**
 * Scroll-driven video player: frame advances with scroll forward/reverse.
 * The wrapper is tall (scrollHeight); the video sticks in view while the user scrolls.
 */
const ScrollVideo = ({ className = "" }: { className?: string }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    const tick = () => {
      if (!video.duration) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(scrollable, 1));
      const progress = scrollable > 0 ? scrolled / scrollable : 0;
      targetTime.current = progress * video.duration;
      // Smoothly approach target for buttery interpolation
      const delta = targetTime.current - video.currentTime;
      if (Math.abs(delta) > 0.01) {
        video.currentTime += delta * 0.25;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`} style={{ height: "220vh" }}>
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={videoAsset.url}
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-background/40" />
      </div>
    </div>
  );
};

export default ScrollVideo;

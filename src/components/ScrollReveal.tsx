import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global, restrained scroll-reveal. Adds a soft fade+slide to <section>
 * elements inside <main> as they enter the viewport. Opt out on any
 * section with `data-no-reveal`. Respects prefers-reduced-motion.
 *
 * Motion budget: 260ms, ease-out, no bouncy easing.
 */
const REVEAL_ATTR = "data-reveal";
const VISIBLE_CLASS = "is-visible";

const ScrollReveal = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(VISIBLE_CLASS);
            io?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io = observer;

    const register = (root: ParentNode) => {
      const nodes = root.querySelectorAll<HTMLElement>(
        "main section:not([data-no-reveal]):not([" + REVEAL_ATTR + "])",
      );
      nodes.forEach((el) => {
        el.setAttribute(REVEAL_ATTR, "");
        observer.observe(el);
      });
    };

    // Initial pass — retry a couple of frames in case route content is still mounting.
    register(document);
    const raf1 = requestAnimationFrame(() => register(document));
    const t = window.setTimeout(() => register(document), 120);

    // Catch lazy-mounted sections.
    mo = new MutationObserver(() => register(document));
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t);
      observer.disconnect();
      mo?.disconnect();
    };
  }, [pathname]);

  return null;
};

export default ScrollReveal;

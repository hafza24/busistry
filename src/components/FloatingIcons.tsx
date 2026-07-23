import cap from "@/assets/float-cap.png";
import books from "@/assets/float-books.png";
import monitor from "@/assets/float-monitor.png";
import briefcase from "@/assets/float-briefcase.png";
import rocket from "@/assets/float-rocket.png";
import globe from "@/assets/float-globe.png";
import pencil from "@/assets/float-pencil.png";
import trophy from "@/assets/float-trophy.png";

type Item = {
  src: string;
  alt: string;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  rotate: string;
  opacity: string;
};

const ITEMS: Item[] = [
  { src: cap, alt: "", top: "6%", left: "4%", size: 72, delay: "0s", duration: "9s", rotate: "-12deg", opacity: "0.55" },
  { src: rocket, alt: "", top: "18%", left: "92%", size: 64, delay: "1.2s", duration: "11s", rotate: "18deg", opacity: "0.5" },
  { src: books, alt: "", top: "42%", left: "2%", size: 80, delay: "0.6s", duration: "10s", rotate: "8deg", opacity: "0.45" },
  { src: globe, alt: "", top: "58%", left: "94%", size: 76, delay: "2s", duration: "12s", rotate: "-6deg", opacity: "0.5" },
  { src: pencil, alt: "", top: "30%", left: "50%", size: 56, delay: "1.8s", duration: "8s", rotate: "35deg", opacity: "0.35" },
  { src: briefcase, alt: "", top: "78%", left: "12%", size: 68, delay: "0.4s", duration: "13s", rotate: "-4deg", opacity: "0.45" },
  { src: monitor, alt: "", top: "88%", left: "78%", size: 72, delay: "2.4s", duration: "10s", rotate: "10deg", opacity: "0.45" },
  { src: trophy, alt: "", top: "70%", left: "58%", size: 60, delay: "1s", duration: "11s", rotate: "-14deg", opacity: "0.4" },
];

const FloatingIcons = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden -z-10 hidden md:block"
    >
      {ITEMS.map((it, i) => (
        <img
          key={i}
          src={it.src}
          alt=""
          width={it.size}
          height={it.size}
          loading="lazy"
          className="absolute animate-[float_var(--dur)_ease-in-out_infinite]"
          style={{
            top: it.top,
            left: it.left,
            width: it.size,
            height: it.size,
            opacity: Number(it.opacity),
            transform: `translate(-50%, -50%) rotate(${it.rotate})`,
            animationDelay: it.delay,
            ["--dur" as never]: it.duration,
            filter: "drop-shadow(0 12px 24px rgba(56, 156, 132, 0.18))",
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -18px; }
        }
      `}</style>
    </div>
  );
};

export default FloatingIcons;

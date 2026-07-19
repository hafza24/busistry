import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import tpl1 from "@/assets/cs-tpl-1.jpg.asset.json";
import tpl2 from "@/assets/cs-tpl-2.jpg.asset.json";
import tpl3 from "@/assets/cs-tpl-3.jpg.asset.json";

const LAUNCH_DATE = new Date();
LAUNCH_DATE.setDate(LAUNCH_DATE.getDate() + 30);
const TOTAL_MS = 30 * 24 * 60 * 60 * 1000;

const ComingSoon = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, LAUNCH_DATE.getTime() - now);
  const progress = Math.min(100, Math.max(0, ((TOTAL_MS - remaining) / TOTAL_MS) * 100));

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setEmail("");
    toast.success("You're on the list! We'll let you know when it launches.");
  };

  // Deterministic starfield
  const stars = Array.from({ length: 90 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const rand2 = ((i * 15731 + 789221) % 233280) / 233280;
    const rand3 = ((i * 2749 + 12345) % 233280) / 233280;
    return {
      top: `${(rand * 100).toFixed(2)}%`,
      left: `${(rand2 * 100).toFixed(2)}%`,
      size: (rand3 * 2 + 0.5).toFixed(2),
      opacity: (rand3 * 0.7 + 0.3).toFixed(2),
      delay: `${(rand * 4).toFixed(2)}s`,
    };
  });

  return (
    <>
      <SEO
        title="Coming Soon — Busistree"
        description="Site under reconstruction. Something new is on the way — join the waitlist."
        path="/coming-soon"
      />
      <main
        className="relative min-h-screen w-full overflow-hidden text-white font-display"
        style={{
          background:
            "radial-gradient(1200px 700px at 85% 20%, #6b2a5a 0%, transparent 55%)," +
            "radial-gradient(900px 600px at 15% 80%, #3a1a5c 0%, transparent 60%)," +
            "radial-gradient(700px 500px at 50% 50%, #1a1030 0%, transparent 70%)," +
            "linear-gradient(180deg, #0a0616 0%, #120a24 50%, #0a0616 100%)",
        }}
      >
        {/* Starfield */}
        <div className="pointer-events-none absolute inset-0">
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top: s.top,
                left: s.left,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: Number(s.opacity),
                animationDelay: s.delay,
                animationDuration: "3s",
              }}
            />
          ))}
        </div>

        {/* Faded template collage */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={tpl1.url}
            alt=""
            aria-hidden
            className="cs-drift-a absolute opacity-[0.12] mix-blend-screen blur-[1px] rounded-xl shadow-2xl"
            style={{ top: "8%", left: "4%", width: "clamp(280px, 32vw, 520px)" }}
          />
          <img
            src={tpl2.url}
            alt=""
            aria-hidden
            className="cs-drift-b absolute opacity-[0.14] mix-blend-screen blur-[1px] rounded-xl shadow-2xl"
            style={{ bottom: "6%", right: "3%", width: "clamp(320px, 36vw, 620px)" }}
          />
          <img
            src={tpl2.url}
            alt=""
            aria-hidden
            className="cs-drift-c absolute opacity-[0.08] mix-blend-screen blur-[2px] rounded-xl"
            style={{ top: "12%", right: "18%", width: "clamp(220px, 22vw, 380px)" }}
          />
          <img
            src={tpl1.url}
            alt=""
            aria-hidden
            className="cs-drift-d absolute opacity-[0.09] mix-blend-screen blur-[2px] rounded-xl"
            style={{ bottom: "14%", left: "16%", width: "clamp(220px, 22vw, 380px)" }}
          />
          <img
            src={tpl3.url}
            alt=""
            aria-hidden
            className="cs-drift-a absolute opacity-[0.13] mix-blend-screen blur-[1px] rounded-xl shadow-2xl"
            style={{ top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "clamp(360px, 44vw, 720px)" }}
          />
          <img
            src={tpl3.url}
            alt=""
            aria-hidden
            className="cs-drift-b absolute opacity-[0.10] mix-blend-screen blur-[2px] rounded-xl"
            style={{ top: "6%", right: "28%", width: "clamp(240px, 26vw, 440px)" }}
          />
          <img
            src={tpl3.url}
            alt=""
            aria-hidden
            className="cs-drift-c absolute opacity-[0.09] mix-blend-screen blur-[2px] rounded-xl"
            style={{ bottom: "8%", left: "2%", width: "clamp(240px, 26vw, 440px)" }}
          />
          {/* Vignette to soften edges and keep center readable */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(10,6,22,0.55) 0%, rgba(10,6,22,0.85) 60%, rgba(10,6,22,0.95) 100%)",
            }}
          />
        </div>


        {/* Clouds / nebula */}
        <div
          className="pointer-events-none absolute -bottom-20 right-0 w-[70%] h-[55%]"
          style={{
            background:
              "radial-gradient(ellipse at 60% 70%, rgba(255, 180, 210, 0.25) 0%, transparent 60%)," +
              "radial-gradient(ellipse at 30% 90%, rgba(140, 90, 190, 0.35) 0%, transparent 55%)",
            filter: "blur(20px)",
          }}
        />

        {/* Top bar */}
        <header className="relative z-20 flex items-center justify-end px-6 md:px-12 pt-8">
          <Link
            to="/contact"
            className="text-xs md:text-sm tracking-[0.35em] uppercase text-white/80 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </header>


        {/* Center content */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 text-center min-h-[calc(100vh-14rem)] pt-10">
          <p className="text-[10px] md:text-xs tracking-[0.6em] uppercase text-white/70 mb-6">
            — Site under reconstruction —
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[0.15em] md:tracking-[0.25em] leading-none">
            COMING SOON
          </h1>

          {/* Progress */}
          <div className="mt-12 w-full max-w-md">
            <div className="h-2 w-full rounded-full bg-white/10 backdrop-blur-sm overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-300 via-fuchsia-300 to-white transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>

          </div>

          {/* Waitlist */}
          <form
            onSubmit={onSubmit}
            className="mt-10 flex w-full max-w-md flex-col sm:flex-row items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md p-1.5"
          >
            <div className="relative flex-1 w-full">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="pl-10 h-10 bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 w-full sm:w-auto rounded-full bg-white text-purple-900 hover:bg-white/90 tracking-[0.2em] text-xs uppercase font-semibold px-6"
            >
              {submitting ? "Adding..." : "Notify me"}
            </Button>
          </form>
        </section>

        {/* Footer */}
        <footer className="relative z-20 pb-6 text-center">
          <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50">
            Copyright © {new Date().getFullYear()} Busistree — All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
};

export default ComingSoon;

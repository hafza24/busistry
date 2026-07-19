import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
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
        className="relative min-h-screen lg:h-screen w-full overflow-x-hidden lg:overflow-hidden text-white font-display flex flex-col"


        style={{
          background:
            "radial-gradient(1200px 700px at 85% 20%, #1d6a5c 0%, transparent 55%)," +
            "radial-gradient(900px 600px at 15% 80%, #1a4a6b 0%, transparent 60%)," +
            "radial-gradient(700px 500px at 50% 50%, #0f2a2f 0%, transparent 70%)," +
            "linear-gradient(180deg, #05100f 0%, #082018 50%, #05100f 100%)",
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
                "radial-gradient(ellipse at center, rgba(5,16,15,0.55) 0%, rgba(5,16,15,0.85) 60%, rgba(5,16,15,0.95) 100%)",
            }}
          />
        </div>


        {/* Clouds / nebula — brand tinted */}
        <div
          className="pointer-events-none absolute -bottom-20 right-0 w-[70%] h-[55%]"
          style={{
            background:
              "radial-gradient(ellipse at 60% 70%, rgba(56, 156, 132, 0.28) 0%, transparent 60%)," +
              "radial-gradient(ellipse at 30% 90%, rgba(56, 126, 177, 0.30) 0%, transparent 55%)",
            filter: "blur(20px)",
          }}
        />



        {/* Two-column content */}
        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-stretch w-full flex-1 min-h-0">
          {/* Left: About Busistree */}
          <div className="relative w-full h-full min-h-0 overflow-hidden">
            <div
              className="relative h-full overflow-hidden px-6 py-6 md:px-10 md:py-8 lg:px-14 text-left flex flex-col justify-center"
            >


              <p className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-[#5bc3a8] mb-3">
                — About Busistree
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3">
                The hub for everything your business needs to grow.
              </h2>
              <p className="text-xs md:text-sm text-white/75 leading-relaxed mb-4">
                Busistree brings planning, digital presence, product packaging, design,
                and marketing under one roof — so founders can launch, sell, and scale
                without juggling ten different tools or teams.
              </p>

              <ul className="space-y-2 mb-5">
                {[
                  { t: "Planning", d: "Business roadmaps, positioning & offers that convert." },
                  { t: "Digital Presence & Packaging", d: "Websites, storefronts and brand-ready product packaging." },
                  { t: "Design", d: "Logos, visuals and identity systems built to stand out." },
                  { t: "Marketing & Promos", d: "Campaigns, content and growth engines that ship." },
                ].map((f) => (
                  <li key={f.t} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#389c84] to-[#387eb1] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{f.t}</p>
                      <p className="text-xs text-white/65 leading-snug">{f.d}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Waitlist */}
              <form
                onSubmit={onSubmit}
                className="flex w-full flex-col sm:flex-row items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md p-1.5"
              >
                <div className="relative flex-1 w-full">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="pl-10 h-9 bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-9 w-full sm:w-auto rounded-full bg-gradient-to-r from-[#389c84] to-[#387eb1] text-white hover:opacity-90 tracking-[0.2em] text-xs uppercase font-semibold px-6 shadow-[0_8px_24px_-8px_rgba(56,156,132,0.6)]"
                >
                  {submitting ? "Adding..." : "Notify me"}
                </Button>
              </form>


            </div>
          </div>


          {/* Right: Coming Soon poster */}
          <div className="relative w-full h-full min-h-0 overflow-hidden">
            <div
              className="relative h-full overflow-hidden px-6 py-6 md:px-10 md:py-8 lg:px-14 text-center flex flex-col justify-center"
            >

              <div className="pointer-events-none absolute inset-0">
                <span className="absolute top-6 left-8 h-1 w-1 rounded-full bg-white/80 animate-pulse" />
                <span className="absolute top-16 right-10 h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "1s" }} />
                <span className="absolute bottom-12 left-14 h-1 w-1 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "2s" }} />
                <span className="absolute bottom-20 right-8 h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>

              <img
                src={logo}
                alt="Busistree"
                className="relative mx-auto h-12 md:h-14 w-auto object-contain mb-4 drop-shadow-[0_4px_20px_rgba(56,156,132,0.5)]"
              />

              <p className="relative text-[10px] md:text-xs tracking-[0.6em] uppercase text-white/70 mb-4">
                — Site under reconstruction —
              </p>
              <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.15em] md:tracking-[0.2em] leading-none bg-gradient-to-br from-white via-white to-[#5bc3a8] bg-clip-text text-transparent">
                COMING
                <br />
                SOON
              </h1>

              <div className="relative mt-6 w-full">
                <div className="flex items-center justify-between text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70 mb-2">
                  <span>Loading</span>
                  <span className="font-semibold text-white tabular-nums">99%</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-white/10 backdrop-blur-sm overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#389c84] via-[#387eb1] to-white transition-all duration-1000"
                    style={{ width: `99%` }}
                  />
                  <div
                    className="absolute inset-y-0 w-1/3 -translate-x-full animate-[cs-shimmer_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </div>
              </div>


              <p className="relative mt-4 text-xs md:text-sm text-white/70 tracking-[0.2em] uppercase">
                Something new is on the way
              </p>

              {/* Contact chips */}
              <div className="relative mt-5 pt-4 border-t border-white/10">
                <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/50 mb-3">
                  — Get in touch
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href="mailto:info@busistree.com"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs text-white/85 hover:text-white hover:border-[#389c84]/60 hover:bg-[#389c84]/15 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#5bc3a8]" />
                    info@busistree.com
                  </a>
                  <a
                    href="https://wa.me/923370428337"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs text-white/85 hover:text-white hover:border-[#389c84]/60 hover:bg-[#389c84]/15 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#5bc3a8]" />
                    WhatsApp
                  </a>
                  <a
                    href="tel:+923370428337"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs text-white/85 hover:text-white hover:border-[#389c84]/60 hover:bg-[#389c84]/15 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#5bc3a8]" />
                    +92 337 0428337
                  </a>
                </div>
              </div>

            </div>

            <div
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] blur-2xl opacity-60"
              style={{
                background:
                  "conic-gradient(from 120deg at 50% 50%, rgba(56,156,132,0.35), rgba(56,126,177,0.25), rgba(56,156,132,0.35))",
              }}
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-20 py-2 px-6 text-center shrink-0">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/50">
            Copyright © {new Date().getFullYear()} Busistree — All rights reserved.
          </p>
        </footer>

      </main>
    </>
  );
};

export default ComingSoon;


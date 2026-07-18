import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Linkedin, Mail, Twitter, Sparkles, ArrowRight } from "lucide-react";
import teamHafzaAsset from "@/assets/team-hafza.png.asset.json";
import teamRohmaAsset from "@/assets/team-rohma.png.asset.json";
import teamAsimAsset from "@/assets/team-asim.png.asset.json";
import teamKiranAsset from "@/assets/team-kiran.png.asset.json";
import teamRohaAsset from "@/assets/team-roha.png.asset.json";

const teamHafza = teamHafzaAsset.url;
const teamRohma = teamRohmaAsset.url;
const teamAsim = teamAsimAsset.url;
const teamKiran = teamKiranAsset.url;
const teamRoha = teamRohaAsset.url;

type Member = {
  name: string;
  role: string;
  bio: string;
  image: string;
  cardGradient: string;
  socials: { linkedin?: string; twitter?: string; email?: string };
};

const team: Member[] = [
  {
    name: "Hafza Azam",
    role: "CEO",
    image: teamHafza,
    cardGradient: "from-[#6b5cb8] via-[#8b7ecf] to-[#b8a5d9]",
    bio: "Hafza leads Busistree's vision and strategy. She's passionate about empowering Pakistani founders with tools that make launching a beautiful online store simple, fast and affordable.",
    socials: { linkedin: "#", twitter: "#", email: "hafza@busistree.com" },
  },
  {
    name: "Rohma Shahid",
    role: "CMO",
    image: teamRohma,
    cardGradient: "from-[#389c84] to-[#6ec4a8]",
    bio: "Rohma drives Busistree's marketing and brand. She crafts the stories, campaigns and creative that connect ambitious founders with the platform.",
    socials: { linkedin: "#", twitter: "#", email: "rohma@busistree.com" },
  },
  {
    name: "Asim Azeemi",
    role: "CCO",
    image: teamAsim,
    cardGradient: "from-[#7a8fbf] to-[#a8b8d9]",
    bio: "Asim leads customer success and operations. He makes sure every store request is handled with care, speed and craft — from first form to final launch.",
    socials: { linkedin: "#", twitter: "#", email: "asim@busistree.com" },
  },
  {
    name: "Kiran Masood",
    role: "HR Manager",
    image: teamKiran,
    cardGradient: "from-[#7c5fb8] to-[#b89ad9]",
    bio: "Kiran leads people and culture at Busistree. She builds the team, nurtures talent, and makes sure everyone has what they need to do their best work.",
    socials: { linkedin: "#", twitter: "#", email: "kiran@busistree.com" },
  },
  {
    name: "Roha Shahid",
    role: "Senior Fullstack Developer",
    image: teamRoha,
    cardGradient: "from-[#4a7c6f] to-[#8ab8a8]",
    bio: "Roha architects and builds Busistree end-to-end. From database schemas to pixel-perfect interfaces, she ships the platform that Pakistani founders rely on every day.",
    socials: { linkedin: "#", twitter: "#", email: "roha@busistree.com" },
  },
];

const Team = () => {
  return (
    <div className="pb-16">
      <SEO
        title="Our Team — Busistree"
        description="Meet the team building Busistree — helping Pakistani businesses plan, design, launch and grow online."
        path="/team"
      />

      {/* Hero */}
      {(() => {
        const m = team[0];
        return (
          <section className="relative overflow-hidden">
            {/* Ambient decorative accents */}
            <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

            <div className="container max-w-6xl relative grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 md:gap-16 items-center py-20 md:py-28">
              {/* Content */}
              <div className="relative z-10 order-2 md:order-1">
                <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-primary mb-6">
                  <span className="h-px w-10 bg-primary/60" />
                  Founder
                </div>

                <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-[1.1] text-foreground">
                  <span aria-hidden className="absolute -left-2 -top-6 md:-top-8 text-7xl md:text-8xl leading-none font-display text-primary/15 select-none">“</span>
                  Every Pakistani founder deserves a beautiful online store —{" "}
                  <span className="italic font-light text-primary">without the tech tax, the agency wait, or the guesswork.</span>
                </h1>

                <div className="mt-6 h-px w-16 bg-gradient-to-r from-primary to-transparent" />

                <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Hafza Azam is the founder & CEO of Busistree. A product-minded builder from Pakistan, she leads strategy, design and engineering — turning founders' ideas into launch-ready online businesses with clarity, care and craft.
                </p>

                <div className="flex items-center gap-2 mt-8">
                  {m.socials.linkedin && (
                    <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
                       className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all shadow-sm">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {m.socials.twitter && (
                    <a href={m.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Twitter`}
                       className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all shadow-sm">
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {m.socials.email && (
                    <a href={`mailto:${m.socials.email}`} aria-label={`Email ${m.name}`}
                       className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all shadow-sm">
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Founder portrait */}
              <div className="relative order-1 md:order-2">
                {/* Soft glow behind card */}
                <div aria-hidden className={`absolute -inset-4 rounded-[2rem] bg-gradient-to-br ${m.cardGradient} opacity-40 blur-2xl`} />

                <div className={`relative flex items-end justify-center rounded-[2rem] overflow-hidden bg-gradient-to-br ${m.cardGradient} min-h-[440px] md:min-h-[540px] shadow-2xl ring-1 ring-white/20`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.35),transparent_60%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(0,0,0,0.15),transparent_50%)] pointer-events-none" />

                  {/* Floating accent chip */}
                  <div className="absolute top-5 left-5 rounded-full bg-white/90 backdrop-blur px-3 py-1 shadow-md">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Busistree
                    </div>
                  </div>

                  <img
                    src={m.image}
                    alt={m.name}
                    className="relative max-h-[440px] md:max-h-[540px] w-auto object-contain drop-shadow-2xl"
                  />

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/95 backdrop-blur px-5 py-2 shadow-xl ring-1 ring-black/5">
                    <div className="text-foreground font-bold text-sm tracking-wide whitespace-nowrap">
                      {m.name}
                      <span className="text-muted-foreground font-medium"> · {m.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <section className="container max-w-6xl py-16 space-y-8">

        <div className="text-center space-y-2 mb-4">
          <div className="text-xs font-semibold tracking-widest uppercase text-primary">— The Crew</div>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Meet the team</h2>
        </div>



        {/* Remaining team */}
        <div className="grid sm:grid-cols-2 gap-8">
          {team.slice(1).map((m) => (
            <div
              key={m.name}
              className={`group relative rounded-3xl bg-gradient-to-br ${m.cardGradient} p-6 pt-8 shadow-xl hover:shadow-2xl transition-all overflow-hidden`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)] pointer-events-none" />


              <div className="relative aspect-square flex items-end justify-center">
                <img src={m.image} alt={m.name} loading="lazy" className="max-h-full w-auto object-contain drop-shadow-2xl" />
              </div>

              <div className="relative z-10 -mt-2 mx-auto w-fit rounded-full bg-white/95 backdrop-blur px-4 py-1.5 shadow-md">
                <div className="text-foreground font-bold text-sm tracking-wide">
                  {m.role} · <span className="text-muted-foreground font-semibold">{m.name}</span>
                </div>
              </div>

              <p className="relative z-10 mt-4 text-sm text-white/90 leading-relaxed">{m.bio}</p>

              <div className="relative z-10 flex items-center gap-2 mt-4">
                {m.socials.linkedin && (
                  <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
                     className="h-8 w-8 rounded-md bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {m.socials.twitter && (
                  <a href={m.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Twitter`}
                     className="h-8 w-8 rounded-md bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {m.socials.email && (
                  <a href={`mailto:${m.socials.email}`} aria-label={`Email ${m.name}`}
                     className="h-8 w-8 rounded-md bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Join us */}
      <section className="container max-w-5xl">
        <div className="text-center rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-10 md:p-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5" /> We're hiring
          </div>
          <h2 className="text-2xl md:text-4xl font-bold font-display text-foreground">
            Want to help build the future of Pakistani SaaS?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            We're always looking for designers, engineers, and customer specialists who care as much
            about local businesses as we do.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button size="lg" asChild>
              <Link to="/contact">Get in touch <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">About Busistree</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;

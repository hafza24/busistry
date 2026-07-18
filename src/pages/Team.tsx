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

      <section className="container max-w-6xl py-16 space-y-8">
        {/* CEO hero card */}
        {(() => {
          const m = team[0];
          return (
            <div
              className={`relative rounded-3xl bg-gradient-to-br ${m.cardGradient} p-8 md:p-10 shadow-xl overflow-hidden grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6 md:gap-10 items-center`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.28),transparent_60%)] pointer-events-none" />


              {/* Portrait */}
              <div className="relative flex items-end justify-center">
                <img
                  src={m.image}
                  alt={m.name}
                  className="max-h-[360px] w-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 text-white">
                <div className="italic text-sm text-white/75 tracking-wide mb-3 font-light">
                  — Founder
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight">
                  {m.name}
                </h2>
                <div className="text-lg font-semibold mt-1 text-white/85">{m.role}</div>
                <p className="mt-4 text-base text-white/90 leading-relaxed max-w-xl">
                  {m.bio}
                </p>
                <div className="flex items-center gap-2 mt-5">
                  {m.socials.linkedin && (
                    <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
                       className="h-9 w-9 rounded-md bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {m.socials.twitter && (
                    <a href={m.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Twitter`}
                       className="h-9 w-9 rounded-md bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {m.socials.email && (
                    <a href={`mailto:${m.socials.email}`} aria-label={`Email ${m.name}`}
                       className="h-9 w-9 rounded-md bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

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

import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Mail, Github, Users, Sparkles, ArrowRight } from "lucide-react";

type Member = {
  name: string;
  role: string;
  bio: string;
  initials: string;
  gradient: string;
  linkedin?: string;
  email?: string;
  github?: string;
};

const team: Member[] = [
  {
    name: "Asim Azeemi",
    role: "Founder & CEO",
    bio: "Leads product and strategy. Obsessed with helping local businesses launch fast and grow online.",
    initials: "AA",
    gradient: "from-primary to-accent",
    linkedin: "#",
    email: "mailto:asimazeemi04@gmail.com",
  },
  {
    name: "Design Lead",
    role: "Head of Design",
    bio: "Crafts the visual language for every template and product surface across the Busistree platform.",
    initials: "DL",
    gradient: "from-accent to-primary",
    linkedin: "#",
  },
  {
    name: "Engineering Lead",
    role: "Head of Engineering",
    bio: "Owns platform reliability, security, and the developer experience powering every store on Busistree.",
    initials: "EL",
    gradient: "from-primary/80 to-primary",
    github: "#",
  },
  {
    name: "Customer Success",
    role: "Customer Success",
    bio: "First point of contact for every launch. Turns onboarding chats into live websites in 24–48 hours.",
    initials: "CS",
    gradient: "from-accent/80 to-accent",
    email: "mailto:hello@busistree.com",
  },
  {
    name: "Growth Partner",
    role: "Growth & Marketing",
    bio: "Runs the growth services program — SEO, social, and ads for merchants ready to scale.",
    initials: "GP",
    gradient: "from-primary to-primary/70",
    linkedin: "#",
  },
  {
    name: "Support Lead",
    role: "Support & Operations",
    bio: "Keeps the lights on for existing customers — renewals, tickets, and platform operations.",
    initials: "SL",
    gradient: "from-accent to-accent/70",
    email: "mailto:support@busistree.com",
  },
];

const Team = () => {
  return (
    <div className="pb-16">
      <SEO
        title="Our Team — Busistree"
        description="Meet the team building Busistree — designers, engineers, and customer success specialists helping Pakistani businesses launch online."
        path="/team"
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />
        <div className="container max-w-4xl relative py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20 mb-5">
            <Users className="h-3.5 w-3.5" /> The team
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground leading-tight tracking-tight">
            Small team.<br />Big ambitions.
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            A tight crew of designers, engineers, and specialists — obsessed with shipping beautiful,
            fast, honest websites for Pakistani businesses.
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="container max-w-6xl py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((m) => (
            <Card key={m.name} className="group border-border/60 hover:shadow-lg hover:border-primary/40 transition-all overflow-hidden">
              <div className={`aspect-[4/3] bg-gradient-to-br ${m.gradient} flex items-center justify-center relative`}>
                <span className="text-6xl font-bold font-display text-primary-foreground drop-shadow-lg">
                  {m.initials}
                </span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary-foreground)/0.15),transparent_60%)]" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold font-display text-lg text-foreground">{m.name}</h3>
                <div className="text-sm text-primary font-semibold mt-0.5">{m.role}</div>
                <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>
                <div className="flex items-center gap-2 mt-4">
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
                       className="h-8 w-8 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {m.email && (
                    <a href={m.email} aria-label={`Email ${m.name}`}
                       className="h-8 w-8 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {m.github && (
                    <a href={m.github} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub`}
                       className="h-8 w-8 rounded-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
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

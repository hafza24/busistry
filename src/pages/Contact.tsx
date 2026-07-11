import SEO from "@/components/SEO";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Send, MessageCircle, Clock, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "@/lib/validation";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Errors = Partial<Record<keyof ContactFormValues, string>>;

const channels = [
  {
    icon: Mail,
    label: "Email",
    value: "info@busistree.com",
    href: "mailto:info@busistree.com",
    hint: "Replies within 1 business day",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+92 337 0428337",
    href: "https://wa.me/923370428337",
    hint: "Fastest response",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+92 337 0428337",
    href: "tel:+923370428337",
    hint: "Mon–Sat, 10am–7pm PKT",
  },
];

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState<ContactFormValues>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const { toast } = useToast();

  const setField = <K extends keyof ContactFormValues>(key: K, v: string) => {
    setValues((p) => ({ ...p, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ContactFormValues;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast({ title: "Please fix the errors", description: "Some fields need your attention.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't send message", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    setSent(true);
    setValues({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <div className="relative py-20 overflow-hidden">
      <SEO
        title="Contact — Busistree"
        description="Get in touch with the Busistree team. We typically respond within one business day."
        path="/contact"
      />

      <div className="container max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 backdrop-blur-sm px-4 py-1.5 mb-5 shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs font-medium text-muted-foreground">We're here to help</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-4 tracking-tight">
            Let's <span className="text-gradient-brand">talk</span>.
          </h1>
          <p className="text-lg text-muted-foreground">
            Questions, ideas, or just want to say hi? Pick a channel or drop us a note — we typically reply within a business day.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: contact channels */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {channels.map((c, i) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group relative block rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-5 hover-lift"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 grid place-items-center h-11 w-11 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <c.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {c.label}
                    </p>
                    <p className="font-medium text-foreground truncate">{c.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.hint}</p>
                  </div>
                </div>
              </a>
            ))}

            <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-muted-foreground">Mon – Sat · 10:00 – 19:00 PKT</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-muted-foreground">Based in Pakistan · Serving worldwide</span>
              </div>
            </div>
          </motion.aside>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <Card className="relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm shadow-soft">
              {/* subtle top gradient bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand" />
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold font-display">Send a message</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below and we'll get right back to you.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={values.name}
                        onChange={(e) => setField("name", e.target.value)}
                        maxLength={100}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-err" : undefined}
                        placeholder="Your name"
                        className="h-11"
                      />
                      {errors.name && <p id="name-err" className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={values.email}
                        onChange={(e) => setField("email", e.target.value)}
                        maxLength={255}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-err" : undefined}
                        placeholder="you@example.com"
                        className="h-11"
                      />
                      {errors.email && <p id="email-err" className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={values.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      maxLength={150}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "subject-err" : undefined}
                      placeholder="What's this about?"
                      className="h-11"
                    />
                    {errors.subject && <p id="subject-err" className="text-sm text-destructive">{errors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message">Message</Label>
                      <span className="text-xs text-muted-foreground">{values.message.length}/2000</span>
                    </div>
                    <Textarea
                      id="message"
                      value={values.message}
                      onChange={(e) => setField("message", e.target.value)}
                      rows={6}
                      maxLength={2000}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-err" : undefined}
                      placeholder="Tell us more..."
                      className="resize-none"
                    />
                    {errors.message && <p id="message-err" className="text-sm text-destructive">{errors.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95 hover-lift"
                    disabled={loading || sent}
                  >
                    {sent ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Message sent
                      </>
                    ) : loading ? (
                      "Sending..."
                    ) : (
                      <>
                        Send message
                        <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By sending, you agree to our privacy policy. We'll never share your info.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

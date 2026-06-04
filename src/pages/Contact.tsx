import SEO from "@/components/SEO";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Send } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "@/lib/validation";

type Errors = Partial<Record<keyof ContactFormValues, string>>;

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ContactFormValues>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const { toast } = useToast();

  const setField = <K extends keyof ContactFormValues>(key: K, v: string) => {
    setValues((p) => ({ ...p, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setLoading(false);
      setValues({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  return (
    <div className="py-16">
      <SEO
        title="Contact — Busistree"
        description="Get in touch with the Busistree team. We typically respond within one business day."
        path="/contact"
      />
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="flex items-center gap-3 text-foreground">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>support@busistree.com</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>03157224340</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display">Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                />
                {errors.subject && <p id="subject-err" className="text-sm text-destructive">{errors.subject}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={values.message}
                  onChange={(e) => setField("message", e.target.value)}
                  rows={5}
                  maxLength={2000}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-err" : undefined}
                  placeholder="Tell us more..."
                />
                {errors.message && <p id="message-err" className="text-sm text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
                <Send className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;

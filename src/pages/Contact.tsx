import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Send } from "lucide-react";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="py-16">
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-5 w-5 text-primary" />
            <span>support@busistree.com</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="h-5 w-5 text-primary" />
            <span>03157224340</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display">Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What's this about?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us more..." rows={5} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;

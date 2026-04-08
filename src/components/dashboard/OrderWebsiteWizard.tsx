import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTemplates, usePlans } from "@/hooks/useStores";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Upload, Globe, CreditCard, Palette, Building2 } from "lucide-react";

type Step = "template" | "plan" | "details" | "payment" | "confirm";

const PAYMENT_METHODS = [
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "nayapay", label: "NayaPay" },
  { value: "raast", label: "Raast" },
  { value: "bank_transfer", label: "Bank Transfer" },
] as const;

const ACCOUNT_INFO = {
  name: "Hafza Azam",
  number: "03157224340",
};

interface OrderWebsiteWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const OrderWebsiteWizard = ({ onComplete, onCancel }: OrderWebsiteWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: plans, isLoading: plansLoading } = usePlans();

  const { data: existingFreeOrder } = useQuery({
    queryKey: ["free_plan_check", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!plans) return null;
      const freePlanIds = plans.filter(p => p.type === "free").map(p => p.id);
      if (freePlanIds.length === 0) return null;
      const { count } = await supabase
        .from("website_orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("plan_id", freePlanIds);
      return (count ?? 0) > 0;
    },
  });

  const [step, setStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [storeName, setStoreName] = useState("");
  const [domainPreference, setDomainPreference] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [socialMediaLinks, setSocialMediaLinks] = useState({ facebook: "", instagram: "", whatsapp: "" });
  const [colorPreferences, setColorPreferences] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedPlanData = plans?.find((p) => p.id === selectedPlan);
  const selectedTemplateData = templates?.find((t) => t.id === selectedTemplate);
  const isFree = selectedPlanData?.type === "free";

  const steps: Step[] = isFree
    ? ["template", "plan", "details", "confirm"]
    : ["template", "plan", "details", "payment", "confirm"];

  const currentStepIndex = steps.indexOf(step);

  const canProceed = () => {
    switch (step) {
      case "template": return !!selectedTemplate;
      case "plan": return !!selectedPlan;
      case "details": return storeName.trim().length >= 3 && contactPhone.trim().length >= 5 && address.trim().length >= 5;
      case "payment": return !!paymentMethod && !!transactionId && !!amount;
      case "confirm": return true;
    }
  };

  const handleNext = () => {
    const next = steps[currentStepIndex + 1];
    if (next) setStep(next);
  };

  const handleBack = () => {
    const prev = steps[currentStepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Prevent multiple free plan orders
      if (isFree) {
        const { count, error: countErr } = await supabase
          .from("website_orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("plan_id", selectedPlan);
        if (countErr) throw countErr;
        if (count && count > 0) {
          toast({ title: "Limit reached", description: "You can only order the free plan once.", variant: "destructive" });
          setSubmitting(false);
          return;
        }
      }
      let screenshotUrl: string | null = null;
      let logoUrl: string | null = null;

      if (screenshotFile) {
        const fileExt = screenshotFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("payment-screenshots").upload(filePath, screenshotFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("payment-screenshots").getPublicUrl(filePath);
        screenshotUrl = urlData.publicUrl;
      }

      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const filePath = `logos/${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("store-assets").upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(filePath);
        logoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("website_orders").insert({
        user_id: user.id,
        template_id: selectedTemplate,
        plan_id: selectedPlan,
        store_name: storeName.trim(),
        domain_preference: domainPreference.trim() || null,
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || null,
        address: address.trim(),
        business_description: businessDescription.trim() || null,
        logo_url: logoUrl,
        social_media_links: socialMediaLinks,
        color_preferences: colorPreferences.trim() || null,
        additional_notes: additionalNotes.trim() || null,
        payment_method: isFree ? null : paymentMethod || null,
        transaction_id: isFree ? null : transactionId || null,
        amount: isFree ? 0 : parseInt(amount) || 0,
        screenshot_url: screenshotUrl,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Order submitted!", description: "We'll review your order and start building your website." });
      queryClient.invalidateQueries({ queryKey: ["website_orders"] });
      onComplete();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit order", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">Order a Website</h2>
          <p className="text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}</p>
        </div>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentStepIndex ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {/* Template */}
      {step === "template" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Choose a Template
          </h3>
          {templatesLoading ? (
            <p className="text-muted-foreground">Loading templates...</p>
          ) : !templates?.length ? (
            <p className="text-muted-foreground">No templates available yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${selectedTemplate === t.id ? "border-primary ring-2 ring-primary/20" : "border-border/50"}`}
                  onClick={() => setSelectedTemplate(t.id)}
                >
                  {t.preview_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img src={t.preview_image_url} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-display">{t.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">{t.niche}</Badge>
                  </CardHeader>
                  {t.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plan */}
      {step === "plan" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Select a Plan
          </h3>
          {plansLoading ? (
            <p className="text-muted-foreground">Loading plans...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plans?.map((p) => {
                const isFreeLocked = p.type === "free" && existingFreeOrder;
                return (
                  <Card
                    key={p.id}
                    className={`transition-all ${isFreeLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"} ${selectedPlan === p.id ? "border-primary ring-2 ring-primary/20" : "border-border/50"}`}
                    onClick={() => !isFreeLocked && setSelectedPlan(p.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-display">{p.name}</CardTitle>
                        <div className="flex gap-1">
                          {isFreeLocked && <Badge variant="outline" className="text-destructive border-destructive/30">Already Used</Badge>}
                          <Badge variant={p.type === "free" ? "secondary" : "default"}>{p.type}</Badge>
                        </div>
                      </div>
                      <CardDescription className="text-xl font-bold font-display text-foreground">
                        {p.price_pkr === 0 ? "Free" : `PKR ${p.price_pkr.toLocaleString()}`}
                        {p.type === "rent" && p.duration_days && (
                          <span className="text-sm font-normal text-muted-foreground"> / {p.duration_days} days</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>Up to {p.max_products} products</li>
                        <li>Up to {p.max_categories} categories</li>
                        {Array.isArray(p.features) && (p.features as string[]).map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                      {isFreeLocked && <p className="text-xs text-destructive mt-2">You've already used your free plan.</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Details */}
      {step === "details" && (
        <div className="space-y-6 max-w-2xl">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Business Details
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Store / Business Name *</Label>
              <Input placeholder="My Amazing Store" value={storeName} onChange={(e) => setStoreName(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Domain / Subdomain</Label>
              <Input placeholder="mystore.com or mystore" value={domainPreference} onChange={(e) => setDomainPreference(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone *</Label>
              <Input placeholder="03001234567" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" placeholder="you@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business Address *</Label>
            <Textarea placeholder="Full address for your business" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Business Description</Label>
            <Textarea placeholder="Describe your business, products, and target audience..." value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Logo (optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input type="file" accept="image/*" className="hidden" id="logo-upload" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">{logoFile ? logoFile.name : "Click to upload logo"}</p>
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input placeholder="https://facebook.com/..." value={socialMediaLinks.facebook} onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, facebook: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input placeholder="https://instagram.com/..." value={socialMediaLinks.instagram} onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, instagram: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input placeholder="03001234567" value={socialMediaLinks.whatsapp} onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, whatsapp: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color Preferences</Label>
            <Input placeholder="e.g. Blue and white, or #1a73e8" value={colorPreferences} onChange={(e) => setColorPreferences(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea placeholder="Any special requirements or features..." value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={2} />
          </div>
        </div>
      )}

      {/* Payment */}
      {step === "payment" && (
        <div className="space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Payment Confirmation
          </h3>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-foreground mb-2">Send payment to:</p>
              <p className="text-sm text-muted-foreground">
                <strong>Account Name:</strong> {ACCOUNT_INFO.name}<br />
                <strong>Account Number:</strong> {ACCOUNT_INFO.number}<br />
                <strong>Amount:</strong> PKR {selectedPlanData?.price_pkr.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction ID</Label>
              <Input placeholder="e.g. TXN123456789" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid (PKR)</Label>
              <Input type="number" placeholder={selectedPlanData?.price_pkr.toString()} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Payment Screenshot (optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input type="file" accept="image/*" className="hidden" id="screenshot" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
                <label htmlFor="screenshot" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{screenshotFile ? screenshotFile.name : "Click to upload screenshot"}</p>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm */}
      {step === "confirm" && (
        <div className="space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" /> Review & Submit
          </h3>
          <Card>
            <CardContent className="pt-4 space-y-2 text-sm">
              <p><strong>Store Name:</strong> {storeName}</p>
              {domainPreference && <p><strong>Domain:</strong> {domainPreference}</p>}
              <p><strong>Template:</strong> {selectedTemplateData?.name}</p>
              <p><strong>Plan:</strong> {selectedPlanData?.name} ({selectedPlanData?.type})</p>
              <p><strong>Price:</strong> {selectedPlanData?.price_pkr === 0 ? "Free" : `PKR ${selectedPlanData?.price_pkr.toLocaleString()}`}</p>
              <p><strong>Phone:</strong> {contactPhone}</p>
              {contactEmail && <p><strong>Email:</strong> {contactEmail}</p>}
              <p><strong>Address:</strong> {address}</p>
              {businessDescription && <p><strong>Business:</strong> {businessDescription}</p>}
              {!isFree && (
                <>
                  <p><strong>Payment:</strong> {paymentMethod.replace("_", " ")}</p>
                  <p><strong>TxID:</strong> {transactionId}</p>
                  <p><strong>Amount:</strong> PKR {parseInt(amount).toLocaleString()}</p>
                </>
              )}
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            After submitting, our team will build your WordPress website and share credentials within 24-48 hours.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={currentStepIndex === 0 ? onCancel : handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStepIndex === 0 ? "Cancel" : "Back"}
        </Button>
        {step === "confirm" ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Place Order"}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderWebsiteWizard;

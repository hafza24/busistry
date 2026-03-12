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
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Upload, Store, CreditCard, Palette } from "lucide-react";

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

interface LaunchStoreWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const LaunchStoreWizard = ({ onComplete, onCancel }: LaunchStoreWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: plans, isLoading: plansLoading } = usePlans();

  const [step, setStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [storeName, setStoreName] = useState("");
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
      case "details": return storeName.trim().length >= 3;
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
      let screenshotUrl: string | null = null;

      if (screenshotFile) {
        const fileExt = screenshotFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-screenshots")
          .upload(filePath, screenshotFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("payment-screenshots")
          .getPublicUrl(filePath);
        screenshotUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("store_requests").insert({
        user_id: user.id,
        store_name: storeName.trim(),
        template_id: selectedTemplate,
        plan_id: selectedPlan,
        payment_method: isFree ? null : (paymentMethod as any),
        transaction_id: isFree ? null : transactionId || null,
        amount: isFree ? 0 : parseInt(amount) || null,
        screenshot_url: screenshotUrl,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Store request submitted!",
        description: "We'll review your request and get back to you shortly.",
      });

      queryClient.invalidateQueries({ queryKey: ["store_requests"] });
      onComplete();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">Launch a Store</h2>
          <p className="text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}</p>
        </div>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentStepIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step: Template */}
      {step === "template" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Choose a Template
          </h3>
          {templatesLoading ? (
            <p className="text-muted-foreground">Loading templates...</p>
          ) : !templates?.length ? (
            <p className="text-muted-foreground">No templates available yet. Please check back later.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedTemplate === t.id ? "border-primary ring-2 ring-primary/20" : "border-border/50"
                  }`}
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

      {/* Step: Plan */}
      {step === "plan" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Select a Plan
          </h3>
          {plansLoading ? (
            <p className="text-muted-foreground">Loading plans...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plans?.map((p) => (
                <Card
                  key={p.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedPlan === p.id ? "border-primary ring-2 ring-primary/20" : "border-border/50"
                  }`}
                  onClick={() => setSelectedPlan(p.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display">{p.name}</CardTitle>
                      <Badge variant={p.type === "free" ? "secondary" : "default"}>
                        {p.type}
                      </Badge>
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
                      {Array.isArray(p.features) &&
                        (p.features as string[]).map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Details */}
      {step === "details" && (
        <div className="space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Store Details
          </h3>
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              placeholder="My Amazing Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">Minimum 3 characters. This will be your store's display name.</p>
          </div>
          <Card className="bg-muted/50 border-border/50">
            <CardContent className="pt-4 text-sm">
              <p><strong>Template:</strong> {selectedTemplateData?.name}</p>
              <p><strong>Plan:</strong> {selectedPlanData?.name} ({selectedPlanData?.type})</p>
              <p><strong>Price:</strong> {selectedPlanData?.price_pkr === 0 ? "Free" : `PKR ${selectedPlanData?.price_pkr.toLocaleString()}`}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Payment */}
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
              <p className="text-xs text-muted-foreground mt-2">
                Send via Easypaisa, JazzCash, NayaPay, Raast, or Bank Transfer, then fill the form below.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="txId">Transaction ID</Label>
              <Input
                id="txId"
                placeholder="e.g. TXN123456789"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount Paid (PKR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={selectedPlanData?.price_pkr.toString()}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Screenshot (optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="screenshot"
                  onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="screenshot" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {screenshotFile ? screenshotFile.name : "Click to upload screenshot"}
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <div className="space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold font-display flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" /> Review & Submit
          </h3>
          <Card>
            <CardContent className="pt-4 space-y-2 text-sm">
              <p><strong>Store Name:</strong> {storeName}</p>
              <p><strong>Template:</strong> {selectedTemplateData?.name}</p>
              <p><strong>Plan:</strong> {selectedPlanData?.name} ({selectedPlanData?.type})</p>
              <p><strong>Price:</strong> {selectedPlanData?.price_pkr === 0 ? "Free" : `PKR ${selectedPlanData?.price_pkr.toLocaleString()}`}</p>
              {!isFree && (
                <>
                  <p><strong>Payment Method:</strong> {paymentMethod.replace("_", " ")}</p>
                  <p><strong>Transaction ID:</strong> {transactionId}</p>
                  <p><strong>Amount Paid:</strong> PKR {parseInt(amount).toLocaleString()}</p>
                  {screenshotFile && <p><strong>Screenshot:</strong> {screenshotFile.name}</p>}
                </>
              )}
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            After submitting, our team will review your request and activate your store within 24-48 hours.
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
            {submitting ? "Submitting..." : "Submit Request"}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LaunchStoreWizard;

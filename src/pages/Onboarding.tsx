import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding, getPendingPlan, clearPendingPlan } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import Step1Business from "@/components/onboarding/Step1Business";
import Step2Branding from "@/components/onboarding/Step2Branding";
import Step3Team from "@/components/onboarding/Step3Team";
import Step4Store from "@/components/onboarding/Step4Store";
import Step5Contact from "@/components/onboarding/Step5Contact";
import Step6Payment from "@/components/onboarding/Step6Payment";

const STEP_LABELS = ["Business", "Branding", "Team", "Store", "Contact", "Confirm"];

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Plan id: from URL ?plan=, or from saved pending plan
  const planId = useMemo(
    () => searchParams.get("plan") ?? getPendingPlan() ?? null,
    [searchParams]
  );

  const { data, update, loading, saving, submit } = useOnboarding(planId);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Redirect to auth if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/onboarding${planId ? `?plan=${planId}` : ""}`)}`);
    }
  }, [user, authLoading, navigate, planId]);

  // Sync wizard step from saved draft
  useEffect(() => {
    if (!loading && data.current_step && data.current_step !== step) {
      setStep(data.current_step);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 1:
        return !!data.business_name && !!data.business_type && !!data.business_description && !!data.country;
      case 2:
        return data.needs_logo_design || !!data.logo_url
          ? !!data.font_style
          : !!data.font_style;
      case 3:
        return true;
      case 4:
        return !!data.store_type && data.product_count_estimate !== undefined && !!data.payment_gateway;
      case 5:
        return !!data.full_name && !!data.email && !!data.phone;
      case 6:
        return !!data.terms_accepted;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canProceed(step)) {
      toast({ title: "Please complete this step", description: "Fill in the required fields to continue.", variant: "destructive" });
      return;
    }
    const next = Math.min(6, step + 1);
    setStep(next);
    update({ current_step: next });
  };

  const goBack = () => {
    const prev = Math.max(1, step - 1);
    setStep(prev);
    update({ current_step: prev });
  };

  const handleSubmit = async () => {
    if (!canProceed(6)) {
      toast({ title: "Please accept the terms", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await submit();
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      return;
    }
    clearPendingPlan();
    setDone(true);
    setTimeout(() => navigate("/dashboard"), 2500);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center space-y-4"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">We're building your store</h1>
          <p className="text-muted-foreground">
            Thanks — your intake is in. Our team will review the details and get to work. You'll see updates in
            your dashboard.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  const progressValue = ((step - 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-14">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of 6 — {STEP_LABELS[step - 1]}</span>
            <span className="flex items-center gap-1.5">
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" /> Auto-saved
                </>
              )}
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5" />
          <div className="hidden md:flex justify-between text-[11px] text-muted-foreground">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`${i + 1 <= step ? "text-foreground font-medium" : ""}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {step === 1 && <Step1Business data={data} update={update} />}
            {step === 2 && <Step2Branding data={data} update={update} />}
            {step === 3 && <Step3Team data={data} update={update} />}
            {step === 4 && <Step4Store data={data} update={update} />}
            {step === 5 && <Step5Contact data={data} update={update} />}
            {step === 6 && <Step6Payment data={data} update={update} />}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <Button variant="ghost" onClick={step === 1 ? () => navigate("/pricing") : goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Back to pricing" : "Back"}
          </Button>
          {step < 6 ? (
            <Button onClick={goNext}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || !data.terms_accepted}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
              ) : (
                <>Submit & start build <Check className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

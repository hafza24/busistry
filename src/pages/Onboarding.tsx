import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOnboarding,
  getPendingPlan,
  clearPendingPlan,
  getPendingTemplate,
  clearPendingTemplate,
  setPendingPlan,
  setPendingTemplate,
} from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Step1ProjectType from "@/components/onboarding/Step1ProjectType";
import Step2ProjectDetails from "@/components/onboarding/Step2ProjectDetails";
import Step3Business from "@/components/onboarding/Step1Business";
import Step4Branding from "@/components/onboarding/Step2Branding";
import Step5Team from "@/components/onboarding/Step3Team";
import Step6Store from "@/components/onboarding/Step4Store";
import StepAddons from "@/components/onboarding/StepAddons";
import Step8Contact from "@/components/onboarding/Step5Contact";
import Step9Payment from "@/components/onboarding/Step6Payment";
import SelectedTemplateBanner from "@/components/onboarding/SelectedTemplateBanner";
import PlanSummaryCard from "@/components/onboarding/PlanSummaryCard";

const STEP_LABELS = ["Project", "Details", "Business", "Branding", "Team", "Store", "Enhance", "Contact", "Confirm"];
const TOTAL_STEPS = STEP_LABELS.length;

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const planId = useMemo(
    () => searchParams.get("plan") ?? getPendingPlan() ?? null,
    [searchParams]
  );
  const templateId = useMemo(
    () => searchParams.get("template") ?? getPendingTemplate() ?? null,
    [searchParams]
  );

  // Persist these in case the user has to sign in mid-flow
  useEffect(() => {
    if (planId) setPendingPlan(planId);
    if (templateId) setPendingTemplate(templateId);
  }, [planId, templateId]);

  const { data, update, loading, saving, submit } = useOnboarding(planId, templateId);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      const params = new URLSearchParams();
      if (planId) params.set("plan", planId);
      if (templateId) params.set("template", templateId);
      const qs = params.toString();
      navigate(`/auth?redirect=${encodeURIComponent(`/onboarding${qs ? `?${qs}` : ""}`)}`);
    }
  }, [user, authLoading, navigate, planId, templateId]);

  useEffect(() => {
    if (!loading && data.current_step && data.current_step !== step) {
      setStep(Math.min(TOTAL_STEPS, data.current_step));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const detailsValid = (): boolean => {
    const d = data.project_details ?? {};
    switch (data.project_type) {
      case "ecommerce":
        return !!d.selling && d.num_products !== undefined && !!d.payment_gateway_setup && !!d.has_images;
      case "agency":
        return !!d.services_offered && d.num_pages !== undefined && !!d.portfolio;
      case "booking":
        return !!d.booking_type && !!d.time_slots && !!d.booking_payment;
      case "business":
        return !!d.business_subtype && Array.isArray(d.pages) && d.pages.length > 0 && !!d.contact_method;
      case "management":
        return !!d.system_type && !!d.user_roles_text && !!d.complexity;
      default:
        return false;
    }
  };

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 1: return !!data.project_type;
      case 2: return detailsValid();
      case 3: return !!data.business_name && !!data.business_type && !!data.business_description && !!data.country;
      case 4: return !!data.font_style;
      case 5: return true;
      case 6: return !!data.store_type && data.product_count_estimate !== undefined && !!data.payment_gateway;
      case 7: return true; // Add-ons step is always optional
      case 8: return !!data.full_name && !!data.email && !!data.phone;
      case 9: return !!data.terms_accepted;
      default: return false;
    }
  };

  const goNext = () => {
    if (!canProceed(step)) {
      toast({ title: "Please complete this step", description: "Fill in the required fields to continue.", variant: "destructive" });
      return;
    }
    const next = Math.min(TOTAL_STEPS, step + 1);
    setStep(next);
    update({ current_step: next });
  };

  const goBack = () => {
    const prev = Math.max(1, step - 1);
    setStep(prev);
    update({ current_step: prev });
  };

  const handleSubmit = async () => {
    if (!canProceed(TOTAL_STEPS)) {
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
    clearPendingTemplate();
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

  const progressValue = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-14">
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}</span>
            <span className="flex items-center gap-1.5">
              {saving ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
              ) : (
                <><Check className="h-3 w-3" /> Auto-saved</>
              )}
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5" />
          <div className="hidden md:flex justify-between text-[11px] text-muted-foreground">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`${i + 1 <= step ? "text-foreground font-medium" : ""}`}>
                {label}
              </span>
            ))}
        </div>

        <div className="mb-6 space-y-3">
          <PlanSummaryCard planId={data.plan_id ?? planId} />
          <SelectedTemplateBanner templateId={data.template_id ?? templateId} />
        </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {step === 1 && <Step1ProjectType data={data} update={update} />}
            {step === 2 && <Step2ProjectDetails data={data} update={update} />}
            {step === 3 && <Step3Business data={data} update={update} />}
            {step === 4 && <Step4Branding data={data} update={update} />}
            {step === 5 && <Step5Team data={data} update={update} />}
            {step === 6 && <Step6Store data={data} update={update} />}
            {step === 7 && <StepAddons data={data} update={update} />}
            {step === 8 && <Step8Contact data={data} update={update} />}
            {step === 9 && (
              <Step9Payment
                data={data}
                update={update}
                onEdit={(s) => {
                  setStep(s);
                  update({ current_step: s });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <Button variant="ghost" onClick={step === 1 ? () => navigate("/pricing") : goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Back to pricing" : "Back"}
          </Button>
          {step < TOTAL_STEPS ? (
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

import { CheckCircle2, Circle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

export type TimelineStage =
  | "payment_submitted"
  | "verification_pending"
  | "payment_approved"
  | "in_development"
  | "qa_review"
  | "ready_for_delivery"
  | "delivered";

interface Stage {
  key: TimelineStage;
  label: string;
  hint: string;
}

const STAGES: Stage[] = [
  { key: "payment_submitted", label: "Payment Submitted", hint: "We received your details." },
  { key: "verification_pending", label: "Verification Pending", hint: "Typically 5–30 minutes." },
  { key: "payment_approved", label: "Payment Approved", hint: "Confirmed by our team." },
  { key: "in_development", label: "Website In Development", hint: "Build in progress." },
  { key: "qa_review", label: "QA Review", hint: "Final quality checks." },
  { key: "ready_for_delivery", label: "Ready For Delivery", hint: "Awaiting handoff." },
  { key: "delivered", label: "Delivered", hint: "Your site is live." },
];

/**
 * Maps various raw DB status strings (store_requests, website_orders, onboarding_submissions)
 * onto a unified customer-facing timeline stage.
 */
export const mapStatusToStage = (status?: string | null): TimelineStage => {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
    case "draft":
      return "payment_submitted";
    case "under_review":
    case "reviewing":
      return "verification_pending";
    case "approved":
    case "payment_approved":
      return "payment_approved";
    case "in_development":
    case "building":
      return "in_development";
    case "qa":
    case "qa_review":
      return "qa_review";
    case "ready":
    case "ready_for_delivery":
      return "ready_for_delivery";
    case "delivered":
    case "activated":
    case "completed":
      return "delivered";
    default:
      return "payment_submitted";
  }
};

const ETA_HINT: Record<TimelineStage, string> = {
  payment_submitted: "~5 min to verification",
  verification_pending: "~5–30 min review",
  payment_approved: "Build starts within 24 hrs",
  in_development: "~3–7 business days",
  qa_review: "~24 hrs of testing",
  ready_for_delivery: "Handoff within 24 hrs",
  delivered: "Complete",
};

interface Props {
  status?: string | null;
  /** Last updated timestamp (ISO or Date). */
  updatedAt?: string | Date | null;
  /** Optional admin note shown below the timeline. */
  note?: string | null;
  /** Compact mode — horizontal pills, no descriptions. */
  compact?: boolean;
  className?: string;
}

export const OrderStatusTimeline = ({
  status,
  updatedAt,
  note,
  compact = false,
  className,
}: Props) => {
  const currentStage = mapStatusToStage(status);
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);
  const lastUpdated = updatedAt ? new Date(updatedAt) : null;

  if (compact) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center gap-1">
          {STAGES.map((stage, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div
                key={stage.key}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  done && "bg-primary",
                  active && "bg-primary animate-pulse",
                  !done && !active && "bg-muted",
                )}
                aria-label={stage.label}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{STAGES[currentIdx].label}</span>
          {lastUpdated && <span>Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 md:p-5", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Order Progress</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Current stage: <span className="text-foreground font-medium">{STAGES[currentIdx].label}</span>
            <span className="mx-1.5">•</span>
            {ETA_HINT[currentStage]}
          </p>
        </div>
        {lastUpdated && (
          <div className="text-right text-[11px] text-muted-foreground shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
            <div>{format(lastUpdated, "MMM d, h:mm a")}</div>
          </div>
        )}
      </div>

      {currentStage === "payment_submitted" || currentStage === "verification_pending" ? (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
          Your payment has been received and is under review. Verification typically takes 5–30 minutes.
        </div>
      ) : null}

      <ol className="space-y-3">
        {STAGES.map((stage, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li key={stage.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-0.5">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : active ? (
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                {i < STAGES.length - 1 && (
                  <div
                    className={cn(
                      "w-px flex-1 mt-1 min-h-[16px]",
                      done ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {stage.label}
                </div>
                <div className="text-xs text-muted-foreground">{stage.hint}</div>
              </div>
            </li>
          );
        })}
      </ol>

      {note && (
        <div className="mt-4 rounded-md bg-muted px-3 py-2 text-sm">
          <span className="font-semibold text-foreground">Admin note: </span>
          <span className="text-muted-foreground">{note}</span>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;

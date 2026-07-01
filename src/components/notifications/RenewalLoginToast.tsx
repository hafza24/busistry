import { useEffect, useRef } from "react";
import { useSubscriptions } from "@/hooks/useNotifications";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/** Shows one urgent-renewal toast per session on login. */
export default function RenewalLoginToast() {
  const { data: subs = [] } = useSubscriptions("own");
  const shown = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (shown.current || !subs.length) return;
    if (sessionStorage.getItem("renewal-toast-shown")) { shown.current = true; return; }

    const urgent = subs.filter((s) => {
      const d = differenceInDays(new Date(s.current_period_end), new Date());
      return d <= 7 && s.status !== "cancelled";
    });
    if (!urgent.length) return;

    const expired = urgent.filter((s) => differenceInDays(new Date(s.current_period_end), new Date()) < 0);
    const first = urgent[0];
    const d = differenceInDays(new Date(first.current_period_end), new Date());

    const title = expired.length
      ? `${expired.length} subscription${expired.length > 1 ? "s" : ""} need renewal`
      : `${first.label} renews in ${d} day${d === 1 ? "" : "s"}`;

    toast.warning(title, {
      description: urgent.length > 1 ? `You have ${urgent.length} upcoming renewals.` : `Renew to avoid interruption.`,
      duration: 8000,
      action: { label: "View", onClick: () => navigate("/dashboard?view=subscriptions") },
    });
    sessionStorage.setItem("renewal-toast-shown", "1");
    shown.current = true;
  }, [subs, navigate]);

  return null;
}

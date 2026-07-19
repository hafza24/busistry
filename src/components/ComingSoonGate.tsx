import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useComingSoon } from "@/hooks/useComingSoon";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";

// Paths that remain accessible even when Coming Soon mode is on.
const ALLOW_PREFIXES = ["/coming-soon", "/auth", "/admin"];

const ComingSoonGate = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: enabled, isLoading } = useComingSoon();

  if (isLoading || authLoading || adminLoading) return <>{children}</>;

  const allowed = ALLOW_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (enabled && !isAdmin && !allowed) {
    return <Navigate to="/coming-soon" replace />;
  }

  return <>{children}</>;
};

export default ComingSoonGate;

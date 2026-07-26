import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const enforceStatus = async (s: Session | null) => {
      const uid = s?.user?.id ?? null;
      if (!uid) {
        checkedUserIdRef.current = null;
        return;
      }
      // Only check status once per user session to avoid duplicate /profiles fetches
      if (checkedUserIdRef.current === uid) return;
      checkedUserIdRef.current = uid;

      const { data } = await supabase
        .from("profiles")
        .select("status, moderation_reason")
        .eq("id", uid)
        .maybeSingle();
      const status = (data as any)?.status;
      if (status === "suspended" || status === "blacklisted") {
        const reason = (data as any)?.moderation_reason || "";
        await supabase.auth.signOut();
        setSession(null);
        checkedUserIdRef.current = null;
        if (typeof window !== "undefined") {
          const label = status === "blacklisted" ? "blacklisted" : "suspended";
          alert(`Your account has been ${label}.${reason ? `\n\nReason: ${reason}` : ""}`);
        }
      }
    };

    // onAuthStateChange fires INITIAL_SESSION on mount, so we don't need a separate
    // getSession() call — that would cause duplicate profiles fetches.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
        setTimeout(() => enforceStatus(session), 0);
      }
    );

    return () => subscription.unsubscribe();
  }, []);



  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

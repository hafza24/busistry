import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signInSchema, signUpSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = "auth_failed_attempts";

type Attempts = { count: number; lockedUntil: number };

const readAttempts = (): Attempts => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
};
const writeAttempts = (a: Attempts) => localStorage.setItem(STORAGE_KEY, JSON.stringify(a));

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const a = readAttempts();
    setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - a.count));
    const remaining = Math.max(0, Math.ceil((a.lockedUntil - Date.now()) / 1000));
    setCooldownLeft(remaining);
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    timerRef.current = window.setInterval(() => {
      setCooldownLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          writeAttempts({ count: 0, lockedUntil: 0 });
          setAttemptsLeft(MAX_ATTEMPTS);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [cooldownLeft]);

  const registerFailedAttempt = () => {
    const a = readAttempts();
    const count = a.count + 1;
    if (count >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + COOLDOWN_SECONDS * 1000;
      writeAttempts({ count, lockedUntil });
      setCooldownLeft(COOLDOWN_SECONDS);
      setAttemptsLeft(0);
    } else {
      writeAttempts({ count, lockedUntil: 0 });
      setAttemptsLeft(MAX_ATTEMPTS - count);
    }
  };

  const clearAttempts = () => {
    writeAttempts({ count: 0, lockedUntil: 0 });
    setAttemptsLeft(MAX_ATTEMPTS);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (cooldownLeft > 0) return;

    const schema = isLogin ? signInSchema : signUpSchema;
    const payload = isLogin ? { email, password } : { email, password, fullName };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as string;
        if (!fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          registerFailedAttempt();
          logAudit({ action: "login.failed", actorEmail: parsed.data.email, metadata: { reason: error.message } });
          throw error;
        }
        clearAttempts();
        logAudit({ action: "login.success", actorEmail: parsed.data.email });
        navigate("/dashboard");
      } else {
        const d = parsed.data as { email: string; password: string; fullName: string };
        const { error } = await supabase.auth.signUp({
          email: d.email,
          password: d.password,
          options: {
            data: { full_name: d.fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        logAudit({ action: "signup.success", actorEmail: d.email });
        toast({ title: "Account created!", description: "Check your email to verify your account." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const locked = cooldownLeft > 0;

  // Shared form fields — used by both sign in and sign up panels
  const renderForm = (mode: "signin" | "signup") => {
    const signup = mode === "signup";
    return (
      <form onSubmit={handleEmailAuth} className="space-y-4 w-full max-w-sm mx-auto" noValidate>
        {locked && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Too many attempts. Wait <strong>{cooldownLeft}s</strong>.
            </AlertDescription>
          </Alert>
        )}
        {!locked && !signup && attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
          <Alert>
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining.
            </AlertDescription>
          </Alert>
        )}

        {signup && (
          <div className="space-y-1.5">
            <Label htmlFor={`${mode}-name`} className="sr-only">Full Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" aria-hidden="true" />
              <Input
                id={`${mode}-name`}
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-11 h-12 rounded-full bg-primary/10 border-transparent focus-visible:bg-background focus-visible:border-primary"
                maxLength={100}
                aria-invalid={!!errors.fullName}
              />
            </div>
            {errors.fullName && <p className="text-xs text-destructive px-4">{errors.fullName}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={`${mode}-email`} className="sr-only">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" aria-hidden="true" />
            <Input
              id={`${mode}-email`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 rounded-full bg-primary/10 border-transparent focus-visible:bg-background focus-visible:border-primary"
              maxLength={255}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive px-4">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${mode}-password`} className="sr-only">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" aria-hidden="true" />
            <Input
              id={`${mode}-password`}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-12 rounded-full bg-primary/10 border-transparent focus-visible:bg-background focus-visible:border-primary"
              autoComplete={signup ? "new-password" : "current-password"}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive px-4">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-full text-base font-semibold shadow-md"
          disabled={loading || locked}
        >
          {locked ? `Locked (${cooldownLeft}s)` : loading ? "Please wait..." : signup ? "Create Account" : "Log In"}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 rounded-full"
          onClick={handleGoogleAuth}
          type="button"
          disabled={locked}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>
      </form>
    );
  };

  const switchMode = (next: boolean) => {
    setIsLogin(next);
    setErrors({});
  };

  // Touch swipe handling (mobile only)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Ignore mostly-vertical gestures (allow scrolling)
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && isLogin) switchMode(false); // swipe left -> sign up
    else if (dx > 0 && !isLogin) switchMode(true); // swipe right -> sign in
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4 py-6 sm:py-10">
      <SEO
        title={isLogin ? "Sign In — Busistree" : "Create your account — Busistree"}
        description="Sign in to manage your Busistree websites, stores, and orders."
        path="/auth"
        noindex
      />

      <div
        className="relative w-full max-w-5xl bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid: on md+ two columns; mobile single */}
        <div className="grid md:grid-cols-2 min-h-[600px]">
          {/* SIGN IN FORM (left on desktop) */}
          <div
            className={`order-2 md:order-1 flex items-center justify-center p-6 sm:p-10 transition-all duration-500 ease-out ${
              isLogin ? "opacity-100 translate-x-0" : "md:opacity-40 md:-translate-x-4 hidden md:flex"
            }`}
          >
            <div className="w-full">
              <div className="text-center mb-6">
                <h2 className="font-display text-3xl font-bold text-primary">Welcome</h2>
                <p className="text-sm text-muted-foreground mt-1">Log in to your account to continue</p>
              </div>
              {isLogin ? renderForm("signin") : null}
              {!isLogin && (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-center gap-4">
                  <p className="text-sm text-muted-foreground">Already a member?</p>
                  <Button variant="outline" className="rounded-full px-8" onClick={() => switchMode(true)} type="button">
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* SIGN UP FORM (right on desktop) */}
          <div
            className={`order-3 md:order-2 flex items-center justify-center p-6 sm:p-10 transition-all duration-500 ease-out ${
              !isLogin ? "opacity-100 translate-x-0" : "md:opacity-40 md:translate-x-4 hidden md:flex"
            }`}
          >
            <div className="w-full">
              <div className="text-center mb-6">
                <h2 className="font-display text-3xl font-bold text-primary">Create Account</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign up to get started with Busistree</p>
              </div>
              {!isLogin ? renderForm("signup") : null}
              {isLogin && (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-center gap-4">
                  <p className="text-sm text-muted-foreground">New here?</p>
                  <Button variant="outline" className="rounded-full px-8" onClick={() => switchMode(false)} type="button">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* GREEN OVERLAY PANEL — slides between columns */}
          <div
            className={`order-1 md:order-none md:absolute md:inset-y-0 md:w-1/2 z-10 bg-primary text-primary-foreground transition-transform duration-700 ease-in-out overflow-hidden ${
              isLogin ? "md:translate-x-full md:rounded-l-[40%]" : "md:translate-x-0 md:rounded-r-[40%]"
            }`}
          >
            {/* Decorative circles */}
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10" aria-hidden="true" />
            <div className="absolute -bottom-24 -right-10 w-72 h-72 rounded-full bg-white/5" aria-hidden="true" />

            <div className="relative h-full flex flex-col items-center justify-center text-center p-6 sm:p-10 gap-5">
              <img src={logo} alt="Busistree" className="w-20 h-20 object-contain" />

              {isLogin ? (
                <>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold">Hello, Friend!</h1>
                  <p className="text-sm sm:text-base opacity-90 max-w-xs">
                    Enter your personal details and start your journey with us.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => switchMode(false)}
                    type="button"
                    className="rounded-full px-10 h-11 bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary transition-colors"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold">Welcome Back!</h1>
                  <p className="text-sm sm:text-base opacity-90 max-w-xs">
                    To stay connected with us please login with your personal info.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => switchMode(true)}
                    type="button"
                    className="rounded-full px-10 h-11 bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary transition-colors"
                  >
                    Sign In
                  </Button>
                </>
              )}

              {/* Mobile fallback toggle text */}
              <p className="md:hidden text-xs opacity-80 mt-2">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => switchMode(!isLogin)}
                  className="underline font-semibold"
                  type="button"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

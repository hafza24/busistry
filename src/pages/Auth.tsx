import SEO from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Restore cooldown from storage and tick down
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
          // reset attempts after cooldown expires
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <SEO
        title={isLogin ? "Sign In — Busistree" : "Create your account — Busistree"}
        description="Sign in to manage your Busistree websites, stores, and orders."
        path="/auth"
        noindex
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-foreground">🌳 Busistree</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-display">{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your dashboard" : "Fill in the details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locked && (
              <Alert variant="destructive" className="mb-4">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>
                  Too many attempts. Please wait <strong>{cooldownLeft}s</strong> before trying again.
                </AlertDescription>
              </Alert>
            )}
            {!locked && isLogin && attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
              <Alert className="mb-4">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>
                  {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining before temporary lockout.
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              className="w-full mb-4 h-11"
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

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4" noValidate>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      maxLength={100}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? "fullName-err" : undefined}
                    />
                  </div>
                  {errors.fullName && <p id="fullName-err" className="text-sm text-destructive">{errors.fullName}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    maxLength={255}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-err" : undefined}
                  />
                </div>
                {errors.email && <p id="email-err" className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-err" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p id="password-err" className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading || locked}>
                {locked
                  ? `Locked (${cooldownLeft}s)`
                  : loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                className="text-primary font-medium hover:underline"
                type="button"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

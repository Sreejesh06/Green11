import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAvatarIcon } from "@/lib/avatar-icons";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "reset">("login");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? "/dashboard";
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoginLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! Redirecting to your dashboard.");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in. Try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!name || !email || !password) {
      toast.error("Please fill out all fields to create your account.");
      return;
    }

    setSignupLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! You're all set.");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed. Try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resetEmail.trim()) {
      toast.error("Please enter the email linked to your account.");
      return;
    }

    toast.info("Password reset isn't connected yet. Reach out to support to reset your password.");
  };

  const heroAvatar = getAvatarIcon("PS");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/10 px-4 py-12">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')] opacity-5" />
      <Card className="relative z-10 w-full max-w-md border border-white/20 shadow-xl backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          {heroAvatar ? (
            <Avatar className="mx-auto h-16 w-16 ring-4 ring-primary/20">
              <AvatarImage src={heroAvatar.src} alt={heroAvatar.alt} />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 via-primary to-secondary/40 text-lg font-semibold text-primary-foreground">
                PS
              </AvatarFallback>
            </Avatar>
          ) : null}
          <CardTitle className="text-2xl font-semibold text-primary">Welcome</CardTitle>
          <CardDescription>Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
            <TabsList className="grid grid-cols-3 bg-primary/10">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="auth-login-email">Email</Label>
                  <Input id="auth-login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required disabled={loginLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-login-password">Password</Label>
                  <Input
                    id="auth-login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loginLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="space-y-2">
                  <Label htmlFor="auth-signup-name">Name</Label>
                  <Input id="auth-signup-name" name="name" placeholder="Alex Green" autoComplete="name" required disabled={signupLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-signup-email">Email</Label>
                  <Input id="auth-signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required disabled={signupLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-signup-password">Password</Label>
                  <Input
                    id="auth-signup-password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    disabled={signupLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="mt-6">
              <form className="space-y-4" onSubmit={handleReset}>
                <div className="space-y-2">
                  <Label htmlFor="auth-reset-email">Email</Label>
                  <Input
                    id="auth-reset-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full">
                  Send reset instructions
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

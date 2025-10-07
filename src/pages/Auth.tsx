import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { signInWithEmail, signUpWithEmail, getSession } from "@/lib/api/auth";
import supabase from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    getSession().then((s) => {
      if (s) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const onLogin = async (e: any) => {
    e.preventDefault();
    
    // Basic validation
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (!loginEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setLoading(true);
      await signInWithEmail(loginEmail, loginPassword);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Login failed";
      if (errorMessage.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please try again.");
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error("Please check your email and confirm your account before signing in.");
      } else if (errorMessage.includes('422')) {
        toast.error("Invalid login data. Please check your email and password.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (e: any) => {
    e.preventDefault();
    
    // Basic validation
    if (!signupEmail || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    if (!signupEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setLoading(true);
      const result = await signUpWithEmail(signupEmail, signupPassword);
      
      if (result.user && !result.user.email_confirmed_at) {
        toast.success("Check your email to confirm your account.");
        // Don't navigate immediately - wait for email confirmation
      } else if (result.user && result.user.email_confirmed_at) {
        toast.success("Account created successfully!");
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Signup failed";
      if (errorMessage.includes('User already registered')) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else if (errorMessage.includes('Password should be at least')) {
        toast.error("Password must be at least 6 characters long.");
      } else if (errorMessage.includes('Invalid email')) {
        toast.error("Please enter a valid email address.");
      } else if (errorMessage.includes('422')) {
        toast.error("Invalid signup data. Please check your email and password.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          toast.error("Too many requests. Please wait a moment before trying again.");
        } else {
          throw error;
        }
      } else {
        toast.success("Password reset email sent");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to send reset email";
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        toast.error("Too many requests. Please wait a moment before trying again.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form className="space-y-3" onSubmit={onLogin}>
                <Input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                <Button className="w-full" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form className="space-y-3" onSubmit={onSignup}>
                <Input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                <Button className="w-full" type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="mt-4">
              <form className="space-y-3" onSubmit={onResetPassword}>
                <Input type="email" placeholder="Account Email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                <Button className="w-full" type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Email"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}



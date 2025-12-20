import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Wallet, Mail, ArrowLeft } from "lucide-react";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-lg border-0">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            {submitted 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input-background border-0 h-12"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800">
              Send Reset Link
            </Button>

            <Button 
              type="button" 
              variant="ghost" 
              className="w-full h-12"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--positive)]/10 border border-[var(--positive)]/20">
              <p className="text-sm text-[var(--positive)]">
                Password reset link sent to {email}
              </p>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

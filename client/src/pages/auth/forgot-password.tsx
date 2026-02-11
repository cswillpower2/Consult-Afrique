import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { forgotPasswordSchema } from "@shared/models/auth";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      return res.json();
    },
    onSuccess: () => {
      setEmailSent(true);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src={logoImg} alt="ConsultAfrique" className="h-16 w-auto mx-auto rounded-md shadow-sm mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Reset Your Password</h1>
          <p className="text-muted-foreground mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {emailSent ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <h3 className="font-semibold text-lg">Check Your Email</h3>
                <p className="text-muted-foreground text-sm">
                  If an account with that email exists, we've sent password reset instructions to your inbox.
                </p>
                <p className="text-muted-foreground text-xs">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setEmailSent(false); form.reset(); }}
                  data-testid="button-try-again"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} data-testid="input-forgot-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-forgot-submit">
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <Link href="/login" className="text-sm text-primary font-medium hover:underline flex items-center gap-1" data-testid="link-back-login">
              <ArrowLeft className="w-4 h-4" />
              Back to Log In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

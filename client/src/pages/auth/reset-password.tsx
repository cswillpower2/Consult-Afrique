import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { resetPasswordSchema } from "@shared/models/auth";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const [resetSuccess, setResetSuccess] = useState(false);
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";

  const form = useForm<ResetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ResetFormData) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password,
      });
      return res.json();
    },
    onSuccess: () => {
      setResetSuccess(true);
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "Invalid or expired reset link. Please request a new one.",
        variant: "destructive",
      });
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-xl font-bold">Invalid Reset Link</h2>
            <p className="text-muted-foreground">This password reset link is invalid or has expired.</p>
            <Button asChild>
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src={logoImg} alt="ConsultAfrique" className="h-16 w-auto mx-auto rounded-md shadow-sm mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-muted-foreground mt-1">Choose a strong password for your account</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {resetSuccess ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <h3 className="font-semibold text-lg">Password Reset Successful</h3>
                <p className="text-muted-foreground text-sm">
                  Your password has been updated. You can now log in with your new password.
                </p>
                <Button asChild data-testid="button-go-to-login">
                  <Link href="/login">Go to Log In</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="At least 8 characters" {...field} data-testid="input-new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} data-testid="input-confirm-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-reset-submit">
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

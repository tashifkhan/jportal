import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoginError } from "https://cdn.jsdelivr.net/npm/jsjiit@0.0.20/dist/jsjiit.esm.js";
import { ThemeSelectorDialog } from "./theme-selector-dialog";

// Define the form schema
const formSchema = z.object({
  enrollmentNumber: z.string({
    required_error: "Enrollment number is required",
  }),
  password: z.string({
    required_error: "Password is required",
  }),
});

export default function Login({ onLoginSuccess, w }) {
  const [loginStatus, setLoginStatus] = useState({
    isLoading: false,
    credentials: null,
  });

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollmentNumber: "",
      password: "",
    },
  });

  // Handle side effects in useEffect
  useEffect(() => {
    if (!loginStatus.credentials) return;

    const performLogin = async () => {
      try {
        await w.student_login(loginStatus.credentials.enrollmentNumber, loginStatus.credentials.password);

        // Store credentials in localStorage
        localStorage.setItem("username", loginStatus.credentials.enrollmentNumber);
        localStorage.setItem("password", loginStatus.credentials.password);

        console.log("Login successful");
        setLoginStatus((prev) => ({
          ...prev,
          isLoading: false,
          credentials: null,
        }));
        onLoginSuccess();
      } catch (error) {
        if (
          error instanceof LoginError &&
          error.message.includes("JIIT Web Portal server is temporarily unavailable")
        ) {
          console.error("JIIT Web Portal server is temporarily unavailable");
          toast.error("JIIT Web Portal server is temporarily unavailable. Please try again later.");
        } else if (error instanceof LoginError && error.message.includes("Failed to fetch")) {
          toast.error("Please check your internet connection. If connected, JIIT Web Portal server is unavailable.");
        } else {
          console.error("Login failed:", error);
          toast.error("Login failed. Please check your credentials.");
        }
        setLoginStatus((prev) => ({
          ...prev,
          isLoading: false,
          credentials: null,
        }));
      }
    };

    setLoginStatus((prev) => ({ ...prev, isLoading: true }));
    performLogin();
  }, [loginStatus.credentials, onLoginSuccess, w]);

  // Clean form submission
  function onSubmit(values) {
    setLoginStatus((prev) => ({
      ...prev,
      credentials: values,
    }));
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Header with theme toggle */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <header className="bg-background mx-auto px-3 pt-4 pb-2">
          <div className="container-fluid flex justify-between items-center">
            <h1 className="text-foreground text-2xl font-bold lg:text-3xl font-sans">JPortal</h1>
            <div className="flex items-center gap-1">
              <ThemeSelectorDialog />
              {/* empty div to balance the flex layout. otherwise theme selector button is too close to screen edge and causes trouble on mobile.*/}
              <div className="w-10 h-10">

              </div>
            </div>
          </div>
        </header>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="enrollmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="cursor-pointer w-full" disabled={loginStatus.isLoading}>
                {loginStatus.isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Define the form schema
const formSchema = z.object({
  enrollmentNumber: z.string({
    required_error: "Enrollment number is required",
  }),
  password: z.string({
    required_error: "Password is required",
  }),
})

export default function Login({ onLoginSuccess, w }) {
  const [loginStatus, setLoginStatus] = useState({
    isLoading: false,
    error: null,
    credentials: null
  });

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollmentNumber: "",
      password: "",
    },
  })

  // Handle side effects in useEffect
  useEffect(() => {
    if (!loginStatus.credentials) return;

    const performLogin = async () => {
      try {
        await w.student_login(
          loginStatus.credentials.enrollmentNumber,
          loginStatus.credentials.password
        );

        // Store credentials in localStorage
        localStorage.setItem("username", loginStatus.credentials.enrollmentNumber);
        localStorage.setItem("password", loginStatus.credentials.password);

        console.log("Login successful");
        setLoginStatus(prev => ({
          ...prev,
          isLoading: false,
          credentials: null,
        }));
        onLoginSuccess();
      } catch (error) {
        console.error("Login failed:", error);
        setLoginStatus(prev => ({
          ...prev,
          isLoading: false,
          error: "Login failed. Please check your credentials.",
          credentials: null,
        }));
      }
    };

    setLoginStatus(prev => ({ ...prev, isLoading: true }));
    performLogin();
  }, [loginStatus.credentials, onLoginSuccess]);

  // Clean form submission
  function onSubmit(values) {
    setLoginStatus(prev => ({
      ...prev,
      credentials: values,
      error: null
    }));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#191c20]">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center text-white">
          <h1 className="text-2xl font-bold">Login</h1>
          <p>Enter your credentials to sign in</p>
          {loginStatus.error && (
            <p className="text-red-500">{loginStatus.error}</p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="enrollmentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Enrollment Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter enrollment number" {...field} />
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
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full bg-white text-[#191c20]"
              disabled={loginStatus.isLoading}
            >
              {loginStatus.isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Info } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid university email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    await login(data);
  };

  return (
    <div className="min-h-screen flex bg-background w-full">
      {/* Left Panel - Branding & Info */}
      <div className="hidden lg:flex w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
            alt="Campus Tech Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-lg px-12 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-display font-extrabold tracking-tight mb-4">
              CampusSlot <span className="text-blue-400">v1.0</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-12 font-light">
              Priority-Based Lab Classroom Management System
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-primary-foreground/10 p-4 rounded-2xl backdrop-blur-sm border border-primary-foreground/10">
                <div className="w-3 h-3 rounded-full bg-red-400 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(248,113,113,0.6)]" />
                <div>
                  <h3 className="font-semibold text-lg">P1 - Placement Drives</h3>
                  <p className="text-sm text-primary-foreground/70">Highest priority. Automatically displaces other bookings.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-primary-foreground/10 p-4 rounded-2xl backdrop-blur-sm border border-primary-foreground/10">
                <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                <div>
                  <h3 className="font-semibold text-lg">P2 - Lab Exams</h3>
                  <p className="text-sm text-primary-foreground/70">Medium priority. Cannot displace P1, displaces P3.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-primary-foreground/10 p-4 rounded-2xl backdrop-blur-sm border border-primary-foreground/10">
                <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                <div>
                  <h3 className="font-semibold text-lg">P3 - Regular Classes</h3>
                  <p className="text-sm text-primary-foreground/70">Standard priority for daily academic scheduling.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your lab management dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input 
                id="email" 
                placeholder="yourname@srmist.edu.in" 
                className="h-12 rounded-xl bg-card"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  className="h-12 rounded-xl bg-card pr-10"
                  {...register("password")}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me for 30 days
              </label>
            </div>

            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account? <Link href="/register" className="text-primary font-semibold hover:underline">Register here</Link>
          </p>

          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 mt-8">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              <Info className="w-4 h-4" /> Demo Credentials (password: password)
            </h4>
            <ul className="text-xs text-blue-700/80 dark:text-blue-300/80 space-y-1 font-mono">
              <li>admin@srmist.edu.in</li>
              <li>coordinator@srmist.edu.in</li>
              <li>faculty@srmist.edu.in</li>
              <li>student@srmist.edu.in</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

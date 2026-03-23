import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Users, Shield, ArrowLeft, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "Student", title: "Student", icon: GraduationCap, desc: "View schedules and availability" },
  { id: "Faculty", title: "Faculty", icon: Users, desc: "Book labs and manage classes" },
  { id: "PlacementCoordinator", title: "Placement Admin", icon: Shield, desc: "High priority bookings" },
];

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid university email required"),
  password: z.string().min(6, "Password too short"),
  department: z.string().min(2, "Department is required"),
  regNumber: z.string().optional(),
});

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    // Mock registration
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: "Registration Successful", description: "You can now login with your credentials." });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl mb-8 flex justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="w-8 h-8" />
          <h1 className="text-2xl font-display font-bold tracking-tight">CampusSlot</h1>
        </div>
      </div>

      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-bold">Create Account</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className={step === 1 ? "text-primary" : ""}>Step 1</span>
              <span className="w-8 h-px bg-border"></span>
              <span className={step === 2 ? "text-primary" : ""}>Step 2</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-lg font-medium">Select Your Role</h3>
                  <p className="text-muted-foreground text-sm mt-1">Choose the account type that best describes you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => {
                    const isSelected = selectedRole === role.id;
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-6 rounded-xl border-2 text-left transition-all duration-200 flex flex-col items-center text-center gap-4 hover:-translate-y-1
                          ${isSelected 
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                            : 'border-border bg-card hover:border-primary/30 hover:bg-muted'}`}
                      >
                        <div className={`p-4 rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{role.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{role.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-between items-center pt-8 mt-8 border-t border-border">
                  <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to login
                  </Link>
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedRole}
                    className="px-8"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input placeholder="John Doe" {...register("name")} className="bg-muted/50" />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>University Email</Label>
                      <Input placeholder="email@srmist.edu.in" {...register("email")} className="bg-muted/50" />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input placeholder="e.g. Computer Science" {...register("department")} className="bg-muted/50" />
                      {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                    </div>
                    {selectedRole === "Student" && (
                      <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <Input placeholder="RA21..." {...register("regNumber")} className="bg-muted/50" />
                      </div>
                    )}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Password</Label>
                      <Input type="password" {...register("password")} className="bg-muted/50" />
                      {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-8 mt-8 border-t border-border">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="px-8">
                      {isSubmitting ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";
// src/components/NewBookingDialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search, Zap, Cpu, Monitor } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PRIORITY_LABELS, TIME_SLOTS, DAYS, type Lab, type BookingInput } from "@/types";
import { SmartSuggestDialog } from "./SmartSuggestDialog";

const bookingSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  labId: z.string().min(1, "Please select a lab"),
  day: z.string().min(1, "Please select a day"),
  startTime: z.string().min(1, "Please select a time"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  requiresI7: z.boolean().default(false),
  requiresGraphics: z.boolean().default(false),
});

type FormData = z.infer<typeof bookingSchema>;

export function NewBookingDialog({
  isOpen,
  onClose,
  initialDay = "",
  initialTime = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialDay?: string;
  initialTime?: string;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);

  // Auto-determine priority based on role
  const getPriority = () => {
    if (user?.role === "PlacementCoordinator") return "P1";
    if (user?.role === "Faculty") return "P2"; // Defaulting to exam, could be P3
    return "P3"; 
  };

  const { data: labs } = useQuery<{ data: Lab[] }>({
    queryKey: ["/api/labs"],
    queryFn: () => fetch("/api/labs").then(r => r.json()),
  });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      day: initialDay,
      startTime: initialTime,
      requiresI7: false,
      requiresGraphics: false,
      capacity: 30,
    },
  });

  const capacity = watch("capacity");
  const requiresI7 = watch("requiresI7");
  const requiresGraphics = watch("requiresGraphics");

  const mutation = useMutation({
    mutationFn: async (data: BookingInput) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Booking failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    const endTime = TIME_SLOTS.find(t => t.startTime === data.startTime)?.endTime ?? "";
    
    mutation.mutate({
      subject: data.subject,
      faculty: user?.name ?? "Unknown",
      labId: data.labId,
      timeSlot: { day: data.day, startTime: data.startTime, endTime },
      capacity: data.capacity,
      requiresI7: data.requiresI7,
      requiresGraphics: data.requiresGraphics,
      priority: getPriority(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">New Lab Booking</h2>
            <p className="text-sm text-muted-foreground mt-1 tracking-tight">
              Priority: <strong className={getPriority() === "P1" ? "text-red-600" : getPriority() === "P2" ? "text-amber-600" : "text-emerald-600"}>
                {PRIORITY_LABELS[getPriority()]}
              </strong>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex justify-between items-start">
              <span>{error}</span>
              <button 
                type="button" 
                onClick={() => setShowSuggest(true)}
                className="shrink-0 text-xs bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity ml-4 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Find Alternative
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject / Event Name</label>
            <input {...register("subject")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="e.g. Operating Systems DB-2" />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Day</label>
              <select {...register("day")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Select day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.day && <p className="text-sm text-destructive">{errors.day.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Slot</label>
              <select {...register("startTime")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => <option key={t.startTime} value={t.startTime}>{t.startTime} - {t.endTime}</option>)}
              </select>
              {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Capacity</label>
              <input type="number" {...register("capacity")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                Target Lab
                <button 
                  type="button" 
                  onClick={() => setShowSuggest(true)}
                  className="text-primary text-xs flex items-center gap-1 hover:underline"
                >
                  <Zap className="w-3 h-3" /> Auto-suggest
                </button>
              </label>
              <select {...register("labId")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Select a lab</option>
                {labs?.data?.filter(l => !l.isUnderMaintenance).map(l => (
                  <option key={l.id} value={l.id} disabled={l.capacity < (capacity || 0)}>
                    {l.name} (Cap: {l.capacity})
                  </option>
                ))}
              </select>
              {errors.labId && <p className="text-sm text-destructive">{errors.labId.message}</p>}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-xl space-y-3 border">
            <h4 className="text-sm font-semibold mb-2">Hardware Requirements <span className="text-muted-foreground font-normal">(Optional)</span></h4>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" {...register("requiresI7")} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Cpu className="w-4 h-4 text-blue-600" /> Core i7
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" {...register("requiresGraphics")} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Monitor className="w-4 h-4 text-purple-600" /> Dedicated GPU
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted border transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 transition-colors shadow-sm disabled:opacity-50">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Confirm Booking"}
            </button>
          </div>
        </form>

        <SmartSuggestDialog 
          isOpen={showSuggest} 
          onClose={() => setShowSuggest(false)}
          capacity={capacity}
          requiresI7={requiresI7}
          requiresGraphics={requiresGraphics}
          onSelect={(suggestion) => {
            // @ts-ignore
            register("labId").onChange({ target: { value: suggestion.lab.id } });
            // @ts-ignore
            register("day").onChange({ target: { value: suggestion.timeSlot.day } });
            // @ts-ignore
            register("startTime").onChange({ target: { value: suggestion.timeSlot.startTime } });
            setShowSuggest(false);
          }}
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useCreateBooking, useGetLabs } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, AlertCircle } from "lucide-react";
import { cn } from "./layout";

const bookingSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  labId: z.string().min(1, "Lab selection is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  capacity: z.coerce.number().min(1).max(200),
  priority: z.enum(["P1", "P2", "P3"]),
  requiresI7: z.boolean().default(false),
  requiresGraphics: z.boolean().default(false),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface NewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSlot?: { day: string; time: string };
}

export function NewBookingDialog({ open, onOpenChange, initialSlot }: NewBookingDialogProps) {
  const { user } = useAuth();
  const { data: labs } = useGetLabs();
  const createBooking = useCreateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      subject: "",
      labId: "",
      day: initialSlot?.day || "Monday",
      startTime: initialSlot?.time || "09:00",
      endTime: initialSlot ? `${parseInt(initialSlot.time) + 1}:00` : "10:00",
      capacity: 30,
      priority: user?.role === "PlacementCoordinator" ? "P1" : "P3",
      requiresI7: false,
      requiresGraphics: false,
    }
  });

  const selectedPriority = watch("priority");

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) return;
    
    createBooking.mutate({
      data: {
        subject: data.subject,
        faculty: user.name,
        labId: data.labId,
        timeSlot: {
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
        },
        capacity: data.capacity,
        priority: data.priority,
        requiresI7: data.requiresI7,
        requiresGraphics: data.requiresGraphics,
      }
    }, {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        onOpenChange(false);
        
        if (res.displaced) {
          toast({
            title: "Booking Created with Priority Override",
            description: `Successfully displaced lower priority booking: ${res.displaced.subject}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Booking Created",
            description: "Your lab slot has been successfully booked.",
          });
        }
      },
      onError: (err: any) => {
        toast({
          title: "Booking Failed",
          description: err.message || "A conflict occurred with an equal or higher priority booking.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-card">
        <div className="bg-muted px-6 py-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            New Lab Booking
          </DialogTitle>
          <DialogDescription>
            Request a lab slot. Priority overrides are managed automatically.
          </DialogDescription>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Subject / Purpose</Label>
              <Input placeholder="e.g. CS301 Database Systems" {...register("subject")} />
              {errors.subject && <span className="text-xs text-destructive">{errors.subject.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Lab Selection</Label>
              <Select onValueChange={(val) => setValue("labId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Lab" />
                </SelectTrigger>
                <SelectContent>
                  {labs?.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.name} (Cap: {lab.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.labId && <span className="text-xs text-destructive">{errors.labId.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                defaultValue={selectedPriority}
                onValueChange={(val: any) => setValue("priority", val)}
                disabled={user?.role !== "PlacementCoordinator" && user?.role !== "Admin"}
              >
                <SelectTrigger className={cn(
                  "font-medium",
                  selectedPriority === "P1" && "text-red-700 bg-red-50 border-red-200",
                  selectedPriority === "P2" && "text-amber-700 bg-amber-50 border-amber-200",
                  selectedPriority === "P3" && "text-emerald-700 bg-emerald-50 border-emerald-200",
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1" className="text-red-700 font-medium">P1 - Placement Drive</SelectItem>
                  <SelectItem value="P2" className="text-amber-700 font-medium">P2 - Lab Exam</SelectItem>
                  <SelectItem value="P3" className="text-emerald-700 font-medium">P3 - Regular Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Day</Label>
              <Select defaultValue={watch("day")} onValueChange={(val) => setValue("day", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Slot</Label>
              <div className="flex items-center gap-2">
                <Input type="time" {...register("startTime")} className="flex-1" />
                <span className="text-muted-foreground">-</span>
                <Input type="time" {...register("endTime")} className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Capacity Needed</Label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="number" className="pl-9" {...register("capacity")} />
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <Label>Hardware Requirements</Label>
              <div className="flex items-center space-x-2">
                <Switch id="i7" onCheckedChange={(c) => setValue("requiresI7", c)} />
                <Label htmlFor="i7" className="font-normal cursor-pointer">Requires Core i7</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="gpu" onCheckedChange={(c) => setValue("requiresGraphics", c)} />
                <Label htmlFor="gpu" className="font-normal cursor-pointer">Requires Dedicated GPU</Label>
              </div>
            </div>
          </div>

          {selectedPriority === "P1" && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Booking as P1 will automatically displace any conflicting P2 or P3 bookings. Use with caution.</p>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

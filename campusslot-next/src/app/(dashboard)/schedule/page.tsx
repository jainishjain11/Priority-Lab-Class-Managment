"use client";
// src/app/(dashboard)/schedule/page.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

export default function SchedulePage() {
  const { data: rawBookings, isLoading } = useQuery<{ data: Booking[] }>({
    queryKey: ["/api/bookings"],
    queryFn: () => fetch("/api/bookings").then(res => res.json()),
  });

  const bookings = rawBookings?.data ?? [];
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCellClick = (day: string, hour: number) => {
    setSelectedSlot({ day, time: `${hour.toString().padStart(2, '0')}:00` });
    setDialogOpen(true);
  };

  const getBookingForSlot = (day: string, hour: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    return bookings.find(b => b.timeSlot.day === day && b.timeSlot.startTime <= timeString && b.timeSlot.endTime > timeString);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Schedule</h1>
          <p className="text-muted-foreground text-sm">Tech Block Labs (All)</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card border rounded-lg p-1">
            <button className="h-8 w-8 hover:bg-muted rounded inline-flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-medium px-4">Current Week</span>
            <button className="h-8 w-8 hover:bg-muted rounded inline-flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button 
            onClick={() => { setSelectedSlot(undefined); setDialogOpen(true); }}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            + Book Slot
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-card border rounded-xl shadow-sm">
        <div className="p-3 border-b bg-muted/30 flex items-center gap-6 text-sm">
          <span className="font-semibold text-muted-foreground mr-2">Priority Legend:</span>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" /> P1 Placement</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> P2 Exams</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> P3 Classes</div>
        </div>

        <div className="flex-1 overflow-auto schedule-scroll relative">
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          
          <div className="min-w-[800px] h-full flex flex-col">
            <div className="flex border-b sticky top-0 bg-card z-20 shadow-sm">
              <div className="w-20 shrink-0 border-r bg-muted/30 p-3 text-xs font-semibold text-center text-muted-foreground">Time</div>
              {DAYS.map(day => (
                <div key={day} className="flex-1 p-3 text-center font-medium border-r last:border-r-0">{day}</div>
              ))}
            </div>

            <div className="flex-1 relative">
              {HOURS.map(hour => (
                <div key={hour} className="flex border-b last:border-b-0 h-[100px] group">
                  <div className="w-20 shrink-0 border-r bg-card p-2 text-xs font-medium text-center text-muted-foreground flex flex-col items-center justify-center">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  
                  {DAYS.map(day => {
                    const booking = getBookingForSlot(day, hour);
                    const isFirstHour = booking && booking.timeSlot.startTime === `${hour.toString().padStart(2, '0')}:00`;

                    return (
                      <div 
                        key={`${day}-${hour}`} 
                        className={cn(
                          "flex-1 border-r last:border-r-0 relative transition-colors",
                          !booking && "hover:bg-primary/5 cursor-pointer"
                        )}
                        onClick={() => !booking && handleCellClick(day, hour)}
                      >
                        {isFirstHour && booking && (
                          <div className={cn(
                            "absolute inset-1 z-10 rounded-xl p-3 shadow-md border overflow-hidden flex flex-col transition-transform hover:scale-[1.02] cursor-default",
                            booking.priority === "P1" ? "priority-p1" : 
                            booking.priority === "P2" ? "priority-p2" : "priority-p3"
                          )}
                          style={{
                            height: `calc(${parseInt(booking.timeSlot.endTime) - parseInt(booking.timeSlot.startTime)} * 100px - 8px)`
                          }}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                booking.priority === "P1" ? "bg-red-200 text-red-900" : 
                                booking.priority === "P2" ? "bg-amber-200 text-amber-900" : 
                                "bg-emerald-200 text-emerald-900"
                              )}>
                                {booking.priority}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm leading-tight line-clamp-2 mt-1">{booking.subject}</h4>
                            <div className="mt-auto space-y-1">
                              <div className="flex items-center gap-1.5 text-xs opacity-90"><MapPin className="w-3.5 h-3.5" /> {booking.labName}</div>
                              <div className="flex items-center gap-1.5 text-xs opacity-90"><Clock className="w-3.5 h-3.5" /> {booking.timeSlot.startTime} - {booking.timeSlot.endTime}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useGetBookings } from "@workspace/api-client-react";
import { NewBookingDialog } from "@/components/new-booking-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/components/layout";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 09:00 to 17:00

export default function Schedule() {
  const { data: bookings, isLoading } = useGetBookings({ week: "current" });
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCellClick = (day: string, hour: number) => {
    setSelectedSlot({ day, time: `${hour.toString().padStart(2, '0')}:00` });
    setDialogOpen(true);
  };

  const getBookingForSlot = (day: string, hour: number) => {
    if (!bookings) return null;
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    return bookings.find(b => b.timeSlot.day === day && b.timeSlot.startTime <= timeString && b.timeSlot.endTime > timeString);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold">Live Schedule</h1>
          <p className="text-muted-foreground text-sm">Tech Block Labs (All)</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card border rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-medium px-4">Oct 24 - Oct 28</span>
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button onClick={() => { setSelectedSlot(undefined); setDialogOpen(true); }}>
            + Book Slot
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-card border shadow-sm">
        {/* Legend */}
        <div className="p-3 border-b bg-muted/30 flex items-center gap-6 text-sm">
          <span className="font-semibold text-muted-foreground mr-2">Priority Legend:</span>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" /> P1 Placement</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> P2 Exams</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> P3 Classes</div>
        </div>

        {/* Grid Container */}
        <div className="flex-1 overflow-auto schedule-scroll bg-muted/10 relative">
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          
          <div className="min-w-[800px] h-full flex flex-col">
            {/* Header Row */}
            <div className="flex border-b sticky top-0 bg-card z-20 shadow-sm">
              <div className="w-20 shrink-0 border-r bg-muted/30 p-3 text-xs font-semibold text-center text-muted-foreground">
                Time
              </div>
              {DAYS.map(day => (
                <div key={day} className="flex-1 p-3 text-center font-medium border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="flex-1 relative">
              {HOURS.map(hour => (
                <div key={hour} className="flex border-b last:border-b-0 h-[100px] group">
                  <div className="w-20 shrink-0 border-r bg-card p-2 text-xs font-medium text-center text-muted-foreground flex flex-col items-center justify-center">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  
                  {DAYS.map(day => {
                    const booking = getBookingForSlot(day, hour);
                    // Check if it's the first hour of the booking to render the card
                    const isFirstHour = booking && booking.timeSlot.startTime === `${hour.toString().padStart(2, '0')}:00`;
                    // If it's a booked slot but not the first hour, we just render an empty space (card from above spans down)
                    const isSpanned = booking && !isFirstHour;

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
                                booking.priority === "P1" ? "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200" : 
                                booking.priority === "P2" ? "bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200" : 
                                "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200"
                              )}>
                                {booking.priority}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm leading-tight line-clamp-2 mt-1">{booking.subject}</h4>
                            <div className="mt-auto space-y-1">
                              <div className="flex items-center gap-1.5 text-xs opacity-90">
                                <MapPin className="w-3.5 h-3.5" /> {booking.labName}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs opacity-90">
                                <Clock className="w-3.5 h-3.5" /> {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                              </div>
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
      </Card>

      <NewBookingDialog open={dialogOpen} onOpenChange={setDialogOpen} initialSlot={selectedSlot} />
    </div>
  );
}

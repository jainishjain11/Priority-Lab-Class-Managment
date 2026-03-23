import { useGetConflicts } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowRight, Clock, MapPin, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Conflicts() {
  const { data: conflicts, isLoading } = useGetConflicts();

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Conflict Center
        </h1>
        <p className="text-muted-foreground mt-2">
          History of automated priority overrides. P1 drives automatically displace P2/P3 bookings.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(i => <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : conflicts?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No conflicts recorded</h3>
          <p className="text-muted-foreground mt-1">The schedule has been running smoothly without overrides.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {conflicts?.map((conflict, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={conflict.id}
            >
              <Card className="overflow-hidden shadow-sm border-border hover:shadow-md transition-all">
                <div className="bg-muted/50 px-6 py-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-semibold text-sm">Priority Override Event</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> 
                      {format(new Date(conflict.resolvedAt), "MMM d, yyyy • HH:mm")}
                    </span>
                    <Badge variant="outline" className="bg-background text-xs font-normal">Auto-Resolved</Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Winning Booking Card */}
                    <div className="flex-1 w-full bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl p-5 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge className="bg-green-600 hover:bg-green-700 shadow-sm border-0">WINNING</Badge>
                        <Badge variant="outline" className="bg-white dark:bg-black text-red-700 border-red-200">P1</Badge>
                      </div>
                      
                      <h3 className="font-bold text-lg text-red-950 dark:text-red-200 mb-4 pr-24">
                        {conflict.winningBooking.subject}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-red-800/80 dark:text-red-300/80">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {conflict.winningBooking.faculty}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {conflict.winningBooking.labName}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {conflict.winningBooking.timeSlot.day}, {conflict.winningBooking.timeSlot.startTime} - {conflict.winningBooking.timeSlot.endTime}</div>
                      </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center text-muted-foreground/50 rotate-90 lg:rotate-0">
                      <div className="bg-background border rounded-full p-2 shadow-sm z-10">
                        <ArrowRight className="w-6 h-6 text-red-500" />
                      </div>
                    </div>

                    {/* Displaced Booking Card */}
                    <div className="flex-1 w-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-5 relative opacity-80 filter grayscale-[0.3]">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge variant="destructive" className="shadow-sm border-0">DISPLACED</Badge>
                        <Badge variant="outline" className="bg-white dark:bg-black text-emerald-700 border-emerald-200">P3</Badge>
                      </div>
                      
                      <h3 className="font-bold text-lg text-emerald-950 dark:text-emerald-200 mb-4 pr-28 line-through decoration-emerald-500/40">
                        {conflict.displacedBooking.subject}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-emerald-800/80 dark:text-emerald-300/80">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {conflict.displacedBooking.faculty}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {conflict.displacedBooking.labName}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {conflict.displacedBooking.timeSlot.day}, {conflict.displacedBooking.timeSlot.startTime} - {conflict.displacedBooking.timeSlot.endTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Resolution Note:</strong> {conflict.resolution}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
// src/app/(dashboard)/conflicts/page.tsx
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ShieldAlert, ArrowRight, Clock, MapPin, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { ConflictRecord } from "@/types";

export default function ConflictsPage() {
  const { data: rawConflicts, isLoading } = useQuery<{ data: ConflictRecord[] }>({
    queryKey: ["/api/conflicts"],
    queryFn: () => fetch("/api/conflicts").then(res => res.json()),
  });

  const conflicts = rawConflicts?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Conflict Center
        </h1>
        <p className="text-muted-foreground mt-2">
          History of automated priority overrides. P1 drives automatically displace P2/P3 bookings.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(i => <div key={i} className="h-64 bg-card rounded-2xl animate-pulse border" />)}
        </div>
      ) : conflicts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed text-muted-foreground">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No conflicts recorded</h3>
          <p className="mt-1">The schedule has been running smoothly without overrides.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {conflicts.map((conflict, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={conflict.id}
            >
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-muted/50 px-6 py-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-semibold text-sm">Priority Override Event</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" /> 
                    {format(new Date(conflict.resolvedAt), "MMM d, yyyy • HH:mm")}
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">Auto-Resolved</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Winning */}
                    <div className="flex-1 w-full bg-red-50 border border-red-100 rounded-xl p-5 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">WINNING</span>
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-red-700">P1</span>
                      </div>
                      <h3 className="font-bold text-lg text-red-950 mb-4 pr-24">{conflict.winningBooking.subject}</h3>
                      <div className="space-y-2 text-sm text-red-800/80">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {conflict.winningBooking.faculty}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {conflict.winningBooking.labName}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {conflict.winningBooking.timeSlot.day}, {conflict.winningBooking.timeSlot.startTime} - {conflict.winningBooking.timeSlot.endTime}</div>
                      </div>
                    </div>

                    <ArrowRight className="w-6 h-6 text-red-500 shrink-0 rotate-90 lg:rotate-0" />

                    {/* Displaced */}
                    <div className="flex-1 w-full bg-emerald-50 border border-emerald-100 rounded-xl p-5 relative filter grayscale-[0.3]">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-white">DISPLACED</span>
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-emerald-700">P3</span>
                      </div>
                      <h3 className="font-bold text-lg text-emerald-950 mb-4 pr-28 line-through decoration-emerald-500/40">{conflict.displacedBooking.subject}</h3>
                      <div className="space-y-2 text-sm text-emerald-800/80">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {conflict.displacedBooking.faculty}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {conflict.displacedBooking.labName}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {conflict.displacedBooking.timeSlot.day}, {conflict.displacedBooking.timeSlot.startTime} - {conflict.displacedBooking.timeSlot.endTime}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground"><strong>Resolution Note:</strong> {conflict.resolution}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

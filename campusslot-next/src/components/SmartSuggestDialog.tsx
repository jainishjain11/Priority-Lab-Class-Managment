"use client";
import { useQuery } from "@tanstack/react-query";
import { X, Sparkles, AlertCircle, Loader2, Check } from "lucide-react";
import type { SlotSuggestion, SuggestionQuery } from "@/types";

export function SmartSuggestDialog({
  isOpen, onClose, onSelect, capacity, requiresI7, requiresGraphics, excludeLabId, excludeDay
}: {
  isOpen: boolean; onClose: () => void;
  onSelect: (s: SlotSuggestion) => void;
  capacity: number; requiresI7?: boolean; requiresGraphics?: boolean;
  excludeLabId?: string; excludeDay?: string;
}) {
  const { data: suggestions, isLoading, isError } = useQuery<{ data: SlotSuggestion[] }>({
    queryKey: ["/api/suggestions", { capacity, requiresI7, requiresGraphics, excludeLabId, excludeDay }],
    queryFn: async () => {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity, requiresI7, requiresGraphics, excludeLabId, excludeDay }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Smart Suggest</h2>
              <p className="text-sm font-medium text-blue-900/60 dark:text-blue-100/60 mt-0.5">Finding the optimal non-conflicting slot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-background">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="font-medium animate-pulse">Running scheduling algorithms...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">Failed to compute suggestions. Please try again.</p>
            </div>
          ) : !suggestions?.data || suggestions.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium text-foreground">No matching slots available</p>
              <p className="text-sm mt-1 text-center max-w-sm">Try reducing your capacity requirement or removing hardware constraints.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.data.map((s, idx) => (
                <button
                  key={`${s.lab.id}-${s.timeSlot.day}-${s.timeSlot.startTime}`}
                  onClick={() => onSelect(s)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                    idx === 0 
                      ? 'bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
                      : 'bg-card hover:bg-muted/50 border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase rounded-bl-lg tracking-wider">Top Match</div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold text-lg ${idx === 0 ? 'text-blue-950 dark:text-blue-100' : 'text-foreground'}`}>
                        {s.timeSlot.day}, {s.timeSlot.startTime} - {s.timeSlot.endTime}
                      </h4>
                      <p className={`font-medium ${idx === 0 ? 'text-blue-800/80 dark:text-blue-200/80' : 'text-muted-foreground'}`}>
                        {s.lab.name} ({s.lab.capacity} seats)
                      </p>
                    </div>
                    <div className={`flex flex-col items-end gap-1 ${idx === 0 ? 'mt-4' : ''}`}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border shadow-sm">
                        <span className="text-xs font-bold text-muted-foreground">Score</span>
                        <span className={`text-sm font-black ${s.score >= 90 ? 'text-emerald-500' : s.score >= 75 ? 'text-blue-500' : 'text-amber-500'}`}>
                          {s.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2 mt-4">
                    {s.reason.split(", ").map(r => (
                      <span key={r} className="inline-flex items-center gap-1.5 px-2 py-1 rounded border bg-background/50 text-[11px] font-medium text-muted-foreground">
                        <Check className="w-3 h-3 text-emerald-500" /> {r}
                      </span>
                    ))}
                  </div>

                  {/* Hover effect highlight */}
                  <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

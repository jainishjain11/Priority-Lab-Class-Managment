"use client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, CheckSquare } from "lucide-react";
import type { Alert } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const { data: rawAlerts, refetch } = useQuery<{ data: Alert[] }>({
    queryKey: ["/api/alerts"],
    queryFn: () => fetch("/api/alerts").then(res => res.json()),
  });

  const alerts = rawAlerts?.data ?? [];
  const [markingId, setMarkingId] = useState<string | null>(null);

  const markRead = async (id: string) => {
    setMarkingId(id);
    await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    await refetch();
    setMarkingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          Displacement Alerts
        </h1>
        <p className="text-muted-foreground mt-2">
          Notifications regarding priority overrides affecting your classes.
        </p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-xl bg-card text-muted-foreground">
            No alerts found.
          </div>
        ) : (
          alerts.map(a => (
            <div key={a.id} className={cn("flex gap-4 p-5 rounded-xl border transition-colors", a.isRead ? "bg-muted/30" : "bg-card shadow-sm border-red-200")}>
              <div className="mt-1">
                <span className={cn("w-2 h-2 rounded-full inline-block", a.isRead ? "bg-transparent" : "bg-red-500 animate-pulse")} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={cn("font-medium", !a.isRead && "font-bold text-red-900")}>Booking Displaced: {a.subject}</h3>
                  <span className="text-xs text-muted-foreground">{format(new Date(a.createdAt), "MMM d, HH:mm")}</span>
                </div>
                <p className="text-sm mt-1">{a.reason}</p>
                <div className="text-xs text-muted-foreground mt-2 font-medium bg-muted p-2 rounded w-fit">
                  Originally: {a.originalLab} on {a.originalDay}, {a.originalStartTime}-{a.originalEndTime}
                </div>
              </div>
              {!a.isRead && (
                <button
                  onClick={() => markRead(a.id)}
                  disabled={markingId === a.id}
                  className="shrink-0 h-9 px-3 rounded-lg border text-sm font-medium hover:bg-muted self-center flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" /> {markingId === a.id ? "Marking..." : "Mark Read"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

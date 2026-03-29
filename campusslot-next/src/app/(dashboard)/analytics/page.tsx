"use client";
// src/app/(dashboard)/analytics/page.tsx
import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import type { AnalyticsOverview, LabUtilization } from "@/types";

export default function AnalyticsPage() {
  const { data: overviewRaw } = useQuery<{ data: AnalyticsOverview }>({
    queryKey: ["/api/analytics/overview"],
    queryFn: () => fetch("/api/analytics/overview").then(res => res.json()),
  });

  const { data: utilRaw } = useQuery<{ data: LabUtilization[] }>({
    queryKey: ["/api/analytics/utilization"],
    queryFn: () => fetch("/api/analytics/utilization").then(res => res.json()),
  });

  const overview = overviewRaw?.data;
  const utilization = utilRaw?.data;

  const priorityData = [
    { name: "P1 Drives", value: overview?.p1Count ?? 0, fill: "#ef4444" },
    { name: "P2 Exams", value: overview?.p2Count ?? 0, fill: "#f59e0b" },
    { name: "P3 Regular", value: overview?.p3Count ?? 0, fill: "#10b981" },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-primary" />
          Analytics & Usage
        </h1>
        <p className="text-muted-foreground mt-2">Metrics for lab utilization and scheduling patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-muted-foreground" /> Priority Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-muted-foreground" /> Daily Peak Hours
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview?.peakHours ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-6">Lab Utilization (%)</h3>
        <div className="space-y-4">
          {utilization?.map((lab) => (
            <div key={lab.labName} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium">{lab.labName}</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    lab.utilizationPercent > 80 ? "bg-red-500" :
                    lab.utilizationPercent > 50 ? "bg-amber-500" : "bg-emerald-500"
                  }`} 
                  style={{ width: `${lab.utilizationPercent}%` }}
                />
              </div>
              <span className="w-12 text-sm text-right tabular-nums text-muted-foreground">{lab.utilizationPercent}%</span>
            </div>
          ))}
          {!utilization && <div className="text-center text-muted-foreground py-8 animate-pulse">Loading utilization...</div>}
        </div>
      </div>
    </div>
  );
}

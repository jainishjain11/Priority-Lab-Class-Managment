"use client";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/types";
import {
  ShieldAlert, Server, Users, Calendar, X, ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);

  const { data: statsRaw, isLoading } = useQuery<{ data: DashboardStats }>({
    queryKey: ["/api/analytics/stats"],
    queryFn: () => fetch("/api/analytics/stats").then((r) => r.json()),
  });

  const stats = statsRaw?.data || {
    totalLabs: 6,
    totalCapacity: 320,
    occupancyPercent: 33,
    labsInUse: 2,
    pendingConflicts: 2,
    autoResolved: 15,
    availableNow: 4,
  };

  return (
    <div className="space-y-8 pb-8">
      {showBanner && (
        <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 md:p-8 text-primary-foreground shadow-lg overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mb-6 text-sm md:text-base">
              You are logged in as <strong className="text-white">{user?.role}</strong>. The
              Priority-Based Lab Management System resolves conflicts automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs md:text-sm font-medium backdrop-blur-sm tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-400"></span> P1 DRIVES
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs md:text-sm font-medium backdrop-blur-sm tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> P2 EXAMS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs md:text-sm font-medium backdrop-blur-sm tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> P3 CLASSES
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 p-2 text-primary-foreground/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Live Overview</h2>
        <Link 
          href="/schedule" 
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 shadow-sm transition-colors"
        >
          View Full Schedule
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Labs</p>
              <h3 className="text-3xl font-bold">{isLoading ? "-" : stats.totalLabs}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{stats.totalCapacity} total seats</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Current Occupancy</p>
              <h3 className="text-3xl font-bold">{isLoading ? "-" : stats.occupancyPercent}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{stats.labsInUse} labs currently in use</p>
        </div>

        <div className="bg-card border-red-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Conflicts</p>
              <h3 className="text-3xl font-bold text-red-600">{isLoading ? "-" : stats.pendingConflicts}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{stats.autoResolved} auto-resolved today</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Available Now</p>
              <h3 className="text-3xl font-bold">{isLoading ? "-" : stats.availableNow}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-green-600 mt-4">Ready for booking</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-muted/30 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Today's Schedule Preview</h3>
            <p className="text-sm text-muted-foreground">Quick glance at ongoing lab sessions</p>
          </div>
          <Link href="/schedule" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Full Grid <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="priority-p1 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-200 text-red-900">P1</span>
              </div>
              <p className="text-sm font-bold mb-1 mt-2">TCS Placement</p>
              <p className="text-xs opacity-90">Lab 101 • 09:00 - 13:00</p>
            </div>
            <div className="priority-p3 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">P3</span>
              </div>
              <p className="text-sm font-bold mb-1 mt-2">Database Systems</p>
              <p className="text-xs opacity-90">Lab 201 • 10:00 - 12:00</p>
            </div>
            <div className="priority-p2 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">P2</span>
              </div>
              <p className="text-sm font-bold mb-1 mt-2">OS Practical</p>
              <p className="text-xs opacity-90">Lab 301 • 13:00 - 16:00</p>
            </div>
            <Link href="/schedule" className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors h-[100px]">
              <Calendar className="w-5 h-5 mb-1 opacity-60" />
              <p className="text-xs font-medium">Available Slot</p>
            </Link>
            <div className="priority-p3 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">P3</span>
              </div>
              <p className="text-sm font-bold mb-1 mt-2">Network Sec.</p>
              <p className="text-xs opacity-90">Lab 102 • 15:00 - 17:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

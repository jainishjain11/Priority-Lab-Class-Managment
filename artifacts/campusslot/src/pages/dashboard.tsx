import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldAlert,
  Server,
  Users,
  Calendar,
  X,
  ExternalLink,
} from "lucide-react";
import { NewBookingDialog } from "@/components/new-booking-dialog";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats();
  const [showBanner, setShowBanner] = useState(true);
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  // Mock stats fallback if API is not fully seeded
  const displayStats = stats || {
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
      {/* Welcome Banner */}
      {showBanner && (
        <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 md:p-8 text-primary-foreground shadow-lg overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mb-6">
              You are logged in as{" "}
              <strong className="text-white">{user?.role}</strong>. The
              Priority-Based Lab Management System (PLMS) resolves conflicts
              automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-red-400"></span> P1
                Drives
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> P2
                Exams
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> P3
                Classes
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 p-2 text-primary-foreground/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Decorative background shape */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-display font-bold tracking-tight">
          Live Schedule Overview
        </h2>
        <div className="flex gap-3">
          <Button variant="outline">Export Schedule</Button>
          <Button onClick={() => setNewBookingOpen(true)} className="shadow-md">
            + New Booking
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Labs
                </p>
                <h3 className="text-3xl font-bold">
                  {isLoading ? "-" : displayStats.totalLabs}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Server className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {displayStats.totalCapacity} total seats
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Current Occupancy
                </p>
                <h3 className="text-3xl font-bold">
                  {isLoading ? "-" : displayStats.occupancyPercent}%
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {displayStats.labsInUse} labs currently in use
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-red-100 dark:border-red-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Pending Conflicts
                </p>
                <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {isLoading ? "-" : displayStats.pendingConflicts}
                </h3>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {displayStats.autoResolved} auto-resolved today
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Available Now
                </p>
                <h3 className="text-3xl font-bold">
                  {isLoading ? "-" : displayStats.availableNow}
                </h3>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-green-600 dark:text-green-400 font-medium">
              Ready for booking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mini Schedule Preview */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b bg-muted/30 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Today's Schedule Preview</h3>
            <p className="text-sm text-muted-foreground">
              Quick glance at ongoing lab sessions
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/schedule" className="flex items-center gap-2">
              View Full Grid <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Mocked mini schedule for dashboard visual impact */}
            <div className="priority-p1 rounded-xl p-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-200 text-red-800 dark:bg-red-900/50">
                  P1
                </span>
              </div>
              <p className="text-sm font-semibold mb-1">TCS Placement Drive</p>
              <p className="text-xs opacity-80">Lab 101 • 09:00 - 13:00</p>
            </div>
            <div className="priority-p3 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50">
                  P3
                </span>
              </div>
              <p className="text-sm font-semibold mb-1">CS301 DB Lab</p>
              <p className="text-xs opacity-80">Lab 201 • 10:00 - 12:00</p>
            </div>
            <div className="priority-p2 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-900/50">
                  P2
                </span>
              </div>
              <p className="text-sm font-semibold mb-1">OS Lab Practical</p>
              <p className="text-xs opacity-80">Lab 301 • 13:00 - 16:00</p>
            </div>
            <div
              className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => setNewBookingOpen(true)}
            >
              <Calendar className="w-6 h-6 mb-2 opacity-50" />
              <p className="text-sm font-medium">Available Slot</p>
            </div>
            <div className="priority-p3 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50">
                  P3
                </span>
              </div>
              <p className="text-sm font-semibold mb-1">Networking Lab</p>
              <p className="text-xs opacity-80">Lab 102 • 15:00 - 17:00</p>
            </div>
          </div>
        </div>
      </Card>

      <NewBookingDialog
        open={newBookingOpen}
        onOpenChange={setNewBookingOpen}
      />
    </div>
  );
}

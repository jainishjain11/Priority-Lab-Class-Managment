"use client";
// src/components/layout/AppShell.tsx
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, ShieldAlert, BarChart2,
  ClipboardList, Server, Bell, LogOut, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Faculty", "PlacementCoordinator", "LabAssistant", "Student"] },
  { href: "/schedule", label: "Schedule", icon: Calendar, roles: ["Admin", "Faculty", "PlacementCoordinator", "LabAssistant", "Student"] },
  { href: "/conflicts", label: "Conflicts", icon: ShieldAlert, roles: ["Admin", "PlacementCoordinator"] },
  { href: "/analytics", label: "Analytics", icon: BarChart2, roles: ["Admin", "PlacementCoordinator"] },
  { href: "/audit", label: "Audit Log", icon: ClipboardList, roles: ["Admin", "LabAssistant"] },
  { href: "/labs", label: "Labs", icon: Server, roles: ["Admin", "LabAssistant"] },
  { href: "/alerts", label: "Alerts", icon: Bell, roles: ["Faculty", "Admin"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const visible = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r bg-card shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-base leading-none">CampusSlot</p>
            <p className="text-xs text-muted-foreground mt-0.5">PLMS v2.0</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visible.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

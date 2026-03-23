import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Calendar, 
  ShieldAlert, 
  BarChart3, 
  List, 
  Server, 
  Bell, 
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "PlacementCoordinator", "Faculty", "LabAssistant"] },
  { title: "Live Schedule", href: "/schedule", icon: Calendar, roles: ["Admin", "PlacementCoordinator", "Faculty", "LabAssistant", "Student"] },
  { title: "Conflict Center", href: "/conflicts", icon: ShieldAlert, roles: ["Admin", "PlacementCoordinator"] },
  { title: "Analytics", href: "/analytics", icon: BarChart3, roles: ["Admin", "PlacementCoordinator"] },
  { title: "Audit Logs", href: "/audit", icon: List, roles: ["Admin", "LabAssistant"] },
  { title: "Lab Management", href: "/labs", icon: Server, roles: ["Admin", "LabAssistant"] },
  { title: "My Alerts", href: "/alerts", icon: Bell, roles: ["Faculty"] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return <>{children}</>;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 p-4">
      <div className="flex items-center gap-3 mb-8 px-2 mt-2">
        <div className="bg-primary-foreground text-primary p-2 rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl leading-none">CampusSlot</h2>
          <p className="text-sidebar-foreground/60 text-xs">v1.0 PLMS</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8 px-2 py-3 bg-sidebar-accent rounded-xl border border-sidebar-border">
        <Avatar className="w-10 h-10 border-2 border-sidebar-border">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="font-medium text-sm truncate">{user.name}</p>
          <p className="text-sidebar-foreground/60 text-xs truncate">{user.role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                isActive 
                  ? "bg-primary-foreground text-primary shadow-sm" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )} />
                {item.title}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-sidebar-border mt-auto space-y-2">
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => document.documentElement.classList.toggle('dark')}>
          <Moon className="w-5 h-5 mr-3" />
          Toggle Theme
        </Button>
        <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen max-w-full">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="font-display font-bold text-lg">CampusSlot</h2>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

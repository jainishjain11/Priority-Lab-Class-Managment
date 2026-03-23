import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout";
import { useEffect } from "react";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Schedule from "@/pages/schedule";
import Conflicts from "@/pages/conflicts";
import Analytics from "@/pages/analytics";
import Audit from "@/pages/audit";
import Labs from "@/pages/labs";
import Alerts from "@/pages/alerts";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!isLoading && allowedRoles && user && !allowedRoles.includes(user.role)) {
      setLocation("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, setLocation]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <Component />;
}

function Router() {
  const [, setLocation] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={() => {
        useEffect(() => { setLocation("/dashboard"); }, []);
        return null;
      }} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard">
        <AppLayout><ProtectedRoute component={Dashboard} /></AppLayout>
      </Route>
      <Route path="/schedule">
        <AppLayout><ProtectedRoute component={Schedule} /></AppLayout>
      </Route>
      <Route path="/conflicts">
        <AppLayout><ProtectedRoute component={Conflicts} allowedRoles={["Admin", "PlacementCoordinator"]} /></AppLayout>
      </Route>
      <Route path="/analytics">
        <AppLayout><ProtectedRoute component={Analytics} allowedRoles={["Admin", "PlacementCoordinator"]} /></AppLayout>
      </Route>
      <Route path="/audit">
        <AppLayout><ProtectedRoute component={Audit} allowedRoles={["Admin", "LabAssistant"]} /></AppLayout>
      </Route>
      <Route path="/labs">
        <AppLayout><ProtectedRoute component={Labs} allowedRoles={["Admin", "LabAssistant"]} /></AppLayout>
      </Route>
      <Route path="/alerts">
        <AppLayout><ProtectedRoute component={Alerts} allowedRoles={["Faculty"]} /></AppLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

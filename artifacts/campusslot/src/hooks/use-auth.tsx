import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, LoginRequest } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users mapped to specific roles for presentation
const DEMO_USERS: Record<string, User> = {
  "admin@srmist.edu.in": { id: "1", name: "System Admin", email: "admin@srmist.edu.in", role: "Admin" as UserRole, department: "IT" },
  "coordinator@srmist.edu.in": { id: "2", name: "Placement Coordinator", email: "coordinator@srmist.edu.in", role: "PlacementCoordinator" as UserRole, department: "Placement" },
  "faculty@srmist.edu.in": { id: "3", name: "Dr. Jane Smith", email: "faculty@srmist.edu.in", role: "Faculty" as UserRole, department: "Computer Science" },
  "assistant@srmist.edu.in": { id: "4", name: "Lab Assistant", email: "assistant@srmist.edu.in", role: "LabAssistant" as UserRole, department: "Tech Support" },
  "student@srmist.edu.in": { id: "5", name: "John Doe", email: "student@srmist.edu.in", role: "Student" as UserRole, department: "Computer Science" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for mock auth session
    const storedUser = localStorage.getItem("campusslot_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("campusslot_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const demoUser = DEMO_USERS[data.email];
      if (demoUser && data.password === "password") {
        setUser(demoUser);
        localStorage.setItem("campusslot_user", JSON.stringify(demoUser));
        toast({ title: "Welcome back", description: `Logged in as ${demoUser.role}` });
        setLocation("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Login Failed", 
        description: "Please use the demo credentials provided." 
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("campusslot_user");
    setLocation("/login");
    toast({ description: "You have been securely logged out." });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

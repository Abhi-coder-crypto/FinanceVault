import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import LoginForm from "@/components/LoginForm";
import AdminDashboard from "@/pages/AdminDashboard";
import ClientPortal from "@/pages/ClientPortal";
import { login } from "@/lib/api";
import type { User } from "@shared/schema";

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleLogin = async (phoneNumber: string, password: string) => {
    try {
      const loggedInUser = await login(phoneNumber, password);
      setUser(loggedInUser);
      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <>
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : user.role === "admin" ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <ClientPortal user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

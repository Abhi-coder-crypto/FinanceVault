import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import LoginForm from "@/components/LoginForm";
import AdminDashboard from "@/pages/AdminDashboard";
import ClientPortal from "@/pages/ClientPortal";

function App() {
  const [user, setUser] = useState<{ phoneNumber: string; role: "admin" | "client" } | null>(null);

  const handleLogin = (phoneNumber: string, password: string) => {
    console.log("Login:", phoneNumber, password);
    // todo: remove mock functionality - Replace with actual API call
    // Mock login: +1111111111 = admin, anything else = client
    const role = phoneNumber.includes("1111111111") ? "admin" : "client";
    setUser({ phoneNumber, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {!user ? (
            <LoginForm onLogin={handleLogin} />
          ) : user.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <ClientPortal phoneNumber={user.phoneNumber} onLogout={handleLogout} />
          )}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

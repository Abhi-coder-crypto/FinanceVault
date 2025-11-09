import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { register } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { isValidPhoneNumber } from "libphonenumber-js";

interface LoginFormProps {
  onLogin: (phoneNumber: string, password: string) => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    }
    
    try {
      if (isValidPhoneNumber(phone)) {
        setPhoneError("");
        return true;
      } else {
        setPhoneError("Please enter a valid phone number with country code");
        return false;
      }
    } catch {
      setPhoneError("Please enter a valid phone number with country code (e.g., +1234567890)");
      return false;
    }
  };

  const allPasswordRequirementsMet = passwordRequirements.every(req => req.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "register") {
      if (!validatePhoneNumber(phoneNumber)) {
        return;
      }
      
      if (!allPasswordRequirementsMet) {
        toast({
          title: "Invalid Password",
          description: "Please meet all password requirements",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        await register(phoneNumber, password, name || undefined);
        toast({
          title: "Registration Successful",
          description: "Welcome! Logging you in...",
        });
        // The register function logs in automatically
        window.location.reload();
      } catch (error) {
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onLogin(phoneNumber, password);
    }
  };

  const handlePhoneBlur = () => {
    if (mode === "register" && phoneNumber) {
      validatePhoneNumber(phoneNumber);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">SecureDoc</CardTitle>
            <CardDescription className="mt-2">
              Access your financial documents securely
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone">Phone Number</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  New user?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-primary hover:underline font-medium"
                  >
                    Register here
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Phone Number Format:</strong> Include country code (e.g., +1 for US, +44 for UK, +91 for India)
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="register-name">Name (Optional)</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone Number *</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    onBlur={handlePhoneBlur}
                    className={`font-mono ${phoneError ? "border-red-500" : ""}`}
                    required
                  />
                  {phoneError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <X size={14} /> {phoneError}
                    </p>
                  )}
                  {!phoneError && phoneNumber && isValidPhoneNumber(phoneNumber) && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check size={14} /> Valid phone number
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="font-medium text-muted-foreground">Password Requirements:</p>
                      {passwordRequirements.map((req, idx) => {
                        const isMet = req.test(password);
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 ${
                              isMet ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {isMet ? <Check size={14} /> : <X size={14} />}
                            <span>{req.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || (mode === "register" && !allPasswordRequirementsMet)}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Login here
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

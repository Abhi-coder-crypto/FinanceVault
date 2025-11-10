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
import financeBackground from "@assets/stock_images/professional_finance_a69ae8fa.jpg";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Professional finance background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${financeBackground})` }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/92 to-blue-950/90" />
      
      <Card className="w-full max-w-[480px] relative z-10 shadow-2xl border-none backdrop-blur-md bg-card/98">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-4 ring-primary/5">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold tracking-tight">SecureDoc</CardTitle>
            <CardDescription className="text-base">
              Your financial documents, securely managed
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="login" data-testid="tab-login" className="text-sm font-medium">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register" className="text-sm font-medium">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="login-phone" data-testid="label-login-phone" className="text-sm font-semibold">Phone Number</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="font-mono h-11"
                    data-testid="input-login-phone"
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="login-password" data-testid="label-login-password" className="text-sm font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-login-password"
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 text-base font-semibold" data-testid="button-login-submit">
                  Sign In
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  New user?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-primary hover:underline font-medium"
                    data-testid="link-switch-to-register"
                  >
                    Register here
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Phone Number Format:</strong> Include country code (e.g., +1 for US, +44 for UK, +91 for India)
                  </AlertDescription>
                </Alert>

                <div className="space-y-2.5">
                  <Label htmlFor="register-name" data-testid="label-register-name" className="text-sm font-semibold">Name (Optional)</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-register-name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="register-phone" data-testid="label-register-phone" className="text-sm font-semibold">Phone Number *</Label>
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
                    className={`font-mono h-11 ${phoneError ? "border-red-500" : ""}`}
                    data-testid="input-register-phone"
                    required
                  />
                  {phoneError && (
                    <p className="text-sm text-red-500 flex items-center gap-1" data-testid="text-phone-error">
                      <X size={14} /> {phoneError}
                    </p>
                  )}
                  {!phoneError && phoneNumber && isValidPhoneNumber(phoneNumber) && (
                    <p className="text-sm text-green-600 flex items-center gap-1" data-testid="text-phone-valid">
                      <Check size={14} /> Valid phone number
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="register-password" data-testid="label-register-password" className="text-sm font-semibold">Password *</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-register-password"
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-register-password"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="mt-3 space-y-2 text-sm p-3 rounded-lg bg-muted/50" data-testid="password-requirements-list">
                      <p className="font-semibold text-foreground text-xs uppercase tracking-wide">Password Requirements:</p>
                      {passwordRequirements.map((req, idx) => {
                        const isMet = req.test(password);
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 ${
                              isMet ? "text-green-600" : "text-gray-500"
                            }`}
                            data-testid={`text-password-requirement-${idx}`}
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
                  className="w-full h-11 text-base font-semibold"
                  disabled={isSubmitting || (mode === "register" && !allPasswordRequirementsMet)}
                  data-testid="button-register-submit"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline font-medium"
                    data-testid="link-switch-to-login"
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

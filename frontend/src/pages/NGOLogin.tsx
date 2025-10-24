import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";

const NGOLogin = () => {
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    organizationName: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignupChange = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      // Store NGO session
      sessionStorage.setItem('ngoSession', JSON.stringify({
        isAuthenticated: true,
        organizationName: "Sample NGO",
        email: loginData.email,
        loginTime: new Date().toISOString()
      }));
      
      toast({
        title: "Login Successful",
        description: "Welcome to the NGO dashboard.",
      });
      window.location.href = "/ngo-dashboard";
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Store NGO session
      sessionStorage.setItem('ngoSession', JSON.stringify({
        isAuthenticated: true,
        organizationName: signupData.organizationName,
        email: signupData.email,
        loginTime: new Date().toISOString()
      }));
      
      toast({
        title: "Registration Successful",
        description: `Welcome to SolidusAid, ${signupData.organizationName}!`,
      });
      window.location.href = "/ngo-dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Building className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">NGO Login</h1>
          <p className="text-muted-foreground mt-2">
            Access your organization's aid distribution dashboard
          </p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="text-center">
            <CardTitle>NGO Portal</CardTitle>
            <CardDescription>
              Access your organization's aid distribution dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => handleLoginChange("email", e.target.value)}
                          placeholder="your@organization.org"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          value={loginData.password}
                          onChange={(e) => handleLoginChange("password", e.target.value)}
                          placeholder="Enter your password"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-border" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <a href="#" className="text-primary hover:text-primary-light">
                      Forgot password?
                    </a>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full group" 
                    disabled={isLoading || !loginData.email || !loginData.password}
                  >
                    {isLoading ? (
                      "Signing In..."
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="organization-name">Organization Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organization-name"
                          type="text"
                          value={signupData.organizationName}
                          onChange={(e) => handleSignupChange("organizationName", e.target.value)}
                          placeholder="Your NGO Name"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupData.email}
                          onChange={(e) => handleSignupChange("email", e.target.value)}
                          placeholder="admin@yourorganization.org"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          value={signupData.password}
                          onChange={(e) => handleSignupChange("password", e.target.value)}
                          placeholder="Create a strong password"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          value={signupData.confirmPassword}
                          onChange={(e) => handleSignupChange("confirmPassword", e.target.value)}
                          placeholder="Confirm your password"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full group" 
                    disabled={isLoading || !signupData.organizationName || !signupData.email || !signupData.password || !signupData.confirmPassword}
                  >
                    {isLoading ? (
                      "Creating Account..."
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                <Building className="h-4 w-4" />
                <span className="font-medium">Trusted by 89+ humanitarian organizations</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Join the transparent aid distribution network
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NGOLogin;
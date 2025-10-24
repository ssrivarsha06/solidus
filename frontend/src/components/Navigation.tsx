import { Button } from "@/components/ui/button";
import { Shield, Users, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">SolidusAid</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/">Home</Link>
            </Button>
            <Button
              variant={isActive("/register") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/register">Register</Link>
            </Button>
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/dashboard">
                <Users className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={isActive("/transparency") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/transparency">
                <Activity className="h-4 w-4 mr-1" />
                Transparency
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/ngo-login">NGO Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
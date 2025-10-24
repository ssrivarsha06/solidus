import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "accent" | "success";
}

const StatCard = ({ title, value, description, icon: Icon, variant = "default" }: StatCardProps) => {
  const getIconColor = () => {
    switch (variant) {
      case "accent": return "text-accent";
      case "success": return "text-success";
      default: return "text-primary";
    }
  };
  
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
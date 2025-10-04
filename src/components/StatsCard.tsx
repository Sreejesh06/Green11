import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "accent" | "secondary";
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatsCardProps) => {
  return (
    <div className="glass-card p-6 rounded-xl transition-all hover:scale-105 hover:shadow-2xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className={cn(
            "text-3xl font-bold mb-2",
            variant === "accent" && "text-gradient-accent",
            variant === "secondary" && "text-secondary",
            variant === "default" && "text-gradient"
          )}>
            {value}
          </h3>
          {trend && (
            <p className="text-xs text-primary font-medium">
              {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          variant === "accent" && "bg-accent/20",
          variant === "secondary" && "bg-secondary/20",
          variant === "default" && "bg-primary/20"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            variant === "accent" && "text-accent",
            variant === "secondary" && "text-secondary",
            variant === "default" && "text-primary"
          )} />
        </div>
      </div>
    </div>
  );
};

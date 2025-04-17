
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendValue?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {trend && (
              <p className="text-xs mt-1">
                <span
                  className={
                    trendUp ? "text-success" : "text-destructive"
                  }
                >
                  {trendUp ? "↑" : "↓"} {trendValue}
                </span>{" "}
                {trend}
              </p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

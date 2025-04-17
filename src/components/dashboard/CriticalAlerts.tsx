
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for critical alerts
const alerts = [
  {
    id: 1,
    type: "critical",
    message: "Patient John Doe (ID: P-2245) reported severe chest pain",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: 2,
    type: "warning",
    message: "Lab results for Sarah Miller (ID: P-1188) require urgent review",
    time: "25 minutes ago",
    unread: true,
  },
  {
    id: 3,
    type: "info",
    message: "Medication stock alert: Insulin supplies running low",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 4,
    type: "warning",
    message: "5 patients have appointments without assigned doctors",
    time: "2 hours ago",
    unread: false,
  },
];

export function CriticalAlerts() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Critical Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                alert.unread ? "bg-secondary/50" : "bg-card",
                alert.type === "critical"
                  ? "border-destructive/40"
                  : alert.type === "warning"
                  ? "border-amber-400/40"
                  : "border-primary/40"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full",
                  alert.type === "critical"
                    ? "bg-destructive/20 text-destructive"
                    : alert.type === "warning"
                    ? "bg-amber-400/20 text-amber-600"
                    : "bg-primary/20 text-primary"
                )}
              >
                {alert.type === "critical" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : alert.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm">{alert.message}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {alert.time}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-primary hover:underline">
            View All Alerts
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

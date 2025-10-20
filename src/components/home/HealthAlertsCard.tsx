import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Scissors, Stethoscope, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthAlert } from "@/hooks/useHomeData";

interface HealthAlertsCardProps {
  alerts: HealthAlert[];
  onClick: () => void;
}

export const HealthAlertsCard = ({ alerts, onClick }: HealthAlertsCardProps) => {
  if (alerts.length === 0) {
    return (
      <Card 
        className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Stethoscope className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">Health Status</h3>
            <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
          </div>
        </div>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'grooming':
        return Scissors;
      case 'checkup':
        return Stethoscope;
      case 'vaccination':
        return Syringe;
      default:
        return AlertCircle;
    }
  };

  const priorityColors = {
    high: 'text-red-600 dark:text-red-400 bg-red-500/10',
    medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10',
    low: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Health Alerts</h3>
          <Badge variant="destructive">{alerts.length}</Badge>
        </div>

        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg",
                  priorityColors[alert.priority]
                )}
              >
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs opacity-80">{alert.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {alerts.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{alerts.length - 3} more alerts
          </p>
        )}
      </div>
    </Card>
  );
};

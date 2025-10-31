import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UrgentAlertsBannerProps {
  alerts: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  onClick: () => void;
}

export function UrgentAlertsBanner({ alerts, onClick }: UrgentAlertsBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (alerts.length === 0 || dismissed) return null;

  const alert = alerts[0]; // Show first urgent alert

  return (
    <div className="relative overflow-hidden rounded-lg bg-destructive/10 border border-destructive/30 p-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
        <button 
          onClick={onClick}
          className="flex-1 text-left min-w-0"
        >
          <p className="text-sm font-medium text-foreground truncate">
            {alert.title} • {alert.description}
          </p>
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface UrgentAlertsBannerProps {
  alerts: Array<{
    type: string;
    title: string;
    description: string;
    eventId?: string;
    metadata?: any;
  }>;
  dogId: string;
}

export function UrgentAlertsBanner({ alerts, dogId }: UrgentAlertsBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (alerts.length === 0 || dismissed) return null;

  const alert = alerts[0]; // Show first urgent alert

  const handleAlertClick = () => {
    const eventId = alert.eventId;
    
    if (!eventId) {
      console.warn('Alert missing event ID:', alert);
      return;
    }
    
    // Build route based on event type
    const routeMap: Record<string, string> = {
      'activity': `/activity/${eventId}`,
      'meal': `/meal/${eventId}`,
      'vet_visit': `/vet-visit/${eventId}`,
      'grooming': `/grooming/${eventId}`,
      'vaccination': `/vaccination/${eventId}`,
      'checkup': `/checkup/${eventId}`,
      'weight': `/weight/${eventId}`,
      'treatment': `/treatment/${eventId}`,
      'injury': `/injury/${eventId}`,
    };
    
    const route = routeMap[alert.type];
    if (route) {
      navigate(route, { state: { dogId, from: '/' } });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-destructive/10 border border-destructive/30 p-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
        <button 
          onClick={handleAlertClick}
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

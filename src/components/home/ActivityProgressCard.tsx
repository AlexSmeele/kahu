import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin } from "lucide-react";

interface ActivityProgressCardProps {
  targetMinutes: number;
  completedMinutes: number;
  targetDistance: number;
  completedDistance: number;
  onLogActivity: () => void;
}

export const ActivityProgressCard = ({
  targetMinutes,
  completedMinutes,
  targetDistance,
  completedDistance,
  onLogActivity,
}: ActivityProgressCardProps) => {
  const minutesProgress = (completedMinutes / targetMinutes) * 100;
  const distanceProgress = targetDistance > 0 ? (completedDistance / targetDistance) * 100 : 0;

  return (
    <Card className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Today's Activity Goal</h3>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onLogActivity(); }}>
            Log Activity
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">
              {completedMinutes}/{targetMinutes} mins
            </span>
          </div>
          <Progress value={minutesProgress} className="h-2" />
        </div>

        {targetDistance > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium">
                {completedDistance.toFixed(1)}/{targetDistance} km
              </span>
            </div>
            <Progress value={distanceProgress} className="h-2" />
          </div>
        )}
      </div>
    </Card>
  );
};

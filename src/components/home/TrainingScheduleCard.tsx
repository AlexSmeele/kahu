import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

interface TrainingScheduleCardProps {
  trickName: string;
  totalSessions: number;
  difficulty: number;
  onPracticeNow: () => void;
  onClick: () => void;
}

export const TrainingScheduleCard = ({
  trickName,
  totalSessions,
  difficulty,
  onPracticeNow,
  onClick,
}: TrainingScheduleCardProps) => {
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1">Next Training Session</h3>
            <p className="text-sm text-muted-foreground">
              Practice "{trickName}"
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Sessions: </span>
            <span className="font-medium">{totalSessions}</span>
            <span className="text-muted-foreground ml-2">Level: </span>
            <span className="font-medium">{difficulty}/5</span>
          </div>
          <Button 
            size="sm" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onPracticeNow(); 
            }}
          >
            Practice Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

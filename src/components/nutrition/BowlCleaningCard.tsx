import { Droplet, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NutritionPlan } from "@/hooks/useNutrition";
import { formatDistanceToNow } from "date-fns";

interface BowlCleaningCardProps {
  nutritionPlan: NutritionPlan | null;
  onMarkFoodBowlCleaned: () => void;
  onMarkWaterBowlCleaned: () => void;
}

type BowlStatus = 'good' | 'warning' | 'overdue';

function getBowlStatus(hoursSince: number | null, type: 'food' | 'water'): BowlStatus {
  if (!hoursSince) return 'overdue';
  
  if (type === 'food') {
    if (hoursSince < 6) return 'good';
    if (hoursSince < 12) return 'warning';
    return 'overdue';
  } else {
    if (hoursSince < 24) return 'good';
    if (hoursSince < 48) return 'warning';
    return 'overdue';
  }
}

function getStatusIcon(status: BowlStatus) {
  switch (status) {
    case 'good':
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case 'overdue':
      return <AlertTriangle className="w-5 h-5 text-destructive" />;
  }
}

function getStatusColor(status: BowlStatus) {
  switch (status) {
    case 'good':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'overdue':
      return 'text-destructive';
  }
}

export function BowlCleaningCard({ 
  nutritionPlan, 
  onMarkFoodBowlCleaned, 
  onMarkWaterBowlCleaned 
}: BowlCleaningCardProps) {
  if (!nutritionPlan) return null;

  const now = new Date();
  
  const foodBowlLastCleaned = nutritionPlan.bowl_last_cleaned 
    ? new Date(nutritionPlan.bowl_last_cleaned) 
    : null;
  const foodBowlHoursSince = foodBowlLastCleaned
    ? (now.getTime() - foodBowlLastCleaned.getTime()) / (1000 * 60 * 60)
    : null;
  const foodBowlStatus = getBowlStatus(foodBowlHoursSince, 'food');

  const waterBowlLastCleaned = nutritionPlan.water_bowl_last_cleaned
    ? new Date(nutritionPlan.water_bowl_last_cleaned)
    : null;
  const waterBowlHoursSince = waterBowlLastCleaned
    ? (now.getTime() - waterBowlLastCleaned.getTime()) / (1000 * 60 * 60)
    : null;
  const waterBowlStatus = getBowlStatus(waterBowlHoursSince, 'water');

  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Bowl Hygiene</h3>
      </div>

      <div className="space-y-4">
        {/* Food Bowl */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(foodBowlStatus)}
              <span className="font-medium text-foreground">Food Bowl</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onMarkFoodBowlCleaned}
              className="h-8"
            >
              Mark Cleaned
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={getStatusColor(foodBowlStatus)}>
              {foodBowlLastCleaned 
                ? `Last cleaned ${formatDistanceToNow(foodBowlLastCleaned, { addSuffix: true })}`
                : 'Never cleaned - Mark now!'
              }
            </span>
          </div>
        </div>

        {/* Water Bowl */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(waterBowlStatus)}
              <span className="font-medium text-foreground">Water Bowl</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onMarkWaterBowlCleaned}
              className="h-8"
            >
              Mark Cleaned
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={getStatusColor(waterBowlStatus)}>
              {waterBowlLastCleaned
                ? `Last cleaned ${formatDistanceToNow(waterBowlLastCleaned, { addSuffix: true })}`
                : 'Never cleaned - Mark now!'
              }
            </span>
          </div>
        </div>

        {/* Tips */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 Clean food bowl after every meal • Water bowl daily
          </p>
        </div>
      </div>
    </div>
  );
}
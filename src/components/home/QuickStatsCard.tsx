import { Card } from "@/components/ui/card";
import { Weight, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QuickStatsCardProps {
  currentWeight?: number;
  weightTrend?: 'up' | 'down' | 'stable';
  masteredTricks: number;
  onClick: () => void;
}

export const QuickStatsCard = ({ 
  currentWeight, 
  weightTrend, 
  masteredTricks,
  onClick 
}: QuickStatsCardProps) => {
  const getTrendIcon = () => {
    switch (weightTrend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <h3 className="font-semibold text-base mb-3">Quick Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Weight className="h-4 w-4" />
            <span className="text-xs">Weight</span>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold">
              {currentWeight ? `${currentWeight}kg` : 'N/A'}
            </p>
            {weightTrend && getTrendIcon()}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-4 w-4" />
            <span className="text-xs">Tricks</span>
          </div>
          <p className="text-lg font-semibold">{masteredTricks}</p>
        </div>
      </div>
    </Card>
  );
};

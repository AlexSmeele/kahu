import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WeightDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weight: {
    id: string;
    weight: number;
    date: string;
    notes?: string | null;
  };
  previousWeight?: number;
}

export function WeightDetailModal({ open, onOpenChange, weight, previousWeight }: WeightDetailModalProps) {
  const weightChange = previousWeight ? weight.weight - previousWeight : 0;
  const percentageChange = previousWeight ? ((weightChange / previousWeight) * 100).toFixed(1) : 0;

  const getTrendIcon = () => {
    if (!previousWeight || weightChange === 0) return <Minus className="w-4 h-4" />;
    return weightChange > 0 
      ? <TrendingUp className="w-4 h-4 text-green-500" />
      : <TrendingDown className="w-4 h-4 text-orange-500" />;
  };

  const getTrendText = () => {
    if (!previousWeight || weightChange === 0) return 'No change';
    const direction = weightChange > 0 ? 'Gained' : 'Lost';
    return `${direction} ${Math.abs(weightChange).toFixed(1)} kg (${Math.abs(Number(percentageChange))}%)`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Weight Record
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-3xl">{weight.weight} kg</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(weight.date), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          {previousWeight && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon()}
                <span className="text-sm font-medium">Weight Trend</span>
              </div>
              <p className="text-sm text-muted-foreground">{getTrendText()}</p>
            </div>
          )}

          {weight.notes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium whitespace-pre-wrap">{weight.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

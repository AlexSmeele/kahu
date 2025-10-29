import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, Check, X } from "lucide-react";

interface MealDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: {
    id: string;
    meal_name: string;
    meal_time: string;
    scheduled_date: string;
    completed_at?: string;
    amount_given?: number;
    notes?: string;
  };
}

export function MealDetailModal({ open, onOpenChange, meal }: MealDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Meal Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{meal.meal_name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(meal.scheduled_date), 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Scheduled Time</span>
              </div>
              <p className="font-medium">{meal.meal_time}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {meal.completed_at ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground" />
                )}
                <span>Status</span>
              </div>
              <p className="font-medium">
                {meal.completed_at ? 'Fed' : 'Not Fed'}
              </p>
            </div>
          </div>

          {meal.completed_at && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed At</p>
              <p className="font-medium">
                {format(new Date(meal.completed_at), 'h:mm a')}
              </p>
            </div>
          )}

          {meal.amount_given && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Amount Given</p>
              <p className="font-medium">{meal.amount_given} cups</p>
            </div>
          )}

          {meal.notes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{meal.notes}</p>
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

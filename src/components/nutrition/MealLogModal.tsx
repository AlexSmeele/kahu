import { useState } from "react";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMealTracking } from "@/hooks/useMealTracking";

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId?: string;
  dogName?: string;
  nutritionPlanId?: string;
}

export function MealLogModal({ isOpen, onClose, dogId, dogName, nutritionPlanId }: MealLogModalProps) {
  const { toast } = useToast();
  const { markMealCompleted } = useMealTracking(dogId, nutritionPlanId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    mealName: "",
    mealTime: new Date().toTimeString().slice(0, 5), // Current time
    amountGiven: 0,
    bowlCleanedBefore: false,
    notes: "",
  });

  const handleSubmit = async () => {
    if (!formData.mealName || !formData.mealTime) {
      toast({
        title: "Missing information",
        description: "Please enter meal name and time",
        variant: "destructive",
      });
      return;
    }

    if (!dogId || !nutritionPlanId) {
      toast({
        title: "Error",
        description: "No nutrition plan found. Please create a plan first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await markMealCompleted(
        formData.mealTime,
        formData.mealName,
        formData.amountGiven || undefined
      );

      toast({
        title: "Meal logged!",
        description: `${formData.mealName} has been recorded.`,
      });

      // Reset form
      setFormData({
        mealName: "",
        mealTime: new Date().toTimeString().slice(0, 5),
        amountGiven: 0,
        bowlCleanedBefore: false,
        notes: "",
      });

      onClose();
    } catch (error) {
      console.error('Error logging meal:', error);
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            Quick Meal Log {dogName && `- ${dogName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="meal-name">Meal Name *</Label>
            <Input
              id="meal-name"
              value={formData.mealName}
              onChange={(e) => setFormData({ ...formData, mealName: e.target.value })}
              placeholder="e.g., Breakfast, Lunch, Dinner"
            />
          </div>

          <div>
            <Label htmlFor="meal-time">Time *</Label>
            <Input
              id="meal-time"
              type="time"
              value={formData.mealTime}
              onChange={(e) => setFormData({ ...formData, mealTime: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount Given (cups)</Label>
            <Input
              id="amount"
              type="number"
              step="0.25"
              min="0"
              value={formData.amountGiven || ""}
              onChange={(e) => setFormData({ ...formData, amountGiven: parseFloat(e.target.value) || 0 })}
              placeholder="Optional"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bowl-cleaned"
              checked={formData.bowlCleanedBefore}
              onCheckedChange={(checked) => setFormData({ ...formData, bowlCleanedBefore: checked as boolean })}
            />
            <Label htmlFor="bowl-cleaned" className="font-normal">
              Bowl cleaned before meal
            </Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any observations about the meal..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Logging..." : "Log Meal"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

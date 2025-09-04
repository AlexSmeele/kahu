import { useState } from "react";
import { Plus, Clock, Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NutritionPlan, MealTime, useNutrition } from "@/hooks/useNutrition";

interface NutritionPlanModalProps {
  dogId: string;
  nutritionPlan?: NutritionPlan | null;
  onSave?: (plan: NutritionPlan) => void;
  trigger?: React.ReactNode;
}

export function NutritionPlanModal({ dogId, nutritionPlan, onSave, trigger }: NutritionPlanModalProps) {
  const [open, setOpen] = useState(false);
  const { createNutritionPlan, updateNutritionPlan } = useNutrition(dogId);
  
  const [formData, setFormData] = useState({
    food_type: nutritionPlan?.food_type || '',
    brand: nutritionPlan?.brand || '',
    daily_amount: nutritionPlan?.daily_amount || 0,
    feeding_times: nutritionPlan?.feeding_times || 2,
    special_instructions: nutritionPlan?.special_instructions || '',
  });

  const [mealSchedule, setMealSchedule] = useState<MealTime[]>(
    nutritionPlan?.meal_schedule || [
      { time: '08:00', amount: 0, food_type: '', reminder_enabled: true },
      { time: '18:00', amount: 0, food_type: '', reminder_enabled: true },
    ]
  );

  const handleSave = async () => {
    const planData = {
      ...formData,
      dog_id: dogId,
      is_active: true,
      meal_schedule: mealSchedule,
    };

    let result;
    if (nutritionPlan?.id) {
      result = await updateNutritionPlan(nutritionPlan.id, planData);
    } else {
      result = await createNutritionPlan(planData);
    }

    if (result) {
      onSave?.(result);
      setOpen(false);
    }
  };

  const addMealTime = () => {
    setMealSchedule([
      ...mealSchedule,
      { time: '12:00', amount: 0, food_type: formData.food_type, reminder_enabled: true }
    ]);
    setFormData({ ...formData, feeding_times: mealSchedule.length + 1 });
  };

  const removeMealTime = (index: number) => {
    const newSchedule = mealSchedule.filter((_, i) => i !== index);
    setMealSchedule(newSchedule);
    setFormData({ ...formData, feeding_times: newSchedule.length });
  };

  const updateMealTime = (index: number, updates: Partial<MealTime>) => {
    const newSchedule = mealSchedule.map((meal, i) => 
      i === index ? { ...meal, ...updates } : meal
    );
    setMealSchedule(newSchedule);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {nutritionPlan ? 'Edit Diet' : 'Add Diet Plan'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {nutritionPlan ? 'Edit Nutrition Plan' : 'Create Nutrition Plan'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Diet Info */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="food_type">Food Type</Label>
              <Select 
                value={formData.food_type} 
                onValueChange={(value) => setFormData({ ...formData, food_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry_kibble">Dry Kibble</SelectItem>
                  <SelectItem value="wet_food">Wet Food</SelectItem>
                  <SelectItem value="raw_diet">Raw Diet</SelectItem>
                  <SelectItem value="home_cooked">Home Cooked</SelectItem>
                  <SelectItem value="mixed">Mixed Diet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Royal Canin, Hills Science"
              />
            </div>

            <div>
              <Label htmlFor="daily_amount">Daily Amount (cups/grams)</Label>
              <Input
                id="daily_amount"
                type="number"
                value={formData.daily_amount}
                onChange={(e) => setFormData({ ...formData, daily_amount: parseFloat(e.target.value) })}
                placeholder="Total daily amount"
              />
            </div>
          </div>

          {/* Meal Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Meal Schedule</Label>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={addMealTime}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Meal
              </Button>
            </div>

            <div className="space-y-2">
              {mealSchedule.map((meal, index) => (
                <div key={index} className="card-soft p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Meal {index + 1}</h4>
                    {mealSchedule.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMealTime(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Time</Label>
                      <Input
                        type="time"
                        value={meal.time}
                        onChange={(e) => updateMealTime(index, { time: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        value={meal.amount}
                        onChange={(e) => updateMealTime(index, { amount: parseFloat(e.target.value) })}
                        placeholder="Portion size"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-xs">Feeding Reminder</Label>
                    </div>
                    <Switch
                      checked={meal.reminder_enabled}
                      onCheckedChange={(checked) => updateMealTime(index, { reminder_enabled: checked })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="instructions">Special Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="Any special feeding instructions, supplements, or dietary notes..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {nutritionPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
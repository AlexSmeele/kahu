import { useState } from "react";
import { Plus, Clock, Bell, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { NutritionPlan, MealTime, useNutrition } from "@/hooks/useNutrition";

interface MealComponent {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: 'kibble' | 'wet' | 'raw' | 'treats' | 'supplements' | 'medication';
}

interface EnhancedMealTime extends Omit<MealTime, 'amount'> {
  components: MealComponent[];
}

interface NutritionPlanModalProps {
  dogId: string;
  nutritionPlan?: NutritionPlan | null;
  onSave?: (plan: NutritionPlan) => void;
  trigger?: React.ReactNode;
}

const MEAL_CATEGORIES = [
  { value: 'kibble', label: 'Kibble', color: 'bg-warning/10 text-warning' },
  { value: 'wet', label: 'Wet Food', color: 'bg-primary/10 text-primary' },
  { value: 'raw', label: 'Raw Food', color: 'bg-destructive/10 text-destructive' },
  { value: 'treats', label: 'Treats', color: 'bg-success/10 text-success' },
  { value: 'supplements', label: 'Supplements', color: 'bg-accent/10 text-accent' },
  { value: 'medication', label: 'Medication', color: 'bg-muted/10 text-muted-foreground' },
];

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

  // Enhanced meal schedule for complex meals
  const [mealSchedule, setMealSchedule] = useState<EnhancedMealTime[]>(() => {
    if (nutritionPlan?.meal_schedule) {
      // Convert existing simple meal schedule to enhanced format
      return nutritionPlan.meal_schedule.map((meal: MealTime) => ({
        time: meal.time,
        food_type: meal.food_type,
        reminder_enabled: meal.reminder_enabled,
        components: [
          {
            id: '1',
            name: meal.food_type || 'Kibble',
            amount: meal.amount,
            unit: 'cups',
            category: 'kibble' as const,
          }
        ]
      }));
    }
    
    return [
      { 
        time: '08:00', 
        food_type: '', 
        reminder_enabled: true,
        components: [
          { id: '1', name: 'Kibble', amount: 1.5, unit: 'scoops', category: 'kibble' },
          { id: '2', name: 'Wet Food Sachet', amount: 1, unit: 'pieces', category: 'wet' },
          { id: '3', name: 'Egg', amount: 1, unit: 'pieces', category: 'raw' },
          { id: '4', name: 'Blueberries', amount: 4, unit: 'pieces', category: 'treats' }
        ]
      },
      { 
        time: '18:00', 
        food_type: '', 
        reminder_enabled: true,
        components: [
          { id: '5', name: 'Kibble', amount: 1.5, unit: 'scoops', category: 'kibble' }
        ]
      },
    ];
  });

  const handleSave = async () => {
    // Convert enhanced meal schedule back to simple format for storage
    const simpleMealSchedule: MealTime[] = mealSchedule.map(meal => ({
      time: meal.time,
      amount: meal.components.reduce((total, comp) => total + comp.amount, 0),
      food_type: meal.components.length > 1 ? 'Mixed' : (meal.components[0]?.name || 'Mixed'),
      reminder_enabled: meal.reminder_enabled,
    }));

    const planData = {
      ...formData,
      dog_id: dogId,
      is_active: true,
      meal_schedule: simpleMealSchedule,
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
    const newMeal: EnhancedMealTime = {
      time: '12:00',
      food_type: formData.food_type,
      reminder_enabled: true,
      components: [
        { id: Date.now().toString(), name: 'Kibble', amount: 1, unit: 'cups', category: 'kibble' }
      ]
    };
    
    setMealSchedule([...mealSchedule, newMeal]);
    setFormData({ ...formData, feeding_times: mealSchedule.length + 1 });
  };

  const removeMealTime = (index: number) => {
    const newSchedule = mealSchedule.filter((_, i) => i !== index);
    setMealSchedule(newSchedule);
    setFormData({ ...formData, feeding_times: newSchedule.length });
  };

  const updateMealTime = (index: number, updates: Partial<EnhancedMealTime>) => {
    const newSchedule = mealSchedule.map((meal, i) => 
      i === index ? { ...meal, ...updates } : meal
    );
    setMealSchedule(newSchedule);
  };

  const addMealComponent = (mealIndex: number) => {
    const newComponent: MealComponent = {
      id: Date.now().toString(),
      name: 'New Item',
      amount: 0.5,
      unit: 'cups',
      category: 'kibble',
    };

    const updatedMeal = {
      ...mealSchedule[mealIndex],
      components: [...mealSchedule[mealIndex].components, newComponent]
    };

    updateMealTime(mealIndex, updatedMeal);
  };

  const removeMealComponent = (mealIndex: number, componentIndex: number) => {
    const updatedMeal = {
      ...mealSchedule[mealIndex],
      components: mealSchedule[mealIndex].components.filter((_, i) => i !== componentIndex)
    };

    updateMealTime(mealIndex, updatedMeal);
  };

  const updateMealComponent = (mealIndex: number, componentIndex: number, updates: Partial<MealComponent>) => {
    const updatedComponents = mealSchedule[mealIndex].components.map((comp, i) =>
      i === componentIndex ? { ...comp, ...updates } : comp
    );

    updateMealTime(mealIndex, { components: updatedComponents });
  };

  const getCategoryStyle = (category: string) => {
    const categoryInfo = MEAL_CATEGORIES.find(c => c.value === category);
    return categoryInfo?.color || 'bg-muted/10 text-muted-foreground';
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
      <DialogContent className="max-w-[min(95vw,1000px)] h-[min(90vh,700px)] max-h-[min(90vh,700px)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {nutritionPlan ? 'Edit Nutrition Plan' : 'Create Nutrition Plan'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-1">
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

            <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Meal Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Meal Schedule</Label>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={addMealTime}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meal
              </Button>
            </div>

            <div className="space-y-4">
              {mealSchedule.map((meal, index) => (
                <div key={index} className="card-soft p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Meal {index + 1}</h4>
                    {mealSchedule.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMealTime(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Time</Label>
                      <Input
                        type="time"
                        value={meal.time}
                        onChange={(e) => updateMealTime(index, { time: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm">Reminder</Label>
                      </div>
                      <Switch
                        checked={meal.reminder_enabled}
                        onCheckedChange={(checked) => updateMealTime(index, { reminder_enabled: checked })}
                      />
                    </div>
                  </div>

                  {/* Meal Components */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Food Items:</Label>
                    {meal.components.map((component, compIndex) => (
                      <div key={component.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-background rounded border">
                        <div className="col-span-4">
                          <Input
                            value={component.name}
                            onChange={(e) => updateMealComponent(index, compIndex, { name: e.target.value })}
                            placeholder="Food name"
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.25"
                            value={component.amount}
                            onChange={(e) => updateMealComponent(index, compIndex, { amount: parseFloat(e.target.value) || 0 })}
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Select
                            value={component.unit}
                            onValueChange={(value) => updateMealComponent(index, compIndex, { unit: value })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cups">cups</SelectItem>
                              <SelectItem value="scoops">scoops</SelectItem>
                              <SelectItem value="grams">grams</SelectItem>
                              <SelectItem value="pieces">pieces</SelectItem>
                              <SelectItem value="tbsp">tbsp</SelectItem>
                              <SelectItem value="tsp">tsp</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Select
                            value={component.category}
                            onValueChange={(value) => updateMealComponent(index, compIndex, { category: value as MealComponent['category'] })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEAL_CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMealComponent(index, compIndex)}
                            className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addMealComponent(index)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Food Item
                    </Button>
                  </div>

                  {/* Meal Summary */}
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {MEAL_CATEGORIES.map(category => {
                        const categoryItems = meal.components.filter(comp => comp.category === category.value);
                        const totalAmount = categoryItems.reduce((sum, item) => sum + item.amount, 0);
                        
                        if (totalAmount === 0) return null;
                        
                        return (
                          <Badge key={category.value} className={`${category.color} text-xs border`}>
                            {category.label}: {totalAmount.toFixed(1)}
                          </Badge>
                        );
                      })}
                    </div>
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
              placeholder="Include medication reminders, dietary restrictions, or feeding notes..."
              rows={3}
            />
          </div>

          </div>
        </ScrollArea>

        <div className="pt-4 border-t flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {nutritionPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
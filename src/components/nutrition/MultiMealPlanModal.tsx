import { useState } from "react";
import { Save, Plus, Clock, Calendar, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NutritionPlan, MealTime, useNutrition } from "@/hooks/useNutrition";
import { AddFoodModal } from "./AddFoodModal";

interface FoodItem {
  id: string;
  name: string;
  type: 'food' | 'supplement' | 'medication';
  supplier: string;
  amount: number;
  unit: string;
  notes?: string;
}

interface MealPlan {
  id: string;
  name: string;
  time: string;
  foodItems: FoodItem[];
  reminderEnabled: boolean;
  selectedDays: string[];
}

interface MultiMealPlanModalProps {
  dogId: string;
  nutritionPlan?: NutritionPlan | null;
  onSave?: (plan: NutritionPlan) => void;
  trigger?: React.ReactNode;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TEMPLATES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Evening Treat'];

export function MultiMealPlanModal({ dogId, nutritionPlan, onSave, trigger }: MultiMealPlanModalProps) {
  const [open, setOpen] = useState(false);
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingFoodType, setEditingFoodType] = useState<'food' | 'supplement' | 'medication'>('food');
  const { createNutritionPlan, updateNutritionPlan } = useNutrition(dogId);
  
  const [meals, setMeals] = useState<MealPlan[]>([
    {
      id: '1',
      name: 'Breakfast',
      time: '08:00',
      foodItems: [],
      reminderEnabled: true,
      selectedDays: DAYS,
    }
  ]);

  const addMeal = () => {
    const newMeal: MealPlan = {
      id: Date.now().toString(),
      name: 'Meal ' + (meals.length + 1),
      time: '12:00',
      foodItems: [],
      reminderEnabled: true,
      selectedDays: DAYS,
    };
    setMeals([...meals, newMeal]);
  };

  const removeMeal = (mealId: string) => {
    setMeals(meals.filter(meal => meal.id !== mealId));
  };

  const updateMeal = (mealId: string, updates: Partial<MealPlan>) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, ...updates } : meal
    ));
  };

  const duplicateMeal = (mealId: string) => {
    const mealToDuplicate = meals.find(meal => meal.id === mealId);
    if (mealToDuplicate) {
      const duplicatedMeal: MealPlan = {
        ...mealToDuplicate,
        id: Date.now().toString(),
        name: mealToDuplicate.name + ' (Copy)',
        time: mealToDuplicate.time,
      };
      setMeals([...meals, duplicatedMeal]);
    }
  };

  const handleAddFood = (mealId: string, type: 'food' | 'supplement' | 'medication') => {
    setEditingMealId(mealId);
    setEditingFoodType(type);
    setAddFoodOpen(true);
  };

  const handleFoodAdded = (foodItem: Omit<FoodItem, 'id'>) => {
    if (!editingMealId) return;
    
    const newItem: FoodItem = {
      ...foodItem,
      id: Date.now().toString(),
    };
    
    updateMeal(editingMealId, {
      foodItems: [...(meals.find(m => m.id === editingMealId)?.foodItems || []), newItem]
    });
    
    setAddFoodOpen(false);
    setEditingMealId(null);
  };

  const removeFoodItem = (mealId: string, foodItemId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (meal) {
      updateMeal(mealId, {
        foodItems: meal.foodItems.filter(item => item.id !== foodItemId)
      });
    }
  };

  const toggleDay = (mealId: string, day: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (meal) {
      const newSelectedDays = meal.selectedDays.includes(day)
        ? meal.selectedDays.filter(d => d !== day)
        : [...meal.selectedDays, day];
      updateMeal(mealId, { selectedDays: newSelectedDays });
    }
  };

  const handleSave = async () => {
    if (meals.length === 0 || meals.every(meal => meal.foodItems.length === 0)) return;

    const totalDailyAmount = meals.reduce((total, meal) => 
      total + meal.foodItems.reduce((mealTotal, item) => mealTotal + (item.amount || 0), 0), 0
    );

    const mealSchedule: MealTime[] = meals.map(meal => ({
      time: meal.time,
      amount: meal.foodItems.reduce((sum, item) => sum + (item.amount || 0), 0),
      food_type: meal.name,
      reminder_enabled: meal.reminderEnabled,
    }));

    const planData = {
      dog_id: dogId,
      food_type: 'mixed',
      brand: meals[0]?.foodItems.find(item => item.type === 'food')?.supplier || '',
      daily_amount: totalDailyAmount,
      feeding_times: meals.length,
      meal_schedule: mealSchedule,
      is_active: true,
      special_instructions: meals
        .flatMap(meal => meal.foodItems.filter(item => item.notes))
        .map(item => `${item.name}: ${item.notes}`)
        .join('; '),
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

  const getFoodItemsByType = (meal: MealPlan, type: 'food' | 'supplement' | 'medication') => {
    return meal.foodItems.filter(item => item.type === type);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Multi-Meal Plan
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-[min(95vw,700px)] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Daily Meal Plan ({meals.length} meal{meals.length !== 1 ? 's' : ''})
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-1 pb-4">
              {meals.map((meal, index) => (
                <div key={meal.id} className="border rounded-lg p-4 space-y-4">
                  {/* Meal Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        Meal {index + 1}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateMeal(meal.id)}
                          className="h-8 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {meals.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMeal(meal.id)}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meal Name & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Meal Name</Label>
                      <Select 
                        value={meal.name} 
                        onValueChange={(value) => updateMeal(meal.id, { name: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_TEMPLATES.map(template => (
                            <SelectItem key={template} value={template}>
                              {template}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other">Custom Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Time</Label>
                      <Input
                        type="time"
                        value={meal.time}
                        onChange={(e) => updateMeal(meal.id, { time: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Reminder Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={meal.reminderEnabled}
                      onCheckedChange={(checked) => updateMeal(meal.id, { reminderEnabled: checked })}
                    />
                    <Label className="text-sm">Enable meal reminders</Label>
                  </div>

                  {/* Days Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Active Days</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS.map(day => (
                        <Button
                          key={day}
                          variant={meal.selectedDays.includes(day) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDay(meal.id, day)}
                          className="text-xs"
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Food Items */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Food & Supplements</Label>
                    
                    {/* Display Food Items */}
                    {getFoodItemsByType(meal, 'food').length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Food</Label>
                        {getFoodItemsByType(meal, 'food').map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.supplier} • {item.amount} {item.unit}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFoodItem(meal.id, item.id)}
                              className="shrink-0 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Display Supplements */}
                    {getFoodItemsByType(meal, 'supplement').length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Supplements</Label>
                        {getFoodItemsByType(meal, 'supplement').map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.supplier} • {item.amount} {item.unit}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFoodItem(meal.id, item.id)}
                              className="shrink-0 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Display Medications */}
                    {getFoodItemsByType(meal, 'medication').length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Medication</Label>
                        {getFoodItemsByType(meal, 'medication').map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.supplier} • {item.amount} {item.unit}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFoodItem(meal.id, item.id)}
                              className="shrink-0 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Item Buttons */}
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFood(meal.id, 'food')}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Food
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFood(meal.id, 'supplement')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Supplements
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFood(meal.id, 'medication')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Medication
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Meal Button */}
              <Button
                variant="outline"
                onClick={addMeal}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Meal
              </Button>
            </div>
          </ScrollArea>

          <div className="pt-4 border-t flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={meals.length === 0 || meals.every(meal => meal.foodItems.length === 0)}
            >
              <Save className="w-4 h-4 mr-2" />
              {nutritionPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddFoodModal
        open={addFoodOpen}
        onOpenChange={setAddFoodOpen}
        type={editingFoodType}
        onSave={handleFoodAdded}
      />
    </>
  );
}
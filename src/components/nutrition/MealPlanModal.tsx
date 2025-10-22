import { useState } from "react";
import { Save, Plus, Clock, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

interface MealPlanModalProps {
  dogId: string;
  nutritionPlan?: NutritionPlan | null;
  onSave?: (plan: NutritionPlan) => void;
  trigger?: React.ReactNode;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function MealPlanModal({ dogId, nutritionPlan, onSave, trigger }: MealPlanModalProps) {
  const [open, setOpen] = useState(false);
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [editingFoodType, setEditingFoodType] = useState<'food' | 'supplement' | 'medication'>('food');
  const { createNutritionPlan, updateNutritionPlan } = useNutrition(dogId);
  
  const [mealTime, setMealTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
  const [mealName, setMealName] = useState('Breakfast');
  const [customMealName, setCustomMealName] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const handleAddFood = (type: 'food' | 'supplement' | 'medication') => {
    setEditingFoodType(type);
    setAddFoodOpen(true);
  };

  const handleFoodAdded = (foodItem: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...foodItem,
      id: Date.now().toString(),
    };
    setFoodItems(prev => [...prev, newItem]);
    setAddFoodOpen(false);
  };

  const removeFoodItem = (id: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (foodItems.length === 0) return;

    const totalAmount = foodItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const finalMealName = mealName === 'Other' ? customMealName : mealName;
    
    const mealSchedule: MealTime[] = [{
      time: mealTime,
      amount: totalAmount,
      food_type: foodItems.find(item => item.type === 'food')?.name || 'Mixed',
      reminder_enabled: reminderEnabled,
    }];

    const planData = {
      dog_id: dogId,
      food_type: 'mixed',
      brand: foodItems.find(item => item.type === 'food')?.supplier || '',
      daily_amount: totalAmount,
      feeding_times: 1,
      meal_schedule: mealSchedule,
      is_active: true,
      special_instructions: foodItems
        .filter(item => item.notes)
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
      // Reset form
      setFoodItems([]);
      setMealTime('08:00');
      setSelectedDays(DAYS);
      setMealName('Breakfast');
      setCustomMealName('');
    }
  };

  const getFoodItemsByType = (type: 'food' | 'supplement' | 'medication') => {
    return foodItems.filter(item => item.type === type);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Meal Plan
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-[min(95vw,480px)] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Meal 1
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-1 pb-4">
              {/* Meal Name Section */}
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-medium">Meal Name</Label>
                </div>
                <div className="space-y-2">
                  <Select value={mealName} onValueChange={setMealName}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {mealName === 'Other' && (
                    <Input
                      placeholder="Enter custom meal name"
                      value={customMealName}
                      onChange={(e) => setCustomMealName(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Time Section */}
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Meal Time
                  </Label>
                </div>

                <div>
                  <Label className="text-sm">Time</Label>
                  <Input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="reminders"
                    checked={reminderEnabled}
                    onCheckedChange={setReminderEnabled}
                  />
                  <Label htmlFor="reminders" className="text-sm">Enable meal reminders</Label>
                </div>
              </div>

              {/* Days Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Days
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS.map(day => (
                    <Button
                      key={day}
                      variant={selectedDays.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day)}
                      className="text-xs"
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedDays.length === 0 ? "0 days per week" : 
                   selectedDays.length === 1 ? "1 day per week" : 
                   `${selectedDays.length} days per week`}
                </p>
              </div>

              {/* Food Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Food & Supplements</Label>
                
                {/* Food Items */}
                {getFoodItemsByType('food').length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Food</Label>
                    <div className="space-y-2 mt-2">
                      {getFoodItemsByType('food').map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.supplier} • {item.amount} {item.unit}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFoodItem(item.id)}
                            className="shrink-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supplements */}
                {getFoodItemsByType('supplement').length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Supplements</Label>
                    <div className="space-y-2 mt-2">
                      {getFoodItemsByType('supplement').map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.supplier} • {item.amount} {item.unit}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFoodItem(item.id)}
                            className="shrink-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medication */}
                {getFoodItemsByType('medication').length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Medication</Label>
                    <div className="space-y-2 mt-2">
                      {getFoodItemsByType('medication').map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.supplier} • {item.amount} {item.unit}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFoodItem(item.id)}
                            className="shrink-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Buttons */}
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFood('food')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Food
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddFood('supplement')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Supplements
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddFood('medication')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Medication
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="pt-4 border-t flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={foodItems.length === 0}
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
import { useState } from "react";
import { Plus, Clock, Bell, Save, Trash2, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface MealPlanVariantAProps {
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function MealPlanVariantA({ dogId, nutritionPlan, onSave, trigger }: MealPlanVariantAProps) {
  const [open, setOpen] = useState(false);
  const { createNutritionPlan, updateNutritionPlan } = useNutrition(dogId);
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const [formData, setFormData] = useState({
    food_type: nutritionPlan?.food_type || '',
    brand: nutritionPlan?.brand || '',
    daily_amount: nutritionPlan?.daily_amount || 0,
    feeding_times: nutritionPlan?.feeding_times || 2,
    special_instructions: nutritionPlan?.special_instructions || '',
  });

  // Weekly meal schedule - one for each day
  const [weeklySchedule, setWeeklySchedule] = useState<{[key: string]: EnhancedMealTime[]}>(() => {
    const defaultMeal = () => [
      { 
        time: '08:00', 
        food_type: '', 
        reminder_enabled: true,
        components: [
          { id: '1', name: 'Morning Kibble', amount: 1.5, unit: 'cups', category: 'kibble' as const }
        ]
      },
      { 
        time: '18:00', 
        food_type: '', 
        reminder_enabled: true,
        components: [
          { id: '2', name: 'Evening Kibble', amount: 1.5, unit: 'cups', category: 'kibble' as const }
        ]
      }
    ];

    const schedule: {[key: string]: EnhancedMealTime[]} = {};
    DAYS.forEach(day => {
      schedule[day] = defaultMeal();
    });
    return schedule;
  });

  const handleSave = async () => {
    // Use the current day's schedule as the main meal schedule
    const currentDaySchedule = weeklySchedule[selectedDay] || [];
    const simpleMealSchedule: MealTime[] = currentDaySchedule.map(meal => ({
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

  const addMealTime = (day: string) => {
    const newMeal: EnhancedMealTime = {
      time: '12:00',
      food_type: formData.food_type,
      reminder_enabled: true,
      components: [
        { id: Date.now().toString(), name: 'Lunch', amount: 1, unit: 'cups', category: 'kibble' }
      ]
    };
    
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: [...prev[day], newMeal].sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  const copyDayToAll = (sourceDay: string) => {
    const sourceMeals = weeklySchedule[sourceDay];
    const newSchedule = { ...weeklySchedule };
    DAYS.forEach(day => {
      if (day !== sourceDay) {
        newSchedule[day] = JSON.parse(JSON.stringify(sourceMeals));
      }
    });
    setWeeklySchedule(newSchedule);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Split-Pane Editor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[min(95vw,1200px)] h-[min(90vh,700px)] max-h-[min(90vh,700px)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Daily Meal Editor - Split Pane</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Pane - Day Selector & Basic Info */}
          <div className="w-80 flex flex-col border-r border-border pr-4">
            {/* Day Selector */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Select Day</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyDayToAll(selectedDay)}
                className="w-full mt-2 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy to All Days
              </Button>
            </div>

            {/* Basic Diet Info */}
            <ScrollArea className="flex-1">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Food Type</Label>
                  <Select 
                    value={formData.food_type} 
                    onValueChange={(value) => setFormData({ ...formData, food_type: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry_kibble">Dry Kibble</SelectItem>
                      <SelectItem value="wet_food">Wet Food</SelectItem>
                      <SelectItem value="raw_diet">Raw Diet</SelectItem>
                      <SelectItem value="mixed">Mixed Diet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Brand</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., Royal Canin"
                    className="h-9"
                  />
                </div>

                <div>
                  <Label className="text-sm">Daily Amount</Label>
                  <Input
                    type="number"
                    value={formData.daily_amount}
                    onChange={(e) => setFormData({ ...formData, daily_amount: parseFloat(e.target.value) })}
                    placeholder="Total cups/day"
                    className="h-9"
                  />
                </div>

                <div>
                  <Label className="text-sm">Special Instructions</Label>
                  <Textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                    placeholder="Any special notes..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Pane - Daily Meal Schedule */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{selectedDay}'s Meals</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addMealTime(selectedDay)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meal
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {(weeklySchedule[selectedDay] || []).map((meal, mealIndex) => (
                  <div key={mealIndex} className="card-soft p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={meal.time}
                          onChange={(e) => {
                            const newSchedule = { ...weeklySchedule };
                            newSchedule[selectedDay][mealIndex].time = e.target.value;
                            setWeeklySchedule(newSchedule);
                          }}
                          className="w-28 h-9"
                        />
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <Switch
                            checked={meal.reminder_enabled}
                            onCheckedChange={(checked) => {
                              const newSchedule = { ...weeklySchedule };
                              newSchedule[selectedDay][mealIndex].reminder_enabled = checked;
                              setWeeklySchedule(newSchedule);
                            }}
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSchedule = { ...weeklySchedule };
                          newSchedule[selectedDay] = newSchedule[selectedDay].filter((_, i) => i !== mealIndex);
                          setWeeklySchedule(newSchedule);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Meal Components */}
                    <div className="space-y-2">
                      {meal.components.map((component, compIndex) => (
                        <div key={component.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-background rounded border">
                          <div className="col-span-4">
                            <Input
                              value={component.name}
                              onChange={(e) => {
                                const newSchedule = { ...weeklySchedule };
                                newSchedule[selectedDay][mealIndex].components[compIndex].name = e.target.value;
                                setWeeklySchedule(newSchedule);
                              }}
                              placeholder="Food name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.25"
                              value={component.amount}
                              onChange={(e) => {
                                const newSchedule = { ...weeklySchedule };
                                newSchedule[selectedDay][mealIndex].components[compIndex].amount = parseFloat(e.target.value) || 0;
                                setWeeklySchedule(newSchedule);
                              }}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Select
                              value={component.unit}
                              onValueChange={(value) => {
                                const newSchedule = { ...weeklySchedule };
                                newSchedule[selectedDay][mealIndex].components[compIndex].unit = value;
                                setWeeklySchedule(newSchedule);
                              }}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cups">cups</SelectItem>
                                <SelectItem value="scoops">scoops</SelectItem>
                                <SelectItem value="grams">grams</SelectItem>
                                <SelectItem value="pieces">pieces</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <Select
                              value={component.category}
                              onValueChange={(value) => {
                                const newSchedule = { ...weeklySchedule };
                                newSchedule[selectedDay][mealIndex].components[compIndex].category = value as MealComponent['category'];
                                setWeeklySchedule(newSchedule);
                              }}
                            >
                              <SelectTrigger className="h-8 text-sm">
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
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newSchedule = { ...weeklySchedule };
                                newSchedule[selectedDay][mealIndex].components = 
                                  newSchedule[selectedDay][mealIndex].components.filter((_, i) => i !== compIndex);
                                setWeeklySchedule(newSchedule);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newComponent: MealComponent = {
                            id: Date.now().toString(),
                            name: 'New Item',
                            amount: 0.5,
                            unit: 'cups',
                            category: 'kibble',
                          };
                          const newSchedule = { ...weeklySchedule };
                          newSchedule[selectedDay][mealIndex].components.push(newComponent);
                          setWeeklySchedule(newSchedule);
                        }}
                        className="w-full text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Food Item
                      </Button>
                    </div>

                    {/* Meal Summary */}
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex flex-wrap gap-1">
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
            </ScrollArea>
          </div>
        </div>

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
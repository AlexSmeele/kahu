import { useState } from "react";
import { Calendar, Save, Copy, Plus, X, Edit3 } from "lucide-react";
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
import { format, addDays, startOfWeek } from "date-fns";

interface MealComponent {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: 'kibble' | 'wet' | 'raw' | 'treats' | 'supplements' | 'medication';
}

interface DayMeal {
  time: string;
  components: MealComponent[];
  reminder_enabled: boolean;
}

interface WeekPlan {
  [key: string]: DayMeal[];
}

interface MealPlanVariantCProps {
  dogId: string;
  nutritionPlan?: NutritionPlan | null;
  onSave?: (plan: NutritionPlan) => void;
  trigger?: React.ReactNode;
}

const MEAL_CATEGORIES = [
  { value: 'kibble', label: 'K', color: 'bg-warning text-warning-foreground', fullLabel: 'Kibble' },
  { value: 'wet', label: 'W', color: 'bg-primary text-primary-foreground', fullLabel: 'Wet Food' },
  { value: 'raw', label: 'R', color: 'bg-destructive text-destructive-foreground', fullLabel: 'Raw Food' },
  { value: 'treats', label: 'T', color: 'bg-success text-success-foreground', fullLabel: 'Treats' },
  { value: 'supplements', label: 'S', color: 'bg-accent text-accent-foreground', fullLabel: 'Supplements' },
  { value: 'medication', label: 'M', color: 'bg-muted text-muted-foreground', fullLabel: 'Medication' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MealPlanVariantC({ dogId, nutritionPlan, onSave, trigger }: MealPlanVariantCProps) {
  const [open, setOpen] = useState(false);
  const { createNutritionPlan, updateNutritionPlan } = useNutrition(dogId);
  
  const [formData, setFormData] = useState({
    food_type: nutritionPlan?.food_type || '',
    brand: nutritionPlan?.brand || '',
    daily_amount: nutritionPlan?.daily_amount || 0,
    feeding_times: nutritionPlan?.feeding_times || 2,
    special_instructions: nutritionPlan?.special_instructions || '',
  });

  // Weekly grid state
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(() => {
    const defaultMeals = (): DayMeal[] => [
      {
        time: '08:00',
        reminder_enabled: true,
        components: [
          { id: '1', name: 'Kibble', amount: 1.5, unit: 'cups', category: 'kibble' }
        ]
      },
      {
        time: '18:00',
        reminder_enabled: true,
        components: [
          { id: '2', name: 'Kibble', amount: 1.5, unit: 'cups', category: 'kibble' }
        ]
      }
    ];

    const plan: WeekPlan = {};
    DAYS.forEach(day => {
      plan[day] = defaultMeals();
    });
    return plan;
  });

  const [editingCell, setEditingCell] = useState<{day: string, mealIndex: number} | null>(null);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const handleSave = async () => {
    // Use Monday's schedule as the template
    const mondaySchedule = weekPlan['Monday'] || [];
    const simpleMealSchedule: MealTime[] = mondaySchedule.map(meal => ({
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

  const copyDayToAll = (sourceDay: string) => {
    const sourceMeals = weekPlan[sourceDay];
    const newPlan = { ...weekPlan };
    DAYS.forEach(day => {
      if (day !== sourceDay) {
        newPlan[day] = JSON.parse(JSON.stringify(sourceMeals));
      }
    });
    setWeekPlan(newPlan);
  };

  const addMealToDay = (day: string) => {
    const newMeal: DayMeal = {
      time: '12:00',
      reminder_enabled: true,
      components: [
        { id: Date.now().toString(), name: 'Lunch', amount: 1, unit: 'cups', category: 'kibble' }
      ]
    };

    setWeekPlan(prev => ({
      ...prev,
      [day]: [...prev[day], newMeal].sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  const removeMeal = (day: string, mealIndex: number) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: prev[day].filter((_, index) => index !== mealIndex)
    }));
  };

  const getMealSummary = (meal: DayMeal) => {
    const totalsByCategory: {[key: string]: number} = {};
    meal.components.forEach(comp => {
      totalsByCategory[comp.category] = (totalsByCategory[comp.category] || 0) + comp.amount;
    });

    return Object.entries(totalsByCategory).map(([category, total]) => {
      const categoryInfo = MEAL_CATEGORIES.find(c => c.value === category);
      return {
        category,
        total: total.toFixed(1),
        label: categoryInfo?.label || category[0].toUpperCase(),
        color: categoryInfo?.color || 'bg-muted text-muted-foreground'
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-1" />
            Weekly Grid
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[min(95vw,1000px)] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Weekly Meal Grid Planner</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Plan meals for the week of {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-1">
            {/* Basic Diet Info */}
            <div className="mb-6 grid grid-cols-4 gap-4 p-4 border rounded-lg">
              <div>
                <Label className="text-sm">Food Type</Label>
                <Select 
                  value={formData.food_type} 
                  onValueChange={(value) => setFormData({ ...formData, food_type: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
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
                  placeholder="Brand name"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-sm">Daily Amount</Label>
                <Input
                  type="number"
                  value={formData.daily_amount}
                  onChange={(e) => setFormData({ ...formData, daily_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Cups/day"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-sm">Special Instructions</Label>
                <Input
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  placeholder="Notes..."
                  className="h-9"
                />
              </div>
            </div>

            {/* Weekly Grid */}
            <div className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-8 bg-muted">
                <div className="p-3 font-medium">Meal Time</div>
                {DAYS.map((day, index) => (
                  <div key={day} className="p-3 text-center border-l">
                    <div className="font-medium">{DAY_ABBR[index]}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(addDays(weekStart, index), 'dd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal Rows */}
              {[0, 1, 2].map(mealIndex => {
                const hasAnyMeal = DAYS.some(day => weekPlan[day]?.[mealIndex]);
                if (!hasAnyMeal && mealIndex > 1) return null;

                return (
                  <div key={mealIndex} className="grid grid-cols-8 border-t">
                    {/* Time Column */}
                    <div className="p-3 bg-muted/50 font-medium">
                      {weekPlan[DAYS[0]]?.[mealIndex]?.time || 
                       (mealIndex === 0 ? '08:00' : mealIndex === 1 ? '18:00' : '12:00')}
                    </div>

                    {/* Day Columns */}
                    {DAYS.map(day => {
                      const meal = weekPlan[day]?.[mealIndex];
                      
                      return (
                        <div key={day} className="border-l min-h-[100px] relative group">
                          {meal ? (
                            <div className="p-2 h-full">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">{meal.time}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingCell({ day, mealIndex })}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyDayToAll(day)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMeal(day, mealIndex)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {getMealSummary(meal).map(item => (
                                  <Badge
                                    key={item.category}
                                    className={`${item.color} text-xs px-1 py-0 h-5`}
                                  >
                                    {item.label}{item.total}
                                  </Badge>
                                ))}
                              </div>
                              
                              {meal.reminder_enabled && (
                                <div className="text-xs text-muted-foreground mt-1">Reminder</div>
                              )}
                            </div>
                          ) : (
                            <div className="p-2 h-full flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addMealToDay(day)}
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Add Meal Row */}
              <div className="grid grid-cols-8 border-t bg-muted/30">
                <div className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      DAYS.forEach(day => addMealToDay(day));
                    }}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Meal
                  </Button>
                </div>
                {DAYS.map(day => (
                  <div key={day} className="border-l p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addMealToDay(day)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 p-4 border rounded-lg">
              <Label className="text-sm font-medium mb-2 block">Food Categories</Label>
              <div className="flex flex-wrap gap-2">
                {MEAL_CATEGORIES.map(cat => (
                  <Badge key={cat.value} className={`${cat.color} text-xs`}>
                    {cat.label} = {cat.fullLabel}
                  </Badge>
                ))}
              </div>
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

      {/* Edit Cell Dialog */}
      {editingCell && (
        <Dialog open={!!editingCell} onOpenChange={() => setEditingCell(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Meal - {editingCell.day.charAt(0).toUpperCase() + editingCell.day.slice(1)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-meal-time">Meal Time</Label>
                <Input
                  id="edit-meal-time"
                  type="time"
                  value={weekPlan[editingCell.day][editingCell.mealIndex]?.time || '12:00'}
                  onChange={(e) => {
                    setWeekPlan(prev => ({
                      ...prev,
                      [editingCell.day]: prev[editingCell.day].map((m, idx) =>
                        idx === editingCell.mealIndex ? { ...m, time: e.target.value } : m
                      )
                    }));
                  }}
                />
              </div>

              <div>
                <Label>Food Items</Label>
                <div className="space-y-2 mt-2">
                  {weekPlan[editingCell.day][editingCell.mealIndex]?.components.map((comp, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 p-2 border rounded">
                      <Input
                        value={comp.name}
                        onChange={(e) => {
                          setWeekPlan(prev => {
                            const newPlan = { ...prev };
                            newPlan[editingCell.day][editingCell.mealIndex].components[idx].name = e.target.value;
                            return newPlan;
                          });
                        }}
                        placeholder="Food name"
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        step="0.25"
                        value={comp.amount}
                        onChange={(e) => {
                          setWeekPlan(prev => {
                            const newPlan = { ...prev };
                            newPlan[editingCell.day][editingCell.mealIndex].components[idx].amount = parseFloat(e.target.value) || 0;
                            return newPlan;
                          });
                        }}
                        className="text-sm"
                      />
                      <Select
                        value={comp.category}
                        onValueChange={(value: 'kibble' | 'wet' | 'raw' | 'treats' | 'supplements' | 'medication') => {
                          setWeekPlan(prev => {
                            const newPlan = { ...prev };
                            newPlan[editingCell.day][editingCell.mealIndex].components[idx].category = value;
                            return newPlan;
                          });
                        }}
                      >
                        <SelectTrigger className="text-sm">
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
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWeekPlan(prev => {
                    const newPlan = { ...prev };
                    newPlan[editingCell.day][editingCell.mealIndex].components.push({
                      id: Date.now().toString(),
                      name: '',
                      amount: 0,
                      unit: 'cups',
                      category: 'kibble' as const
                    });
                    return newPlan;
                  });
                }}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Food Item
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingCell(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setEditingCell(null)} className="flex-1">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
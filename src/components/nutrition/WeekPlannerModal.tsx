import { useState } from "react";
import { Calendar, Save, Copy, RotateCcw, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, startOfWeek } from "date-fns";

interface MealItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: 'kibble' | 'wet' | 'raw' | 'treats' | 'supplements' | 'medication';
}

interface DayMeal {
  time: string;
  items: MealItem[];
  notes?: string;
}

interface WeekPlan {
  [key: string]: DayMeal[]; // key is day name like 'monday', 'tuesday', etc.
}

interface WeekPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogName: string;
  currentPlan?: any;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MEAL_CATEGORIES = [
  { value: 'kibble', label: 'Kibble', color: 'bg-warning/10 text-warning' },
  { value: 'wet', label: 'Wet Food', color: 'bg-primary/10 text-primary' },
  { value: 'raw', label: 'Raw Food', color: 'bg-destructive/10 text-destructive' },
  { value: 'treats', label: 'Treats', color: 'bg-success/10 text-success' },
  { value: 'supplements', label: 'Supplements', color: 'bg-accent/10 text-accent' },
  { value: 'medication', label: 'Medication', color: 'bg-muted/10 text-muted-foreground' },
];

export function WeekPlannerModal({ isOpen, onClose, dogName, currentPlan }: WeekPlannerModalProps) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(() => {
    // Initialize with default meal times
    const defaultPlan: WeekPlan = {};
    DAYS.forEach(day => {
      defaultPlan[day] = [
        {
          time: '08:00',
          items: [
            {
              id: '1',
              name: 'Kibble',
              amount: 1.5,
              unit: 'cups',
              category: 'kibble',
            }
          ]
        },
        {
          time: '18:00',
          items: [
            {
              id: '2', 
              name: 'Kibble',
              amount: 1.5,
              unit: 'cups',
              category: 'kibble',
            }
          ]
        }
      ];
    });
    return defaultPlan;
  });

  const [selectedDay, setSelectedDay] = useState('monday');
  const [copyFromDay, setCopyFromDay] = useState('');
  const [newMealTime, setNewMealTime] = useState('12:00');

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday

  const addMealToDay = (day: string) => {
    const newMeal: DayMeal = {
      time: newMealTime,
      items: [],
    };

    setWeekPlan(prev => ({
      ...prev,
      [day]: [...prev[day], newMeal].sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  const addItemToMeal = (day: string, mealIndex: number) => {
    const newItem: MealItem = {
      id: Date.now().toString(),
      name: 'New Item',
      amount: 1,
      unit: 'cups',
      category: 'kibble',
    };

    setWeekPlan(prev => ({
      ...prev,
      [day]: prev[day].map((meal, index) =>
        index === mealIndex ? { ...meal, items: [...meal.items, newItem] } : meal
      )
    }));
  };

  const updateMealItem = (day: string, mealIndex: number, itemIndex: number, updates: Partial<MealItem>) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: prev[day].map((meal, mIndex) =>
        mIndex === mealIndex ? {
          ...meal,
          items: meal.items.map((item, iIndex) =>
            iIndex === itemIndex ? { ...item, ...updates } : item
          )
        } : meal
      )
    }));
  };

  const removeMealItem = (day: string, mealIndex: number, itemIndex: number) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: prev[day].map((meal, mIndex) =>
        mIndex === mealIndex ? {
          ...meal,
          items: meal.items.filter((_, iIndex) => iIndex !== itemIndex)
        } : meal
      )
    }));
  };

  const removeMeal = (day: string, mealIndex: number) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: prev[day].filter((_, index) => index !== mealIndex)
    }));
  };

  const copyDayPlan = (fromDay: string, toDay: string) => {
    if (!fromDay || fromDay === toDay) return;

    setWeekPlan(prev => ({
      ...prev,
      [toDay]: JSON.parse(JSON.stringify(prev[fromDay]))
    }));
  };

  const getCategoryStyle = (category: string) => {
    const categoryInfo = MEAL_CATEGORIES.find(c => c.value === category);
    return categoryInfo?.color || 'bg-muted/10 text-muted-foreground';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[min(95vw,1000px)] max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Meal Planner - {dogName}
          </DialogTitle>

          <div className="text-sm text-muted-foreground">
            Week of {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
          </div>
        </DialogHeader>

        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-7">
            {DAYS.map((day, index) => (
              <TabsTrigger key={day} value={day} className="text-xs">
                <div className="text-center">
                  <div>{DAY_LABELS[index]}</div>
                  <div className="text-xs opacity-60">
                    {format(addDays(weekStart, index), 'dd')}
                  </div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {DAYS.map(day => (
              <TabsContent key={day} value={day} className="mt-0">
                <div className="space-y-4">
                  {/* Day Controls */}
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <h3 className="font-medium">
                      {day.charAt(0).toUpperCase() + day.slice(1)} - {format(addDays(weekStart, DAYS.indexOf(day)), 'MMM dd')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Select value={copyFromDay} onValueChange={setCopyFromDay}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Copy from..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.filter(d => d !== day).map(d => (
                            <SelectItem key={d} value={d}>
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {copyFromDay && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            copyDayPlan(copyFromDay, day);
                            setCopyFromDay('');
                          }}
                          className="h-8 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Meals for the day */}
                  <div className="space-y-3">
                    {weekPlan[day]?.map((meal, mealIndex) => (
                      <div key={mealIndex} className="card-soft p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Label className="font-medium">Meal Time:</Label>
                            <Input
                              type="time"
                              value={meal.time}
                              onChange={(e) => {
                                setWeekPlan(prev => ({
                                  ...prev,
                                  [day]: prev[day].map((m, index) =>
                                    index === mealIndex ? { ...m, time: e.target.value } : m
                                  )
                                }));
                              }}
                              className="w-24 h-8"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMeal(day, mealIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Meal Items */}
                        <div className="space-y-2 mb-3">
                          {meal.items.map((item, itemIndex) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-background rounded border">
                              <div className="col-span-4">
                                <Input
                                  value={item.name}
                                  onChange={(e) => updateMealItem(day, mealIndex, itemIndex, { name: e.target.value })}
                                  placeholder="Food name"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  step="0.25"
                                  value={item.amount}
                                  onChange={(e) => updateMealItem(day, mealIndex, itemIndex, { amount: parseFloat(e.target.value) })}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="col-span-2">
                                <Select
                                  value={item.unit}
                                  onValueChange={(value) => updateMealItem(day, mealIndex, itemIndex, { unit: value })}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cups">cups</SelectItem>
                                    <SelectItem value="grams">grams</SelectItem>
                                    <SelectItem value="pieces">pieces</SelectItem>
                                    <SelectItem value="tbsp">tbsp</SelectItem>
                                    <SelectItem value="tsp">tsp</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-3">
                                <Select
                                  value={item.category}
                                  onValueChange={(value) => updateMealItem(day, mealIndex, itemIndex, { category: value as MealItem['category'] })}
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
                                  onClick={() => removeMealItem(day, mealIndex, itemIndex)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addItemToMeal(day, mealIndex)}
                          className="w-full text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Food Item
                        </Button>
                      </div>
                    ))}

                    {/* Add Meal Button */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={newMealTime}
                        onChange={(e) => setNewMealTime(e.target.value)}
                        className="w-24 h-8"
                      />
                      <Button
                        variant="outline"
                        onClick={() => addMealToDay(day)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Meal
                      </Button>
                    </div>
                  </div>

                  {/* Day Summary */}
                  <div className="card-soft p-3 bg-primary/5">
                    <h4 className="font-medium mb-2 text-sm">Daily Summary</h4>
                    <div className="flex flex-wrap gap-1">
                      {MEAL_CATEGORIES.map(category => {
                        const dayItems = weekPlan[day]?.flatMap(meal => meal.items) || [];
                        const categoryItems = dayItems.filter(item => item.category === category.value);
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
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>

        <div className="pt-4 border-t flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Weekly Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
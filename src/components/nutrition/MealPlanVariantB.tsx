import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface MealPlanVariantBProps {
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

const STEPS = [
  { id: 1, title: "Basic Diet Info", description: "Food type, brand, and daily amounts" },
  { id: 2, title: "Meal Schedule", description: "Set up feeding times and portions" },
  { id: 3, title: "Review & Save", description: "Confirm your nutrition plan" },
];

export function MealPlanVariantB({ dogId, nutritionPlan, onSave, trigger }: MealPlanVariantBProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { createNutritionPlan, updateNutritionPlan } = useNutrition(dogId);
  
  const [formData, setFormData] = useState({
    food_type: nutritionPlan?.food_type || '',
    brand: nutritionPlan?.brand || '',
    daily_amount: nutritionPlan?.daily_amount || 0,
    feeding_times: nutritionPlan?.feeding_times || 2,
    special_instructions: nutritionPlan?.special_instructions || '',
  });

  const [mealSchedule, setMealSchedule] = useState<EnhancedMealTime[]>(() => [
    { 
      time: '08:00', 
      food_type: '', 
      reminder_enabled: true,
      components: [
        { id: '1', name: 'Morning Kibble', amount: 1.5, unit: 'cups', category: 'kibble' }
      ]
    },
    { 
      time: '18:00', 
      food_type: '', 
      reminder_enabled: true,
      components: [
        { id: '2', name: 'Evening Kibble', amount: 1.5, unit: 'cups', category: 'kibble' }
      ]
    }
  ]);

  const handleSave = async () => {
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
      setCurrentStep(1);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.food_type && formData.daily_amount > 0;
    }
    if (currentStep === 2) {
      return mealSchedule.length > 0;
    }
    return true;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Let's start with the basics</h3>
        <p className="text-muted-foreground">Tell us about your dog's primary diet</p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div>
          <Label htmlFor="food_type">What type of food does your dog eat?</Label>
          <Select 
            value={formData.food_type} 
            onValueChange={(value) => setFormData({ ...formData, food_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select primary food type" />
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
            placeholder="e.g., Royal Canin, Hills Science Diet"
          />
        </div>

        <div>
          <Label htmlFor="daily_amount">Total daily amount (cups or grams)</Label>
          <Input
            id="daily_amount"
            type="number"
            step="0.25"
            value={formData.daily_amount}
            onChange={(e) => setFormData({ ...formData, daily_amount: parseFloat(e.target.value) || 0 })}
            placeholder="How much food per day?"
          />
        </div>

        <div>
          <Label htmlFor="instructions">Special dietary needs? (Optional)</Label>
          <Textarea
            id="instructions"
            value={formData.special_instructions}
            onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
            placeholder="Food allergies, medication with meals, etc."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Set up meal times</h3>
        <p className="text-muted-foreground">When and what does your dog eat each day?</p>
      </div>

      <div className="space-y-4">
        {mealSchedule.map((meal, mealIndex) => (
          <div key={mealIndex} className="card-soft p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Meal {mealIndex + 1}</h4>
              {mealSchedule.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMealSchedule(prev => prev.filter((_, i) => i !== mealIndex));
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Meal Time</Label>
                <Input
                  type="time"
                  value={meal.time}
                  onChange={(e) => {
                    const newSchedule = [...mealSchedule];
                    newSchedule[mealIndex].time = e.target.value;
                    setMealSchedule(newSchedule);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={meal.reminder_enabled}
                  onCheckedChange={(checked) => {
                    const newSchedule = [...mealSchedule];
                    newSchedule[mealIndex].reminder_enabled = checked;
                    setMealSchedule(newSchedule);
                  }}
                />
                <Label className="text-sm">Set reminder</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Food items for this meal:</Label>
              {meal.components.map((component, compIndex) => (
                <div key={component.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-background rounded border">
                  <div className="col-span-4">
                    <Input
                      value={component.name}
                      onChange={(e) => {
                        const newSchedule = [...mealSchedule];
                        newSchedule[mealIndex].components[compIndex].name = e.target.value;
                        setMealSchedule(newSchedule);
                      }}
                      placeholder="Food name"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.25"
                      value={component.amount}
                      onChange={(e) => {
                        const newSchedule = [...mealSchedule];
                        newSchedule[mealIndex].components[compIndex].amount = parseFloat(e.target.value) || 0;
                        setMealSchedule(newSchedule);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={component.unit}
                      onValueChange={(value) => {
                        const newSchedule = [...mealSchedule];
                        newSchedule[mealIndex].components[compIndex].unit = value;
                        setMealSchedule(newSchedule);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
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
                        const newSchedule = [...mealSchedule];
                        newSchedule[mealIndex].components[compIndex].category = value as MealComponent['category'];
                        setMealSchedule(newSchedule);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
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
                        const newSchedule = [...mealSchedule];
                        newSchedule[mealIndex].components = 
                          newSchedule[mealIndex].components.filter((_, i) => i !== compIndex);
                        setMealSchedule(newSchedule);
                      }}
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive"
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
                    name: 'Food Item',
                    amount: 0.5,
                    unit: 'cups',
                    category: 'kibble',
                  };
                  const newSchedule = [...mealSchedule];
                  newSchedule[mealIndex].components.push(newComponent);
                  setMealSchedule(newSchedule);
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Food Item
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={() => {
            const newMeal: EnhancedMealTime = {
              time: '12:00',
              food_type: '',
              reminder_enabled: true,
              components: [
                { id: Date.now().toString(), name: 'Lunch', amount: 1, unit: 'cups', category: 'kibble' }
              ]
            };
            setMealSchedule(prev => [...prev, newMeal]);
          }}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Another Meal
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review your nutrition plan</h3>
        <p className="text-muted-foreground">Everything looks good? Let's save it!</p>
      </div>

      <div className="space-y-4">
        {/* Diet Summary */}
        <div className="card-soft p-4">
          <h4 className="font-medium mb-3">Diet Overview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Food Type:</span>
              <div className="font-medium">{formData.food_type.replace('_', ' ')}</div>
            </div>
            {formData.brand && (
              <div>
                <span className="text-muted-foreground">Brand:</span>
                <div className="font-medium">{formData.brand}</div>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Daily Amount:</span>
              <div className="font-medium">{formData.daily_amount} cups/day</div>
            </div>
            <div>
              <span className="text-muted-foreground">Meals per Day:</span>
              <div className="font-medium">{mealSchedule.length} meals</div>
            </div>
          </div>
        </div>

        {/* Meal Schedule Summary */}
        <div className="card-soft p-4">
          <h4 className="font-medium mb-3">Daily Schedule</h4>
          <div className="space-y-3">
            {mealSchedule.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{meal.time}</span>
                  <div className="flex flex-wrap gap-1">
                    {MEAL_CATEGORIES.map(category => {
                      const categoryItems = meal.components.filter(comp => comp.category === category.value);
                      const totalAmount = categoryItems.reduce((sum, item) => sum + item.amount, 0);
                      
                      if (totalAmount === 0) return null;
                      
                      return (
                        <Badge key={category.value} className={`${category.color} text-xs`}>
                          {category.label}: {totalAmount.toFixed(1)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                {meal.reminder_enabled && (
                  <Badge variant="outline" className="text-xs">
                    Reminder On
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {formData.special_instructions && (
          <div className="card-soft p-4">
            <h4 className="font-medium mb-2">Special Instructions</h4>
            <p className="text-sm text-muted-foreground">{formData.special_instructions}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ArrowRight className="w-4 h-4 mr-1" />
            3-Step Wizard
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[calc(100vh-4rem)] max-h-[700px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nutrition Plan Setup - Step {currentStep} of 3</DialogTitle>
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-1">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t flex gap-2">
          <Button 
            variant="outline" 
            onClick={currentStep === 1 ? () => setOpen(false) : prevStep}
            className="flex-1"
          >
            {currentStep === 1 ? 'Cancel' : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </>
            )}
          </Button>
          <Button 
            onClick={currentStep === 3 ? handleSave : nextStep}
            disabled={!canProceed()}
            className="flex-1"
          >
            {currentStep === 3 ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {nutritionPlan ? 'Update Plan' : 'Create Plan'}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiMealPlanModal } from "@/components/nutrition/MultiMealPlanModal";
import { MealPlanModal } from "@/components/nutrition/MealPlanModal";
import { WeekPlannerModal } from "@/components/nutrition/WeekPlannerModal";
import { NutritionTipsCard } from "@/components/nutrition/NutritionTipsCard";
import { useNutrition } from "@/hooks/useNutrition";
import { useDogs } from "@/hooks/useDogs";

interface MealPlanningProps {
  selectedDogId: string;
}

export default function MealPlanning({ selectedDogId }: MealPlanningProps) {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId);
  const { nutritionPlan } = useNutrition(selectedDogId);

  if (!currentDog) {
    return (
      <div className="flex flex-col h-full safe-top items-center justify-center">
        <p className="text-muted-foreground">Please select a dog</p>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<string>("multi");
  const [isWeekPlannerOpen, setIsWeekPlannerOpen] = useState(false);

  return (
    <div className="flex flex-col h-full safe-top">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Meal Planning</h1>
            <p className="text-sm text-muted-foreground">{currentDog?.name || 'Your Dog'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Planning Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="multi">Multi-Meal</TabsTrigger>
              <TabsTrigger value="single">Single Meal</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="multi" className="space-y-4 mt-6">
              <div className="card-soft p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Multi-Meal Plan</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create a daily schedule with 2-4 meals per day. Perfect for puppies or dogs with specific feeding requirements.
                </p>
                <MultiMealPlanModal
                  dogId={currentDog?.id || ''}
                  nutritionPlan={nutritionPlan}
                  onSave={(plan) => {
                    console.log('Plan saved:', plan);
                  }}
                  trigger={
                    <Button className="w-full" size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      {nutritionPlan ? 'Edit Multi-Meal Plan' : 'Create Multi-Meal Plan'}
                    </Button>
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="single" className="space-y-4 mt-6">
              <div className="card-soft p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Single Meal Plan</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Set up a simple, one-meal-per-day feeding schedule. Ideal for adult dogs with regular routines.
                </p>
                <MealPlanModal
                  dogId={currentDog?.id || ''}
                  nutritionPlan={nutritionPlan}
                  onSave={(plan) => {
                    console.log('Plan saved:', plan);
                  }}
                  trigger={
                    <Button className="w-full" size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      {nutritionPlan ? 'Edit Single Meal Plan' : 'Create Single Meal Plan'}
                    </Button>
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4 mt-6">
              <div className="card-soft p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Weekly Planner</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Plan different meals for each day of the week. Great for variety and special dietary rotations.
                </p>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setIsWeekPlannerOpen(true)}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Open Weekly Planner
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Current Plan Summary */}
          {nutritionPlan && (
            <div className="card-soft p-4">
              <h3 className="font-semibold mb-3">Current Plan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Food Type:</span>
                  <span className="font-medium">
                    {nutritionPlan.food_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Amount:</span>
                  <span className="font-medium">{nutritionPlan.daily_amount} cups</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meals per Day:</span>
                  <span className="font-medium">{nutritionPlan.feeding_times}</span>
                </div>
                {nutritionPlan.brand && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-medium">{nutritionPlan.brand}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nutrition Tips */}
          <NutritionTipsCard />
        </div>
      </div>

      {/* Week Planner Modal */}
      <WeekPlannerModal
        isOpen={isWeekPlannerOpen}
        onClose={() => setIsWeekPlannerOpen(false)}
        dogName={currentDog?.name || 'Your Dog'}
        currentPlan={nutritionPlan}
      />
    </div>
  );
}

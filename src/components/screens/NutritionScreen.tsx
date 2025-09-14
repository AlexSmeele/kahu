import { useState, useEffect } from "react";
import { Apple, Calendar, TrendingUp, Clock, Edit2, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs, calculateAge } from "@/hooks/useDogs";
import { DogSwitcher } from "@/components/dogs/DogSwitcher";
import { useNutrition, MealTime } from "@/hooks/useNutrition";
import { useMealTracking, TodayMeal } from "@/hooks/useMealTracking";
import { MealPlanModal } from "@/components/nutrition/MealPlanModal";
import { WeekPlannerModal } from "@/components/nutrition/WeekPlannerModal";


// This function is now handled by useMealTracking hook

interface NutritionScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function NutritionScreen({ selectedDogId, onDogChange }: NutritionScreenProps) {
  const [isWeekPlannerOpen, setIsWeekPlannerOpen] = useState(false);
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const { nutritionPlan, loading } = useNutrition(selectedDogId);
  
  const { 
    mealRecords, 
    markMealCompleted, 
    undoMealCompletion,
    getTodayProgress,
    generateTodayMeals,
    loading: mealLoading 
  } = useMealTracking(selectedDogId, nutritionPlan?.id);

  const mealSchedule = nutritionPlan?.meal_schedule || [];
  const todayMeals = generateTodayMeals(mealSchedule, mealRecords);
  const todayProgress = getTodayProgress(mealSchedule, mealRecords, nutritionPlan?.daily_amount);
  
  const handleMarkMealFed = async (meal: TodayMeal) => {
    if (meal.completed && meal.meal_record) {
      await undoMealCompletion(meal.meal_record.id);
    } else {
      const originalMeal = mealSchedule.find((m: any) => 
        new Date(`2000-01-01T${m.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) === meal.time
      );
      if (originalMeal) {
        await markMealCompleted(originalMeal.time, meal.name, meal.amount);
      }
    }
  };
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="safe-top p-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-warning to-warning/80 rounded-full flex items-center justify-center">
              <Apple className="w-6 h-6 text-warning-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Nutrition</h1>
              <p className="text-sm text-muted-foreground">Meal planning & tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => setIsWeekPlannerOpen(true)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Plan Week
            </Button>
          </div>
        </div>
        
        {/* Dog Switcher */}
        <DogSwitcher
          selectedDogId={selectedDogId}
          onDogChange={onDogChange}
        />
      </header>

      {/* Current Diet Plan - Today's Progress */}
      {!nutritionPlan ? (
        <div className="p-4 bg-gradient-to-r from-warning/5 to-warning/10 border-b border-border">
          <div className="text-center">
            <Apple className="w-12 h-12 text-warning mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">No Diet Plan Set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a nutrition plan to track {currentDog?.name || 'your dog'}'s meals and feeding schedule.
            </p>
            <MealPlanModal 
              dogId={selectedDogId} 
              trigger={
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Meal Plan
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gradient-to-r from-warning/5 to-warning/10 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Today's Progress</h3>
            <Badge variant="outline" className="text-warning border-warning/30">
              {todayProgress.percentage}% complete
            </Badge>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Daily Amount</span>
              <span>{nutritionPlan.daily_amount} cups</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-warning to-warning/80 h-3 rounded-full transition-all duration-300"
                style={{ width: `${todayProgress.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {nutritionPlan.feeding_times} meals per day
            </div>
            <MealPlanModal 
              dogId={selectedDogId} 
              nutritionPlan={nutritionPlan}
              trigger={
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              }
            />
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {nutritionPlan ? (
            <>
              {/* Diet Details - Now scrollable with meals */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Diet Details</h3>
                <div className="card-soft p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Food Type:</span>
                      <p className="font-medium">{nutritionPlan.food_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    {nutritionPlan.brand && (
                      <div>
                        <span className="text-muted-foreground">Brand:</span>
                        <p className="font-medium">{nutritionPlan.brand}</p>
                      </div>
                    )}
                  </div>
                  {nutritionPlan.special_instructions && (
                    <div className="mt-3">
                      <span className="text-muted-foreground text-sm">Special Instructions:</span>
                      <p className="text-sm mt-1">{nutritionPlan.special_instructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Meals */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Today's Meals</h3>
                <MealPlanModal 
                  dogId={selectedDogId} 
                  nutritionPlan={nutritionPlan}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit Schedule
                    </Button>
                  }
                />
              </div>
              
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <div key={meal.id} className="card-soft p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${meal.completed ? 'bg-success' : 'bg-muted'}`} />
                        <div>
                          <h4 className="font-medium text-foreground">{meal.name}</h4>
                          <p className="text-sm text-muted-foreground">{meal.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                      {meal.reminder_enabled && (
                        <Bell className="w-4 h-4 text-primary" />
                      )}
                      <Button 
                        size="sm" 
                        variant={meal.completed ? "outline" : "default"}
                        className={meal.completed ? "" : "btn-primary"}
                        onClick={() => handleMarkMealFed(meal)}
                        disabled={mealLoading}
                      >
                        {meal.completed ? "Mark Unfed" : "Mark Fed"}
                      </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {meal.amount} cups
                      </div>
                      <div>
                        {nutritionPlan.food_type?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diet Tips */}
              <div className="mt-6 card-soft p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Nutrition Tips
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Monitor weight changes weekly</li>
                  <li>• Consistent feeding times help with digestion</li>
                  <li>• Fresh water should always be available</li>
                  <li>• Watch for food allergies or sensitivities</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Apple className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Set up a diet plan to start tracking meals</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <WeekPlannerModal 
        isOpen={isWeekPlannerOpen}
        onClose={() => setIsWeekPlannerOpen(false)}
        dogName={currentDog?.name || 'Your Dog'}
      />
    </div>
  );
}
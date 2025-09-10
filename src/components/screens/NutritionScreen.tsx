import { useState, useEffect } from "react";
import { Apple, Calendar, TrendingUp, Clock, Edit2, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs, calculateAge } from "@/hooks/useDogs";
import { DogSwitcher } from "@/components/dogs/DogSwitcher";
import { useNutrition, MealTime } from "@/hooks/useNutrition";
import { NutritionPlanModal } from "@/components/nutrition/NutritionPlanModal";
import { WeekPlannerModal } from "@/components/nutrition/WeekPlannerModal";
import { NotificationsDrawer } from "@/components/notifications/NotificationsDrawer";

// Mock data for today's feeding progress
const getTodayProgress = (mealSchedule?: MealTime[], dailyAmount?: number) => {
  if (!mealSchedule || !dailyAmount) {
    return { consumed: 0, target: 480, percentage: 0 };
  }
  
  const target = Math.round(dailyAmount * 30); // Rough calorie estimation
  const consumed = Math.round(target * 0.6); // Simulate 60% completion
  
  return {
    consumed,
    target,
    percentage: Math.round((consumed / target) * 100)
  };
};

interface NutritionScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function NutritionScreen({ selectedDogId, onDogChange }: NutritionScreenProps) {
  const [isWeekPlannerOpen, setIsWeekPlannerOpen] = useState(false);
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const { nutritionPlan, loading } = useNutrition(selectedDogId);

  const todayProgress = getTodayProgress(nutritionPlan?.meal_schedule, nutritionPlan?.daily_amount);
  
  const mealSchedule = nutritionPlan?.meal_schedule || [];
  
  // Format meal times for display
  const todayMeals = mealSchedule.map((meal: MealTime, index: number) => ({
    id: index,
    time: new Date(`2000-01-01T${meal.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    name: `${nutritionPlan?.food_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Meal'} ${index + 1}`,
    amount: meal.amount,
    reminder_enabled: meal.reminder_enabled,
    completed: Math.random() > 0.5, // Mock completion status
  }));
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
            <NotificationsDrawer />
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

      {/* Current Diet Plan */}
      {!nutritionPlan ? (
        <div className="p-4 bg-gradient-to-r from-warning/5 to-warning/10 border-b border-border">
          <div className="text-center">
            <Apple className="w-12 h-12 text-warning mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">No Diet Plan Set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a nutrition plan to track {currentDog?.name || 'your dog'}'s meals and feeding schedule.
            </p>
            <NutritionPlanModal 
              dogId={selectedDogId} 
              trigger={
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Diet Plan
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <>
          {/* Today's Progress */}
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
              <NutritionPlanModal 
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

          {/* Diet Details */}
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground mb-3">Diet Details</h3>
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
        </>
      )}

      {/* Today's Meals */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {nutritionPlan ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Today's Meals</h3>
                <NutritionPlanModal 
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
                        {!meal.completed && (
                          <Button size="sm" className="btn-primary">
                            Mark Fed
                          </Button>
                        )}
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

      {/* Week Planner Modal */}
      <WeekPlannerModal
        isOpen={isWeekPlannerOpen}
        onClose={() => setIsWeekPlannerOpen(false)}
        dogName={currentDog?.name || 'Your dog'}
        currentPlan={nutritionPlan}
      />
    </div>
  );
}
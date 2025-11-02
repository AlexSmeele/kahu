import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Apple, Calendar, TrendingUp, Clock, Edit2, Plus, Bell, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs, calculateAge } from "@/hooks/useDogs";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { useNutrition, MealTime } from "@/hooks/useNutrition";
import { useMealTracking, TodayMeal } from "@/hooks/useMealTracking";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";
import { MealPlanModal } from "@/components/nutrition/MealPlanModal";
import { MultiMealPlanModal } from "@/components/nutrition/MultiMealPlanModal";
import { MealPlanVariantSelector } from "@/components/nutrition/MealPlanVariantSelector";
import { WeekPlannerModal } from "@/components/nutrition/WeekPlannerModal";
import { BowlCleaningCard } from "@/components/nutrition/BowlCleaningCard";
import { TreatTrackerCard } from "@/components/nutrition/TreatTrackerCard";
import { FoodInventoryDrawer } from "@/components/nutrition/FoodInventoryDrawer";
import { CalorieCalculatorModal } from "@/components/nutrition/CalorieCalculatorModal";
import { CalorieProgressCard } from "@/components/nutrition/CalorieProgressCard";
import { MacronutrientCard } from "@/components/nutrition/MacronutrientCard";
import { Card } from "@/components/ui/card";


// This function is now handled by useMealTracking hook

export default function NutritionScreen() {
  const { dogId } = useParams<{ dogId: string }>();
  const navigate = useNavigate();
  const [isWeekPlannerOpen, setIsWeekPlannerOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const { dogs } = useDogs();
  const selectedDogId = dogId || dogs[0]?.id || '';
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  
  const handleDogChange = (newDogId: string) => {
    navigate(`/nutrition/${newDogId}`);
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  const { 
    nutritionPlan, 
    loading,
    updateNutritionPlan,
    markFoodBowlCleaned, 
    markWaterBowlCleaned 
  } = useNutrition(selectedDogId);
  
  const { 
    mealRecords, 
    markMealCompleted, 
    undoMealCompletion,
    getTodayProgress,
    generateTodayMeals,
    ensureTodayMealRecords,
    loading: mealLoading 
  } = useMealTracking(selectedDogId, nutritionPlan?.id);

  const mealSchedule = nutritionPlan?.meal_schedule || [];
  const todayMeals = generateTodayMeals(mealSchedule, mealRecords);
  const todayProgress = getTodayProgress(mealSchedule, mealRecords, nutritionPlan?.daily_amount);

  // Automatically create meal records for today when nutrition plan loads
  useEffect(() => {
    if (nutritionPlan?.meal_schedule && selectedDogId && nutritionPlan?.id) {
      ensureTodayMealRecords(nutritionPlan.meal_schedule);
    }
  }, [nutritionPlan?.id, nutritionPlan?.meal_schedule, selectedDogId]);
  
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

  const handleCalculateCalories = async (calories: number, macros: { protein: number; fat: number; fiber: number; carbs: number }) => {
    if (nutritionPlan?.id) {
      await updateNutritionPlan(nutritionPlan.id, {
        calorie_target_daily: calories,
        protein_percentage: macros.protein,
        fat_percentage: macros.fat,
        fiber_percentage: macros.fiber,
        carbs_percentage: macros.carbs,
      });
    }
  };
  return (
    <div className="flex flex-col h-full safe-top relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackClick}
        className="absolute top-4 left-4 z-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="pt-16">
        <DogDropdown selectedDogId={selectedDogId} onDogChange={handleDogChange} />
        <PageLogo />
      </div>

      {/* Current Diet Plan - Today's Progress */}
      {!nutritionPlan ? (
        <div className="p-4 bg-gradient-to-r from-warning/5 to-warning/10 border-b border-border">
          <div className="text-center">
            <Apple className="w-12 h-12 text-warning mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">No Diet Plan Set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a nutrition plan to track {currentDog?.name || 'your dog'}'s meals and feeding schedule.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Choose Your Meal Planning Style</h4>
                <MealPlanVariantSelector
                  dogId={currentDog?.id || ''}
                  nutritionPlan={nutritionPlan}
                  onSave={(plan) => {
                    console.log('Nutrition plan saved:', plan);
                  }}
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Nutrition Plan
                    </Button>
                  }
                />
              </div>
            </div>
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

              {/* Bowl Cleaning Card */}
              <BowlCleaningCard 
                nutritionPlan={nutritionPlan}
                onMarkFoodBowlCleaned={markFoodBowlCleaned}
                onMarkWaterBowlCleaned={markWaterBowlCleaned}
              />

              {/* Calorie & Macro Tracking */}
              <div className="mt-6 space-y-4">
                <CalorieProgressCard
                  dogId={selectedDogId}
                  nutritionPlanId={nutritionPlan.id}
                  dailyCalorieTarget={nutritionPlan.calorie_target_daily}
                  onOpenCalculator={() => setIsCalcModalOpen(true)}
                />

                <MacronutrientCard
                  protein={nutritionPlan.protein_percentage}
                  fat={nutritionPlan.fat_percentage}
                  fiber={nutritionPlan.fiber_percentage}
                  carbs={nutritionPlan.carbs_percentage}
                />
              </div>

              {/* Treat Tracker Card */}
              <div className="mt-6">
                <TreatTrackerCard 
                  dogId={selectedDogId}
                  nutritionPlanId={nutritionPlan.id}
                  dailyCalorieTarget={nutritionPlan.calorie_target_daily || undefined}
                />
              </div>

              {/* Food Inventory Card */}
              <Card className="mt-6 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Food Inventory</h3>
                  </div>
                  <Button onClick={() => setIsInventoryOpen(true)} variant="outline" size="sm">
                    Manage Inventory
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track food quantities, expiration dates, and get alerts when running low.
                </p>
              </Card>

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

      <FoodInventoryDrawer
        open={isInventoryOpen}
        onOpenChange={setIsInventoryOpen}
        dogId={selectedDogId}
      />

      <CalorieCalculatorModal
        open={isCalcModalOpen}
        onOpenChange={setIsCalcModalOpen}
        dogWeight={currentDog?.weight}
        onCalculate={handleCalculateCalories}
      />
    </div>
  );
}
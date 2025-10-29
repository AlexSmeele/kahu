import { useState } from "react";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { Heart, TrendingUp, Calendar, AlertCircle, Plus, Award, Scale, Syringe, Scissors, Stethoscope, Apple, Clock, Edit2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs } from "@/hooks/useDogs";
import { useHealthData } from "@/hooks/useHealthData";
import { WeightTracker } from "@/components/health/WeightTracker";
import { VaccineScheduleModal } from "@/components/health/VaccineScheduleModal";
import { VetVisitsModal } from "@/components/health/VetVisitsModal";
import { HealthNotesModal } from "@/components/health/HealthNotesModal";
import { ActivityMonitor } from "@/components/health/ActivityMonitor";
import { GroomingScheduleModal } from "@/components/health/GroomingScheduleModal";
import { HealthCheckupModal } from "@/components/health/HealthCheckupModal";
import { PreventiveCareCard } from "@/components/health/PreventiveCareCard";
import { HealthQuickActions } from "@/components/health/HealthQuickActions";
import { useNutrition } from "@/hooks/useNutrition";
import { useMealTracking, TodayMeal } from "@/hooks/useMealTracking";
import { MealPlanModal } from "@/components/nutrition/MealPlanModal";
import { MultiMealPlanModal } from "@/components/nutrition/MultiMealPlanModal";
import { WeekPlannerModal } from "@/components/nutrition/WeekPlannerModal";



const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'TrendingUp':
      return TrendingUp;
    case 'Calendar':
      return Calendar;
    case 'AlertCircle':
      return AlertCircle;
    case 'Heart':
      return Heart;
    case 'Award':
      return Award;
    default:
      return AlertCircle;
  }
};

interface HealthScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function HealthScreen({ selectedDogId, onDogChange }: HealthScreenProps) {
  const [isWeightTrackerOpen, setIsWeightTrackerOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isVetVisitsModalOpen, setIsVetVisitsModalOpen] = useState(false);
  const [isHealthNotesModalOpen, setIsHealthNotesModalOpen] = useState(false);
  const [isGroomingModalOpen, setIsGroomingModalOpen] = useState(false);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [isWeekPlannerOpen, setIsWeekPlannerOpen] = useState(false);
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const { weightData, recentRecords, healthRecordsCount, vaccinationData, vetVisitData, groomingData, checkupData, loading, refetch } = useHealthData(selectedDogId);
  
  // Nutrition hooks
  const { nutritionPlan, loading: nutritionLoading } = useNutrition(selectedDogId);
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

  const handleRecordClick = (record: any) => {
    switch (record.type) {
      case 'weight':
        setIsWeightTrackerOpen(true);
        break;
      case 'health':
        setIsHealthNotesModalOpen(true);
        break;
      case 'training':
        // Could open a training modal in the future
        break;
      default:
        break;
    }
  };
  return (
    <div className="flex flex-col h-full safe-top relative">
      <div className="pt-16">
        <DogDropdown selectedDogId={selectedDogId} onDogChange={onDogChange} />
        <PageLogo />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Quick Actions at the top */}
          <HealthQuickActions
            onGroomingClick={() => setIsGroomingModalOpen(true)}
            onCheckupClick={() => setIsCheckupModalOpen(true)}
            onWeightClick={() => setIsWeightTrackerOpen(true)}
            onAddRecordClick={() => setIsHealthNotesModalOpen(true)}
          />

          {/* Activity Monitor - removed title */}
          <div className="mb-6">
            <ActivityMonitor dogId={selectedDogId} />
          </div>

          {/* Nutrition Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Nutrition</h3>
            
            {!nutritionPlan ? (
              <div className="card-soft p-4 text-center">
                <Apple className="w-12 h-12 text-warning mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">No Diet Plan Set</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a nutrition plan to track {currentDog?.name || 'your dog'}'s meals.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <MultiMealPlanModal
                    dogId={currentDog?.id || ''}
                    nutritionPlan={nutritionPlan}
                    onSave={(plan) => {
                      console.log('Nutrition plan saved:', plan);
                    }}
                    trigger={
                      <Button className="w-full h-20 flex flex-col gap-2">
                        <Plus className="w-6 h-6" />
                        <span className="text-sm">Multi-Meal Plan</span>
                      </Button>
                    }
                  />
                  
                  <MealPlanModal
                    dogId={currentDog?.id || ''}
                    nutritionPlan={nutritionPlan}
                    onSave={(plan) => {
                      console.log('Nutrition plan saved:', plan);
                    }}
                    trigger={
                      <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                        <Plus className="w-6 h-6" />
                        <span className="text-sm">Single Meal</span>
                      </Button>
                    }
                  />

                  <Button
                    onClick={() => setIsWeekPlannerOpen(true)}
                    className="w-full h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm">Plan Week</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Today's Progress */}
                <div className="card-soft p-4 mb-4 bg-gradient-to-r from-warning/5 to-warning/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">Today's Progress</h4>
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

                {/* Diet Details */}
                <div className="card-soft p-4 mb-4">
                  <h4 className="font-semibold text-foreground mb-3">Diet Details</h4>
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

                {/* Today's Meals */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Today's Meals</h4>
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
                
                <div className="space-y-3 mb-4">
                  {todayMeals.map((meal) => (
                    <div key={meal.id} className="card-soft p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${meal.completed ? 'bg-success' : 'bg-muted'}`} />
                          <div>
                            <h5 className="font-medium text-foreground">{meal.name}</h5>
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

                {/* Nutrition Tips */}
                <div className="card-soft p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 w-5 text-primary" />
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
            )}
          </div>

          {/* Preventive Care Dashboard */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Preventive Care</h3>
            <div className="grid grid-cols-2 gap-3">
              <PreventiveCareCard
                icon={TrendingUp}
                title="Weight"
                status={weightData?.current ? `${weightData.current} kg` : "No data"}
                statusColor={weightData?.change && weightData.change !== 0 ? (weightData.change > 0 ? "warning" : "success") : "default"}
                description={weightData?.lastUpdated || "Track your dog's weight"}
                onClick={() => setIsWeightTrackerOpen(true)}
              />
              <PreventiveCareCard
                icon={Syringe}
                title="Vaccinations"
                status={vaccinationData?.dueCount ? `${vaccinationData.dueCount} due` : "Up to date"}
                statusColor={vaccinationData?.dueCount ? "error" : "success"}
                description={vaccinationData?.upcoming || "View schedule"}
                onClick={() => setIsVaccineModalOpen(true)}
              />
              <PreventiveCareCard
                icon={Scissors}
                title="Grooming"
                status={groomingData?.overdue ? `${groomingData.overdue} overdue` : (groomingData?.nextDue || "No schedule")}
                statusColor={groomingData?.overdue ? "error" : "success"}
                description={groomingData?.overdue ? "Tasks need attention" : "On track"}
                onClick={() => setIsGroomingModalOpen(true)}
              />
              <PreventiveCareCard
                icon={Stethoscope}
                title="Weekly Checkup"
                status={checkupData?.weeksSinceCheckup === 0 ? "Done this week" : checkupData?.weeksSinceCheckup === 1 ? "1 week ago" : checkupData?.weeksSinceCheckup && checkupData.weeksSinceCheckup < 999 ? `${checkupData.weeksSinceCheckup} weeks ago` : "Never done"}
                statusColor={checkupData?.weeksSinceCheckup === 0 ? "success" : checkupData?.weeksSinceCheckup && checkupData.weeksSinceCheckup <= 1 ? "success" : checkupData?.weeksSinceCheckup && checkupData.weeksSinceCheckup <= 2 ? "warning" : "error"}
                description={checkupData?.lastCheckup || "Perform full body check"}
                onClick={() => setIsCheckupModalOpen(true)}
              />
            </div>
          </div>

          <h3 className="font-semibold text-foreground mb-3">Recent Records</h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-soft p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentRecords.length > 0 ? (
              recentRecords.map((record) => {
                const Icon = getIconComponent(record.icon);
                return (
                  <div 
                    key={record.id} 
                    className="card-soft p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleRecordClick(record)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${record.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground text-sm">{record.title}</h4>
                          <span className="text-xs text-muted-foreground">{record.formattedDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent health records</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Modals */}
      <WeightTracker
        isOpen={isWeightTrackerOpen}
        onClose={() => {
          setIsWeightTrackerOpen(false);
          // Refresh health data when closing weight tracker
          setTimeout(() => {
            refetch();
          }, 500);
        }}
        currentWeight={weightData?.current || 0}
        dogName={currentDog?.name || 'Your dog'}
        dogBirthday={currentDog?.birthday ? new Date(currentDog.birthday) : undefined}
        dogId={currentDog?.id || ''}
      />
      
      <VaccineScheduleModal
        isOpen={isVaccineModalOpen}
        onClose={() => {
          setIsVaccineModalOpen(false);
          refetch(); // Refresh health data when vaccine modal closes
        }}
        dogId={currentDog?.id || ''}
        dogName={currentDog?.name || 'Your dog'}
        dogBirthday={currentDog?.birthday ? new Date(currentDog.birthday) : undefined}
      />
      
      <VetVisitsModal
        isOpen={isVetVisitsModalOpen}
        onClose={() => setIsVetVisitsModalOpen(false)}
        dogName={currentDog?.name || 'Your dog'}
        dogId={currentDog?.id || ''}
      />
      
      <HealthNotesModal
        isOpen={isHealthNotesModalOpen}
        onClose={() => {
          setIsHealthNotesModalOpen(false);
          refetch();
        }}
        dogName={currentDog?.name || 'Your dog'}
        dogId={currentDog?.id || ''}
      />

      <GroomingScheduleModal
        isOpen={isGroomingModalOpen}
        onClose={() => {
          setIsGroomingModalOpen(false);
          refetch();
        }}
        dogId={currentDog?.id || ''}
      />

      <HealthCheckupModal
        isOpen={isCheckupModalOpen}
        onClose={() => {
          setIsCheckupModalOpen(false);
          refetch();
        }}
        dogId={currentDog?.id || ''}
      />

      <WeekPlannerModal 
        isOpen={isWeekPlannerOpen}
        onClose={() => setIsWeekPlannerOpen(false)}
        dogName={currentDog?.name || 'Your Dog'}
      />
    </div>
  );
}
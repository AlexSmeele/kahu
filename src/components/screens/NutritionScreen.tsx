import { useState } from "react";
import { Apple, Calendar, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs, calculateAge } from "@/hooks/useDogs";
import { DogSwitcher } from "@/components/dogs/DogSwitcher";

const nutritionData = {
  todayCalories: { consumed: 420, target: 480, percentage: 87 },
  weeklyGoal: { current: 2940, target: 3360, daysLeft: 2 },
  lastMeal: "2 hours ago"
};

const todayMeals = [
  {
    id: 1,
    time: "7:30 AM",
    name: "Morning Kibble",
    calories: 220,
    protein: 28,
    completed: true
  },
  {
    id: 2,
    time: "6:00 PM",
    name: "Evening Kibble",
    calories: 200,
    protein: 25,
    completed: true
  },
  {
    id: 3,
    time: "8:30 PM",
    name: "Training Treats",
    calories: 60,
    protein: 8,
    completed: false
  }
];

const weeklyPlan = [
  { day: "Mon", calories: 480, completed: true },
  { day: "Tue", calories: 480, completed: true },
  { day: "Wed", calories: 480, completed: true },
  { day: "Thu", calories: 480, completed: true },
  { day: "Fri", calories: 480, completed: true },
  { day: "Sat", calories: 480, completed: true },
  { day: "Sun", calories: 480, completed: false, isToday: true }
];

export function NutritionScreen() {
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];

  // Update selected dog when dogs load
  useState(() => {
    if (dogs.length > 0 && !selectedDogId) {
      setSelectedDogId(dogs[0].id);
    }
  });

  // Calculate calories based on dog weight (rough estimation: 30 calories per pound)
  const targetCalories = currentDog?.weight ? Math.round(currentDog.weight * 2.2 * 30) : 480;
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
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-1" />
            Plan Week
          </Button>
        </div>
        
        {/* Dog Switcher */}
        <DogSwitcher
          selectedDogId={selectedDogId}
          onDogChange={setSelectedDogId}
        />
      </header>

      {/* Today's Progress */}
      <div className="p-4 bg-gradient-to-r from-warning/5 to-warning/10 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Today's Progress</h3>
          <Badge variant="outline" className="text-warning border-warning/30">
            {nutritionData.todayCalories.percentage}% complete
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Calories</span>
            <span>{nutritionData.todayCalories.consumed} / {targetCalories} kcal</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-warning to-warning/80 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((nutritionData.todayCalories.consumed / targetCalories) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last meal: {nutritionData.lastMeal}
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground mb-3">This Week</h3>
        <div className="flex gap-2">
          {weeklyPlan.map((day) => (
            <div key={day.day} className="flex-1 text-center">
              <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
              <div 
                className={`h-12 rounded-md flex items-center justify-center text-xs font-medium ${
                  day.isToday 
                    ? 'bg-warning text-warning-foreground' 
                    : day.completed 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {day.calories}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Today's Meals</h3>
          <Button variant="outline" size="sm">
            Add Meal
          </Button>
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
                {!meal.completed && (
                  <Button size="sm" className="btn-primary">
                    Mark Fed
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {meal.calories} kcal
                </div>
                <div>
                  {meal.protein}g protein
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Insights */}
        <div className="mt-6 card-soft p-4 bg-gradient-to-r from-primary/5 to-primary/10">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            This Week's Insights
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Consistent feeding schedule maintained</li>
            <li>• Daily calorie target met 85% of days</li>
            <li>• Consider adding omega-3 supplements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
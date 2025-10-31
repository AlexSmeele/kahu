import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, Calculator, AlertTriangle } from 'lucide-react';
import { useMealTracking } from '@/hooks/useMealTracking';
import { useTreatTracking } from '@/hooks/useTreatTracking';

interface CalorieProgressCardProps {
  dogId: string;
  nutritionPlanId?: string;
  dailyCalorieTarget?: number;
  onOpenCalculator?: () => void;
}

export const CalorieProgressCard = ({ dogId, nutritionPlanId, dailyCalorieTarget, onOpenCalculator }: CalorieProgressCardProps) => {
  const { mealRecords } = useMealTracking(dogId, nutritionPlanId);
  const { getTodaySummary } = useTreatTracking(dogId, nutritionPlanId);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    // Calculate calories from meals (rough estimate: 1 cup = 350 kcal average)
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = mealRecords.filter(
      record => record.scheduled_date === today && record.completed_at
    );
    
    const mealCalories = todayMeals.reduce((sum, meal) => {
      const amount = meal.amount_consumed || meal.amount_given || meal.amount_planned || 0;
      return sum + (amount * 350); // Rough estimate
    }, 0);

    // Add treat calories
    const treatSummary = getTodaySummary();
    const total = Math.round(mealCalories + treatSummary.totalCalories);
    setTotalCalories(total);
  }, [mealRecords, getTodaySummary]);

  if (!dailyCalorieTarget) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Daily Calories</h3>
          </div>
          <Button onClick={onOpenCalculator} size="sm" variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Target
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Set a daily calorie target to track your dog's nutrition more accurately.
        </p>
      </Card>
    );
  }

  const percentage = Math.round((totalCalories / dailyCalorieTarget) * 100);
  const remaining = dailyCalorieTarget - totalCalories;
  const isOverTarget = totalCalories > dailyCalorieTarget;
  const isNearTarget = percentage >= 90 && percentage <= 110;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold">Daily Calories</h3>
        </div>
        <Button onClick={onOpenCalculator} size="sm" variant="ghost">
          <Calculator className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Today's Progress</span>
          <span className="font-medium">
            {totalCalories} / {dailyCalorieTarget} kcal
          </span>
        </div>
        <Progress 
          value={Math.min(percentage, 100)} 
          className={`h-3 ${
            isOverTarget 
              ? '[&>div]:bg-destructive' 
              : isNearTarget 
                ? '[&>div]:bg-success' 
                : '[&>div]:bg-primary'
          }`}
        />
      </div>

      {/* Status Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Percentage</span>
          <span className={`font-semibold ${
            isOverTarget 
              ? 'text-destructive' 
              : isNearTarget 
                ? 'text-success' 
                : 'text-foreground'
          }`}>
            {percentage}%
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {remaining >= 0 ? 'Remaining' : 'Over target'}
          </span>
          <span className={`font-medium ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>
            {Math.abs(remaining)} kcal
          </span>
        </div>

        {/* Status Messages */}
        {isOverTarget && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-destructive">
              Over daily calorie target. Consider reducing treats or meal portions.
            </p>
          </div>
        )}

        {isNearTarget && (
          <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg text-sm">
            <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <p className="text-success">
              Great! You're within the ideal calorie range.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

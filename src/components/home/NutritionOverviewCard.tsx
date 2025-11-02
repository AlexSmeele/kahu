import { Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMealTracking } from "@/hooks/useMealTracking";
import { useNutrition } from "@/hooks/useNutrition";

interface NutritionOverviewCardProps {
  dogId: string;
  className?: string;
}

export function NutritionOverviewCard({ dogId, className = "" }: NutritionOverviewCardProps) {
  const navigate = useNavigate();
  const { nutritionPlan } = useNutrition(dogId);
  const { todayMeals } = useMealTracking(dogId, nutritionPlan?.id);
  
  // Calculate progress
  const completedMeals = todayMeals?.filter(m => m.completed).length || 0;
  const totalMeals = todayMeals?.length || 0;
  
  // Find next meal
  const now = new Date();
  const nextMeal = todayMeals
    ?.filter(m => !m.completed)
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  
  const allComplete = totalMeals > 0 && completedMeals === totalMeals;
  const hasNoPlan = !nutritionPlan || totalMeals === 0;
  
  return (
    <button
      onClick={() => navigate(`/nutrition/${dogId}`, { state: { from: 'home' } })}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Apple className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Nutrition</h3>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center my-4">
          {hasNoPlan ? (
            <p className="text-base text-muted-foreground text-center">
              Set up nutrition plan
            </p>
          ) : allComplete ? (
            <>
              <p className="text-lg font-semibold text-center mb-2">
                All meals complete! ✓
              </p>
              <p className="text-sm text-muted-foreground">
                {completedMeals} of {totalMeals} meals
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-center mb-2">
                {completedMeals} of {totalMeals} meals
              </p>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: totalMeals }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      i < completedMeals 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i < completedMeals ? '✓' : '○'}
                  </div>
                ))}
              </div>
              {nextMeal && (
                <p className="text-sm text-muted-foreground text-center">
                  Next: {nextMeal.name} at {nextMeal.time}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}

import { Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTreatTracking } from "@/hooks/useTreatTracking";
import { useNutrition } from "@/hooks/useNutrition";

interface TreatBudgetCardProps {
  dogId: string;
  className?: string;
}

export function TreatBudgetCard({ dogId, className = "" }: TreatBudgetCardProps) {
  const navigate = useNavigate();
  const { nutritionPlan } = useNutrition(dogId);
  const { calculateTreatBudget } = useTreatTracking(dogId, nutritionPlan?.id);
  
  const budget = calculateTreatBudget();
  const percentage = budget.percentageUsed;
  
  const getColor = (pct: number) => {
    if (pct >= 100) return 'text-destructive';
    if (pct >= 90) return 'text-orange-500';
    if (pct >= 70) return 'text-yellow-500';
    return 'text-primary';
  };
  
  const getBarColor = (pct: number) => {
    if (pct >= 100) return 'bg-destructive';
    if (pct >= 90) return 'bg-orange-500';
    if (pct >= 70) return 'bg-yellow-500';
    return 'bg-primary';
  };
  
  const hasNoPlan = !nutritionPlan || !budget.budgetCalories;
  
  return (
    <button
      onClick={() => navigate(`/nutrition/${dogId}`, { state: { from: 'home' } })}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Cookie className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Treats</h3>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center my-4">
          {hasNoPlan ? (
            <p className="text-base text-muted-foreground text-center">
              Set up nutrition plan
            </p>
          ) : (
            <>
              <p className={`text-lg font-semibold text-center mb-2 ${getColor(percentage)}`}>
                {Math.round(budget.usedCalories)} / {Math.round(budget.budgetCalories)} cal
              </p>
              
              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all ${getBarColor(percentage)}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {budget.remainingCalories > 0 
                  ? `${Math.round(budget.remainingCalories)} cal left`
                  : `${Math.round(Math.abs(budget.remainingCalories))} cal over!`
                }
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

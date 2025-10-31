import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cookie, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { TreatLogModal } from './TreatLogModal';
import { useTreatTracking } from '@/hooks/useTreatTracking';
import { format } from 'date-fns';

interface TreatTrackerCardProps {
  dogId: string;
  nutritionPlanId: string | undefined;
  dailyCalorieTarget?: number;
}

export function TreatTrackerCard({ dogId, nutritionPlanId, dailyCalorieTarget }: TreatTrackerCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { addTreat, getTodayTreats, getTodaySummary, calculateTreatBudget } = useTreatTracking(dogId, nutritionPlanId);

  const todayTreats = getTodayTreats();
  const summary = getTodaySummary();
  const budget = calculateTreatBudget(dailyCalorieTarget);

  const isOverBudget = budget.percentageUsed > 100;
  const isNearLimit = budget.percentageUsed > 80 && budget.percentageUsed <= 100;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              Treat Tracker
            </div>
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Log Treat
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{summary.totalTreats}</div>
              <div className="text-xs text-muted-foreground">Treats Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{summary.totalCalories}</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                {budget.remainingCalories}
              </div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>

          {/* Budget Progress */}
          {dailyCalorieTarget && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Treat Budget (10%)</span>
                <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                  {budget.usedCalories} / {budget.budgetCalories} cal
                </span>
              </div>
              <Progress 
                value={budget.percentageUsed} 
                className={isOverBudget ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-yellow-500' : ''}
              />
              {isOverBudget && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Over treat budget! Consider reducing treats or adjusting meal portions.</span>
                </div>
              )}
            </div>
          )}

          {/* Recent Treats */}
          {todayTreats.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Today's Treats
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {todayTreats.slice(0, 5).map((treat) => (
                  <div key={treat.id} className="flex items-center justify-between text-sm p-2 rounded bg-accent/50">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground truncate">{treat.treat_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {treat.amount} {treat.unit} • {format(new Date(treat.given_at), 'h:mm a')}
                      </div>
                    </div>
                    {treat.calories && (
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
                        {treat.calories} cal
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No treats logged today
            </div>
          )}
        </CardContent>
      </Card>

      <TreatLogModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={addTreat}
      />
    </>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalorieCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dogWeight?: number;
  activityLevel?: string;
  onCalculate: (calories: number, macros: { protein: number; fat: number; fiber: number; carbs: number }) => void;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.4,
  moderate: 1.6,
  active: 1.8,
  very_active: 2.0,
};

const LIFE_STAGE_ADJUSTMENTS = {
  puppy: 2.0,
  adult: 1.0,
  senior: 0.8,
  pregnant: 1.5,
  nursing: 2.5,
};

export const CalorieCalculatorModal = ({ open, onOpenChange, dogWeight, activityLevel, onCalculate }: CalorieCalculatorModalProps) => {
  const { toast } = useToast();
  const [weight, setWeight] = useState(dogWeight || 0);
  const [activity, setActivity] = useState(activityLevel || 'moderate');
  const [lifeStage, setLifeStage] = useState('adult');
  const [bodyCondition, setBodyCondition] = useState('ideal');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);

  const calculateRER = (weightKg: number) => {
    // Resting Energy Requirement: 70 × (body weight in kg)^0.75
    return 70 * Math.pow(weightKg, 0.75);
  };

  const handleCalculate = () => {
    if (weight <= 0) {
      toast({
        title: 'Invalid Weight',
        description: 'Please enter a valid weight greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    const rer = calculateRER(weight);
    const activityMultiplier = ACTIVITY_MULTIPLIERS[activity as keyof typeof ACTIVITY_MULTIPLIERS] || 1.6;
    const lifeStageMultiplier = LIFE_STAGE_ADJUSTMENTS[lifeStage as keyof typeof LIFE_STAGE_ADJUSTMENTS] || 1.0;
    
    // Body condition adjustment
    let bcAdjustment = 1.0;
    if (bodyCondition === 'underweight') bcAdjustment = 1.1;
    if (bodyCondition === 'overweight') bcAdjustment = 0.9;

    const totalCalories = Math.round(rer * activityMultiplier * lifeStageMultiplier * bcAdjustment);
    setCalculatedCalories(totalCalories);
  };

  const handleApply = () => {
    if (calculatedCalories) {
      // Standard macronutrient distribution for dogs
      const macros = {
        protein: 25, // 25% protein
        fat: 15,     // 15% fat
        fiber: 4,    // 4% fiber
        carbs: 56,   // 56% carbs (remainder)
      };

      onCalculate(calculatedCalories, macros);
      toast({
        title: 'Calorie Target Updated',
        description: `Daily calorie target set to ${calculatedCalories} kcal.`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calorie Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              placeholder="Enter weight in kg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lifeStage">Life Stage</Label>
            <Select value={lifeStage} onValueChange={setLifeStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
                <SelectItem value="adult">Adult (1-7 years)</SelectItem>
                <SelectItem value="senior">Senior (7+ years)</SelectItem>
                <SelectItem value="pregnant">Pregnant</SelectItem>
                <SelectItem value="nursing">Nursing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity Level</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (minimal exercise)</SelectItem>
                <SelectItem value="light">Light (1-2 walks/day)</SelectItem>
                <SelectItem value="moderate">Moderate (regular exercise)</SelectItem>
                <SelectItem value="active">Active (daily vigorous exercise)</SelectItem>
                <SelectItem value="very_active">Very Active (working/sport dog)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="bodyCondition">Body Condition</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      <strong>Ideal:</strong> Ribs easily felt, visible waist<br/>
                      <strong>Underweight:</strong> Ribs, spine visible<br/>
                      <strong>Overweight:</strong> Ribs difficult to feel
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={bodyCondition} onValueChange={setBodyCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="underweight">Underweight</SelectItem>
                <SelectItem value="ideal">Ideal</SelectItem>
                <SelectItem value="overweight">Overweight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCalculate} className="w-full" variant="outline">
            Calculate Daily Calories
          </Button>

          {calculatedCalories && (
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Recommended Daily Calories</p>
              <p className="text-3xl font-bold text-primary">{calculatedCalories}</p>
              <p className="text-xs text-muted-foreground mt-1">kcal/day</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!calculatedCalories}>
            Apply to Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

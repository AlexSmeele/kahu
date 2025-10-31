import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Beef, Droplet, Wheat, Apple } from 'lucide-react';

interface MacronutrientCardProps {
  protein?: number;
  fat?: number;
  fiber?: number;
  carbs?: number;
}

interface MacroItem {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const MacronutrientCard = ({ protein = 0, fat = 0, fiber = 0, carbs = 0 }: MacronutrientCardProps) => {
  const macros: MacroItem[] = [
    {
      name: 'Protein',
      value: protein,
      icon: <Beef className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-600',
    },
    {
      name: 'Fat',
      value: fat,
      icon: <Droplet className="h-4 w-4" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-600',
    },
    {
      name: 'Fiber',
      value: fiber,
      icon: <Wheat className="h-4 w-4" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-600',
    },
    {
      name: 'Carbs',
      value: carbs,
      icon: <Apple className="h-4 w-4" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-600',
    },
  ];

  const hasData = macros.some(m => m.value > 0);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Macronutrient Balance</h3>
      
      {!hasData ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Set macronutrient targets in your nutrition plan
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {macros.map((macro) => (
            <div key={macro.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${macro.color}`}>
                  {macro.icon}
                  <span className="text-sm font-medium">{macro.name}</span>
                </div>
                <span className="text-sm font-semibold">{macro.value}%</span>
              </div>
              <Progress value={macro.value} className={`h-2 [&>div]:${macro.bgColor}`} />
            </div>
          ))}

          {/* Visual pie representation */}
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden">
              {macros.filter(m => m.value > 0).map((macro, index) => (
                <div
                  key={macro.name}
                  className={macro.bgColor}
                  style={{ width: `${macro.value}%` }}
                  title={`${macro.name}: ${macro.value}%`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Recommended ranges:</strong> Protein 18-30%, Fat 10-20%, Fiber 2-5%, Carbs 40-60%
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

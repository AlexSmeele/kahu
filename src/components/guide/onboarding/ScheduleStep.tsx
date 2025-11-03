import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface StepProps {
  data: {
    weekday_hours_away: number;
    weekend_hours_away: number;
  };
  setData: (updates: any) => void;
}

export function ScheduleStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">What's your typical schedule?</h2>
        <p className="text-muted-foreground">
          Dogs need companionship and care throughout the day.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Weekday hours away from home</Label>
            <span className="text-2xl font-semibold text-primary">
              {data.weekday_hours_away}h
            </span>
          </div>
          <Slider
            value={[data.weekday_hours_away]}
            onValueChange={(value) => setData({ weekday_hours_away: value[0] })}
            min={0}
            max={16}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Average hours away on weekdays
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Weekend hours away from home</Label>
            <span className="text-2xl font-semibold text-primary">
              {data.weekend_hours_away}h
            </span>
          </div>
          <Slider
            value={[data.weekend_hours_away]}
            onValueChange={(value) => setData({ weekend_hours_away: value[0] })}
            min={0}
            max={16}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Average hours away on weekends
          </p>
        </div>
      </div>

      {data.weekday_hours_away > 8 && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Consider dog walkers, daycare, or a dog-sitter for long work days.
          </p>
        </div>
      )}
    </div>
  );
}

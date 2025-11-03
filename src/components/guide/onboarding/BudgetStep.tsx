import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DollarSign } from "lucide-react";

interface StepProps {
  data: {
    budget_monthly_nzd: number;
  };
  setData: (updates: any) => void;
}

export function BudgetStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Monthly budget for dog care</h2>
        <p className="text-muted-foreground">
          Understanding costs helps you plan for your dog's needs.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-5xl font-bold text-primary">
                {data.budget_monthly_nzd}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">NZD per month</p>
          </div>
        </div>

        <Slider
          value={[data.budget_monthly_nzd]}
          onValueChange={(value) => setData({ budget_monthly_nzd: value[0] })}
          min={50}
          max={500}
          step={10}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$50</span>
          <span>$500+</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
        <h4 className="font-semibold text-sm">Typical monthly costs include:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Food: $50-150</li>
          <li>• Veterinary care: $30-80</li>
          <li>• Grooming: $40-100</li>
          <li>• Toys & supplies: $20-50</li>
          <li>• Insurance (optional): $30-80</li>
        </ul>
        <p className="text-xs text-muted-foreground pt-2">
          Emergency vet visits and one-time purchases not included.
        </p>
      </div>

      {data.budget_monthly_nzd < 150 && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Consider setting aside extra funds for unexpected vet bills and emergencies.
          </p>
        </div>
      )}
    </div>
  );
}

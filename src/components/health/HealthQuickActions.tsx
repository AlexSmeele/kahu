import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Scissors, Brush, Stethoscope, Weight, Plus } from "lucide-react";

interface HealthQuickActionsProps {
  onGroomingClick: () => void;
  onCheckupClick: () => void;
  onWeightClick: () => void;
  onAddRecordClick: () => void;
}

export const HealthQuickActions = ({
  onGroomingClick,
  onCheckupClick,
  onWeightClick,
  onAddRecordClick,
}: HealthQuickActionsProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onGroomingClick} className="h-20 flex-col gap-2 bg-card hover:bg-accent border">
          <Scissors className="h-5 w-5" />
          <span className="text-sm">Log Grooming</span>
        </Button>
        <Button variant="secondary" onClick={onCheckupClick} className="h-20 flex-col gap-2 bg-card hover:bg-accent border">
          <Stethoscope className="h-5 w-5" />
          <span className="text-sm">Weekly Checkup</span>
        </Button>
        <Button variant="secondary" onClick={onWeightClick} className="h-20 flex-col gap-2 bg-card hover:bg-accent border">
          <Weight className="h-5 w-5" />
          <span className="text-sm">Add Weight</span>
        </Button>
        <Button variant="secondary" onClick={onAddRecordClick} className="h-20 flex-col gap-2 bg-card hover:bg-accent border">
          <Plus className="h-5 w-5" />
          <span className="text-sm">Add Record</span>
        </Button>
      </div>
    </div>
  );
};

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
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGroomingClick}
            className="flex-shrink-0"
          >
            <Scissors className="h-4 w-4 mr-2" />
            Log Grooming
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCheckupClick}
            className="flex-shrink-0"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Weekly Checkup
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onWeightClick}
            className="flex-shrink-0"
          >
            <Weight className="h-4 w-4 mr-2" />
            Add Weight
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddRecordClick}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

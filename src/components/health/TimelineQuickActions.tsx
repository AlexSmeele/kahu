import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Activity, 
  Apple, 
  Scale, 
  Scissors, 
  Stethoscope,
  Tag,
  Camera
} from "lucide-react";

interface TimelineQuickActionsProps {
  onAddActivity: () => void;
  onLogMeal: () => void;
  onRecordWeight: () => void;
  onGrooming: () => void;
  onCheckup: () => void;
  onAddNote: () => void;
}

export function TimelineQuickActions({
  onAddActivity,
  onLogMeal,
  onRecordWeight,
  onGrooming,
  onCheckup,
  onAddNote,
}: TimelineQuickActionsProps) {
  const actions = [
    { icon: Activity, label: "Activity", onClick: onAddActivity, color: "text-primary" },
    { icon: Apple, label: "Meal", onClick: onLogMeal, color: "text-success" },
    { icon: Scale, label: "Weight", onClick: onRecordWeight, color: "text-warning" },
    { icon: Scissors, label: "Grooming", onClick: onGrooming, color: "text-purple-500" },
    { icon: Stethoscope, label: "Checkup", onClick: onCheckup, color: "text-teal-500" },
    { icon: Tag, label: "Note", onClick: onAddNote, color: "text-muted-foreground" },
  ];

  return (
    <div className="mb-6">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2 h-auto rounded-full whitespace-nowrap hover:bg-accent"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

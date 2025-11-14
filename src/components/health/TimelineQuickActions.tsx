import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Activity, 
  Apple, 
  Scale, 
  Scissors, 
  Stethoscope,
  Tag,
  Camera,
  Syringe
} from "lucide-react";

interface TimelineQuickActionsProps {
  dogId: string;
  onAddActivity: () => void;
  onLogMeal: () => void;
  onRecordWeight: () => void;
  onGrooming: () => void;
  onCheckup: () => void;
  onAddNote: () => void;
}

export function TimelineQuickActions({
  dogId,
  onAddActivity,
  onLogMeal,
  onRecordWeight,
  onGrooming,
  onCheckup,
  onAddNote,
}: TimelineQuickActionsProps) {
  const navigate = useNavigate();
  
  const actions = [
    { icon: Activity, label: "Activity", onClick: onAddActivity, color: "text-primary" },
    { icon: Apple, label: "Meal", onClick: onLogMeal, color: "text-success" },
    { icon: Scale, label: "Weight", onClick: onRecordWeight, color: "text-warning" },
    { icon: Syringe, label: "Vaccines", onClick: () => navigate(`/vaccine-schedule/${dogId}`), color: "text-blue-500" },
    { icon: Scissors, label: "Grooming", onClick: onGrooming, color: "text-purple-500" },
    { icon: Stethoscope, label: "Checkup", onClick: onCheckup, color: "text-teal-500" },
    { icon: Tag, label: "Note", onClick: onAddNote, color: "text-muted-foreground" },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            onClick={action.onClick}
            className="flex flex-col items-center gap-1 px-2 py-3 h-auto rounded-xl hover:bg-accent border-2 border-primary/20"
          >
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

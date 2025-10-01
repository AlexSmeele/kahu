import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreventiveCareCardProps {
  icon: LucideIcon;
  title: string;
  status: string;
  statusColor: "success" | "warning" | "error" | "default";
  description: string;
  onClick: () => void;
}

export const PreventiveCareCard = ({
  icon: Icon,
  title,
  status,
  statusColor,
  description,
  onClick,
}: PreventiveCareCardProps) => {
  const statusColorClasses = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
    default: "text-muted-foreground",
  };

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p
            className={cn(
              "text-xs font-medium mb-1",
              statusColorClasses[statusColor]
            )}
          >
            {status}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};

import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IOSStatusBar } from "./IOSStatusBar";
import { DynamicIsland } from "./DynamicIsland";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export function PageHeader({ title, onBack, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[10px] after:bg-gradient-to-b after:from-transparent after:to-background/10 after:pointer-events-none">
      {/* Status bar safe area with overlapping elements */}
      <div className="relative h-[54px]">
        <DynamicIsland />
        <IOSStatusBar />
      </div>
      
      <div className="px-5 pb-4 flex items-center justify-between gap-3">
        {/* Back Button */}
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="flex-shrink-0 w-10 h-10 rounded-full"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Title */}
        <h1 className="flex-1 text-2xl font-semibold truncate">
          {title}
        </h1>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

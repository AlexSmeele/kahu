import { FileText } from "lucide-react";

interface QuickNoteTileProps {
  onClick: () => void;
  className?: string;
}

export function QuickNoteTile({ onClick, className = "" }: QuickNoteTileProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-base text-foreground">Add Note</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Quick health notes with photos or videos
          </p>
        </div>
      </div>
    </button>
  );
}

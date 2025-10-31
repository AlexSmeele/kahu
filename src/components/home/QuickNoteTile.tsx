import { FileText } from "lucide-react";

interface QuickNoteTileProps {
  onClick: () => void;
  className?: string;
}

export function QuickNoteTile({ onClick, className = "" }: QuickNoteTileProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full h-full ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-accent" />
        </div>
        <h3 className="font-semibold text-foreground">Add Note</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Quick health notes with photos or videos
      </p>
      
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
        <span>Tap to add</span>
      </div>
    </button>
  );
}

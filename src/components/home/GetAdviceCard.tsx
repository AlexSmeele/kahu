import { MessageCircle } from "lucide-react";

interface GetAdviceCardProps {
  onClick: () => void;
}

export const GetAdviceCard = ({ onClick }: GetAdviceCardProps) => {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full h-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Get Advice</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Ask our AI trainer anything
      </p>
      
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
        <span>Tap to chat</span>
      </div>
    </button>
  );
};

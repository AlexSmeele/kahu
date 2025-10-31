import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GetAdviceCard = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/ai-chat')}
      className="rounded-2xl border bg-card p-3 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Get Advice</h3>
            <p className="text-xs text-muted-foreground">Ask our AI care adviser</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">→</div>
      </div>
    </button>
  );
};

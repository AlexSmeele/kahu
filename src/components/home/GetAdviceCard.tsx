import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GetAdviceCardProps {
  className?: string;
}

export const GetAdviceCard = ({ className = "" }: GetAdviceCardProps) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/ai-chat')}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-center min-h-[88px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Get Advice</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Ask our AI care adviser
        </p>
        <p className="text-xs text-muted-foreground">
          Chat now →
        </p>
      </div>
    </button>
  );
};

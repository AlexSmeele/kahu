import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrainerScreenVariant2 } from "@/components/screens/TrainerScreenVariant2";

export default function AIChat() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-lg font-semibold">Kahu</h1>
          <p className="text-xs text-muted-foreground">Your AI dog care adviser</p>
        </div>
        <div className="w-10" /> {/* Spacer for center alignment */}
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <TrainerScreenVariant2 />
      </div>
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrainerScreenVariantSelector } from "@/components/screens/TrainerScreenVariantSelector";

export default function AIChat() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">AI Trainer</h1>
        <div className="w-10" /> {/* Spacer for center alignment */}
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <TrainerScreenVariantSelector />
      </div>
    </div>
  );
}

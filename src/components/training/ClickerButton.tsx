import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

interface ClickerButtonProps {
  onClick: () => void;
}

export function ClickerButton({ onClick }: ClickerButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="absolute top-3 right-3 z-50 shadow-lg bg-background border-2"
    >
      <Radio className="w-4 h-4 mr-2" />
      Clicker
    </Button>
  );
}

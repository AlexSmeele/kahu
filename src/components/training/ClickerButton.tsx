import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

interface ClickerButtonProps {
  onClick: () => void;
}

export function ClickerButton({ onClick }: ClickerButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="w-11 h-11 rounded-full"
      aria-label="Open clicker"
    >
      <Radio className="w-[26px] h-[26px]" />
    </Button>
  );
}

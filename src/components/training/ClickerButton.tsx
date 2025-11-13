import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

interface ClickerButtonProps {
  onClick: () => void;
}

export function ClickerButton({ onClick }: ClickerButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-11 px-4 rounded-full gap-2"
      aria-label="Open clicker"
    >
      <Radio className="w-[26px] h-[26px]" />
      <span className="font-medium">Clicker</span>
    </Button>
  );
}

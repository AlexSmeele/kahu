import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import clickerSound from "@/assets/dog-clicker.mp3";

interface ClickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClickerModal({ isOpen, onClose }: ClickerModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playClickSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Dog Training Clicker</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hidden audio element */}
          <audio ref={audioRef} src={clickerSound} preload="auto" />

          {/* Clicker Button */}
          <div className="flex justify-center">
            <button
              onClick={playClickSound}
              className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-hover shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/50"
            >
              <span className="text-2xl font-bold text-primary-foreground">
                CLICK
              </span>
              
              {/* Ripple effect on click */}
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 hover:opacity-100"></div>
            </button>
          </div>

          {/* How to Use - Always Visible */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>How to use:</strong> Click the button at the exact moment your dog performs the desired behavior. Follow immediately with a treat. This creates a positive association between the click sound and reward.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}

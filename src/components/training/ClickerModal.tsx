import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClickerModal({ isOpen, onClose }: ClickerModalProps) {
  const [clickCount, setClickCount] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playClickSound = () => {
    // Create Web Audio API click sound
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 2000; // High frequency for click sound
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
    
    setClickCount(prev => prev + 1);
  };

  const handleReset = () => {
    setClickCount(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Dog Training Clicker</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Click Counter */}
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">{clickCount}</div>
            <p className="text-sm text-muted-foreground">Clicks this session</p>
          </div>

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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowInfo(!showInfo)}
              className="flex-1"
            >
              <Info className="w-4 h-4 mr-2" />
              Info
            </Button>
          </div>

          {/* Info Section */}
          {showInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>How to use:</strong> Click the button at the exact moment your dog performs the desired behavior. Follow immediately with a treat. This creates a positive association between the click sound and reward.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

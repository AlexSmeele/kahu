import { useState } from "react";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  feedback: string;
}

const hotspots: Hotspot[] = [
  {
    id: 'ears',
    x: 50,
    y: 20,
    label: 'Ears back',
    feedback: 'Ears pinned back often indicates fear, anxiety, or submission. Relaxed ears are neutral or forward.'
  },
  {
    id: 'eyes',
    x: 45,
    y: 28,
    label: 'Whale eye (whites showing)',
    feedback: 'Showing the whites of their eyes ("whale eye") is a sign of stress, fear, or discomfort.'
  },
  {
    id: 'mouth',
    x: 55,
    y: 38,
    label: 'Closed mouth, tense',
    feedback: 'A closed, tense mouth can indicate stress. A relaxed, slightly open mouth is usually calm.'
  },
  {
    id: 'body',
    x: 50,
    y: 60,
    label: 'Lowered body posture',
    feedback: 'A lowered, cowering posture shows fear or submission. Confident dogs stand tall.'
  },
  {
    id: 'tail',
    x: 75,
    y: 70,
    label: 'Tail tucked',
    feedback: 'A tucked tail is a clear sign of fear or anxiety. A relaxed tail is neutral or wagging gently.'
  },
];

export function BodyLanguageInspector() {
  const [selectedHotspots, setSelectedHotspots] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const handleHotspotClick = (id: string) => {
    if (showResults) return;
    
    setSelectedHotspots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedHotspots(new Set());
    setShowResults(false);
  };

  const score = Math.round((selectedHotspots.size / hotspots.length) * 100);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="font-bold text-xl mb-2">Dog Body Language Inspector</h3>
        <p className="text-sm text-muted-foreground">
          Click on the areas of this dog that show signs of stress or fear. Identify all 5 signals.
        </p>
      </div>

      <div className="space-y-6">
        {/* Interactive Image Area */}
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg border overflow-hidden">
          {/* Placeholder for dog image - in production, use actual image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                [Dog image showing stressed body language]
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Image placeholder - Click hotspots below
              </p>
            </div>
          </div>

          {/* Hotspots */}
          {hotspots.map(hotspot => {
            const isSelected = selectedHotspots.has(hotspot.id);
            const isRevealed = showResults;

            return (
              <button
                key={hotspot.id}
                onClick={() => handleHotspotClick(hotspot.id)}
                style={{
                  position: 'absolute',
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`
                  w-12 h-12 rounded-full border-2 transition-all
                  ${isSelected || isRevealed ? 'scale-100 opacity-100' : 'scale-75 opacity-60'}
                  ${isRevealed && isSelected ? 'bg-primary/20 border-primary animate-pulse' : ''}
                  ${isRevealed && !isSelected ? 'bg-red-500/20 border-red-500' : ''}
                  ${!isRevealed && isSelected ? 'bg-primary/30 border-primary' : ''}
                  ${!isRevealed && !isSelected ? 'bg-background/80 border-border hover:border-primary' : ''}
                `}
              >
                {isRevealed && isSelected && <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />}
                {isRevealed && !isSelected && <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
              </button>
            );
          })}
        </div>

        {/* Progress */}
        {!showResults && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Selected: {selectedHotspots.size} / {hotspots.length}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!showResults ? (
            <Button 
              onClick={handleSubmit} 
              disabled={selectedHotspots.size === 0}
              className="flex-1"
            >
              Check Answers
            </Button>
          ) : (
            <>
              <div className="flex-1 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{score}%</div>
                  <div className="text-sm text-muted-foreground">
                    {score === 100 ? 'Perfect! You spotted all the signs!' : 
                     `You found ${selectedHotspots.size} out of ${hotspots.length} signals`}
                  </div>
                </div>
              </div>
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
            </>
          )}
        </div>

        {/* Educational Feedback */}
        {showResults && (
          <div className="space-y-3">
            <h4 className="font-semibold">Body Language Signals:</h4>
            {hotspots.map(hotspot => {
              const wasSelected = selectedHotspots.has(hotspot.id);
              return (
                <div 
                  key={hotspot.id}
                  className={`p-3 rounded-lg border ${
                    wasSelected ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    {wasSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{hotspot.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">{hotspot.feedback}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

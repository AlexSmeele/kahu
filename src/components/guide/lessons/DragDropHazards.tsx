import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HazardItem {
  id: string;
  text: string;
  isSafe: boolean;
  placed?: 'safe' | 'remove';
}

const initialItems: HazardItem[] = [
  { id: '1', text: 'Chocolate', isSafe: false },
  { id: '2', text: 'Grapes', isSafe: false },
  { id: '3', text: 'Dog bed', isSafe: true },
  { id: '4', text: 'Electrical cords', isSafe: false },
  { id: '5', text: 'Water bowl', isSafe: true },
  { id: '6', text: 'Open trash can', isSafe: false },
  { id: '7', text: 'Dog toys', isSafe: true },
  { id: '8', text: 'Medications', isSafe: false },
  { id: '9', text: 'House plants', isSafe: false },
  { id: '10', text: 'Leash', isSafe: true },
];

export function DragDropHazards() {
  const [items, setItems] = useState(initialItems);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleDrop = (itemId: string, zone: 'safe' | 'remove') => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, placed: zone } : item
      )
    );
  };

  const handleSubmit = () => {
    const correct = items.filter(item => 
      (item.isSafe && item.placed === 'safe') || 
      (!item.isSafe && item.placed === 'remove')
    ).length;
    
    setScore(Math.round((correct / items.length) * 100));
    setCompleted(true);
  };

  const handleReset = () => {
    setItems(initialItems);
    setCompleted(false);
    setScore(0);
  };

  const unplacedItems = items.filter(item => !item.placed);
  const safeItems = items.filter(item => item.placed === 'safe');
  const removeItems = items.filter(item => item.placed === 'remove');

  const canSubmit = items.every(item => item.placed);

  const ItemCard = ({ item }: { item: HazardItem }) => {
    const isCorrect = completed && (
      (item.isSafe && item.placed === 'safe') ||
      (!item.isSafe && item.placed === 'remove')
    );
    const isWrong = completed && !isCorrect;

    return (
      <div
        draggable={!completed}
        onDragStart={(e) => e.dataTransfer.setData('itemId', item.id)}
        className={`
          p-3 rounded-lg border-2 cursor-move select-none transition-all
          ${!completed ? 'hover:border-primary hover:shadow-sm' : ''}
          ${isCorrect ? 'bg-green-500/10 border-green-500' : ''}
          ${isWrong ? 'bg-red-500/10 border-red-500' : ''}
          ${!completed && !item.placed ? 'border-border' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{item.text}</span>
          {completed && (
            isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )
          )}
        </div>
      </div>
    );
  };

  const DropZone = ({ 
    type, 
    title, 
    items: zoneItems 
  }: { 
    type: 'safe' | 'remove'; 
    title: string; 
    items: HazardItem[];
  }) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('itemId');
        handleDrop(itemId, type);
      }}
      className="flex-1 p-4 rounded-lg border-2 border-dashed min-h-[200px] transition-colors hover:border-primary/50"
    >
      <h4 className="font-semibold mb-3 text-center">{title}</h4>
      <div className="space-y-2">
        {zoneItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="font-bold text-xl mb-2">Pet-Safe Home Assessment</h3>
        <p className="text-sm text-muted-foreground">
          Drag each item to the correct zone. Items that are safe can stay, hazardous items should be removed.
        </p>
      </div>

      <div className="space-y-6">
        {/* Unplaced Items */}
        {!completed && unplacedItems.length > 0 && (
          <div className="p-4 rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Items to Sort</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {unplacedItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Drop Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DropZone type="safe" title="✓ Safe to Keep" items={safeItems} />
          <DropZone type="remove" title="✗ Remove or Secure" items={removeItems} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!completed ? (
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit}
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
                    {score === 100 ? 'Perfect! Your home is safe!' : 
                     score >= 80 ? 'Great job! Review the incorrect items.' : 
                     'Review the hazards and try again.'}
                  </div>
                </div>
              </div>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </>
          )}
        </div>

        {/* Educational Notes */}
        {completed && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-2 text-sm">Common Household Hazards:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Chocolate, grapes, onions, and xylitol are toxic to dogs</li>
              <li>• Secure electrical cords and keep chemicals out of reach</li>
              <li>• Many common house plants are poisonous to pets</li>
              <li>• Keep medications, cleaning supplies, and trash secured</li>
              <li>• Remove small objects that could be choking hazards</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

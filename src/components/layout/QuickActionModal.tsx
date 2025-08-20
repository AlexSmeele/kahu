import { X, Scale, Apple, Heart, MessageCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  {
    id: 'weight',
    title: 'Log Weight',
    description: 'Record current weight',
    icon: Scale,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  {
    id: 'meal',
    title: 'Log Meal',
    description: 'Add meal or treats',
    icon: Apple,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  {
    id: 'health',
    title: 'Health Note',
    description: 'Add health observation',
    icon: Heart,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  {
    id: 'ai-chat',
    title: 'Ask Trainer',
    description: 'Quick question for AI',
    icon: MessageCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    id: 'photo',
    title: 'Take Photo',
    description: 'Capture moment',
    icon: Camera,
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  }
];

export function QuickActionModal({ isOpen, onClose }: QuickActionModalProps) {
  const handleAction = (actionId: string) => {
    console.log('Quick action:', actionId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Quick Actions
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-full ${action.bgColor} flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <h3 className="font-medium text-foreground text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
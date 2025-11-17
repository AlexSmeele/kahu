import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dog } from '@/hooks/useDogs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ServiceDetails {
  name: string;
  address?: string;
  rating?: number;
  serviceType: 'vet' | 'groomer' | 'walker';
}

interface DogSelection {
  dogId: string;
  selected: boolean;
  isPrimary: boolean;
  notes: string;
}

interface AddServiceToDogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceDetails;
  dogs: Dog[];
  onConfirm: (selections: Array<{ dogId: string; isPrimary: boolean; notes: string }>) => Promise<void>;
}

export function AddServiceToDogsModal({
  open,
  onOpenChange,
  service,
  dogs,
  onConfirm,
}: AddServiceToDogsModalProps) {
  const [selections, setSelections] = useState<Record<string, DogSelection>>(
    dogs.reduce((acc, dog) => {
      acc[dog.id] = {
        dogId: dog.id,
        selected: false,
        isPrimary: false,
        notes: '',
      };
      return acc;
    }, {} as Record<string, DogSelection>)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCount = Object.values(selections).filter(s => s.selected).length;

  const handleToggleDog = (dogId: string) => {
    setSelections(prev => ({
      ...prev,
      [dogId]: {
        ...prev[dogId],
        selected: !prev[dogId].selected,
        isPrimary: !prev[dogId].selected ? prev[dogId].isPrimary : false,
      },
    }));
  };

  const handleTogglePrimary = (dogId: string) => {
    setSelections(prev => ({
      ...prev,
      [dogId]: {
        ...prev[dogId],
        isPrimary: !prev[dogId].isPrimary,
      },
    }));
  };

  const handleNotesChange = (dogId: string, notes: string) => {
    setSelections(prev => ({
      ...prev,
      [dogId]: {
        ...prev[dogId],
        notes,
      },
    }));
  };

  const handleConfirm = async () => {
    const selectedDogs = Object.values(selections)
      .filter(s => s.selected)
      .map(s => ({
        dogId: s.dogId,
        isPrimary: s.isPrimary,
        notes: s.notes,
      }));

    if (selectedDogs.length === 0) return;

    setIsSubmitting(true);
    try {
      await onConfirm(selectedDogs);
      onOpenChange(false);
      // Reset selections
      setSelections(
        dogs.reduce((acc, dog) => {
          acc[dog.id] = {
            dogId: dog.id,
            selected: false,
            isPrimary: false,
            notes: '',
          };
          return acc;
        }, {} as Record<string, DogSelection>)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceTypeLabel = () => {
    switch (service.serviceType) {
      case 'vet':
        return 'vet clinic';
      case 'groomer':
        return 'groomer';
      case 'walker':
        return 'walker';
    }
  };

  const getPrimaryLabel = () => {
    switch (service.serviceType) {
      case 'vet':
        return 'Primary Vet';
      case 'groomer':
        return 'Preferred Groomer';
      case 'walker':
        return 'Preferred Walker';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add {service.name}</DialogTitle>
          <DialogDescription>
            Select which dogs should use this {getServiceTypeLabel()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {dogs.map(dog => {
              const selection = selections[dog.id];
              return (
                <div
                  key={dog.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selection.selected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      id={`dog-${dog.id}`}
                      checked={selection.selected}
                      onCheckedChange={() => handleToggleDog(dog.id)}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={dog.avatar_url} alt={dog.name} />
                        <AvatarFallback>{dog.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label htmlFor={`dog-${dog.id}`} className="text-base font-medium cursor-pointer">
                          {dog.name}
                        </Label>
                        {dog.breed?.breed && (
                          <p className="text-sm text-muted-foreground">{dog.breed.breed}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selection.selected && (
                    <div className="ml-9 space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`primary-${dog.id}`}
                          checked={selection.isPrimary}
                          onCheckedChange={() => handleTogglePrimary(dog.id)}
                        />
                        <Label htmlFor={`primary-${dog.id}`} className="text-sm cursor-pointer">
                          Set as {getPrimaryLabel()}
                        </Label>
                      </div>

                      <div>
                        <Label htmlFor={`notes-${dog.id}`} className="text-sm mb-1">
                          Notes (optional)
                        </Label>
                        <Textarea
                          id={`notes-${dog.id}`}
                          placeholder="Add any specific notes for this guardian-service relationship..."
                          value={selection.notes}
                          onChange={(e) => handleNotesChange(dog.id, e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedCount === 0 || isSubmitting}
          >
            {isSubmitting ? (
              'Adding...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Add to {selectedCount} {selectedCount === 1 ? 'Dog' : 'Dogs'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

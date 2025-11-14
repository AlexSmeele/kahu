import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useDogWalkers, type DogWalker } from '@/hooks/useDogWalkers';
import { useToast } from '@/hooks/use-toast';

interface EditWalkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogWalker: DogWalker;
  dogName: string;
}

export function EditWalkerModal({ isOpen, onClose, dogWalker, dogName }: EditWalkerModalProps) {
  const { updateWalkerRelationship } = useDogWalkers();
  const { toast } = useToast();
  const [isPreferred, setIsPreferred] = useState(dogWalker.is_preferred);
  const [relationshipNotes, setRelationshipNotes] = useState(dogWalker.relationship_notes || '');
  const [preferredDays, setPreferredDays] = useState(dogWalker.preferred_days || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsPreferred(dogWalker.is_preferred);
    setRelationshipNotes(dogWalker.relationship_notes || '');
    setPreferredDays(dogWalker.preferred_days || '');
  }, [dogWalker]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateWalkerRelationship(dogWalker.id, {
        is_preferred: isPreferred,
        relationship_notes: relationshipNotes,
        preferred_days: preferredDays,
      });
      toast({
        title: "Dog walker updated",
        description: `Details for ${dogWalker.walker.name} have been updated.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update dog walker details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit dog walker details</DialogTitle>
          <DialogDescription>
            Update {dogWalker.walker.name}'s details for {dogName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preferred"
              checked={isPreferred}
              onCheckedChange={(checked) => setIsPreferred(checked as boolean)}
            />
            <Label htmlFor="preferred" className="cursor-pointer">
              Set as preferred dog walker
            </Label>
          </div>

          {isPreferred && (
            <div className="space-y-2">
              <Label htmlFor="preferredDays">Preferred walking days (optional)</Label>
              <Input
                id="preferredDays"
                placeholder="e.g., Monday, Wednesday, Friday"
                value={preferredDays}
                onChange={(e) => setPreferredDays(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or preferences..."
              value={relationshipNotes}
              onChange={(e) => setRelationshipNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { useGroomers, type DogGroomer } from '@/hooks/useGroomers';
import { useToast } from '@/hooks/use-toast';

interface EditGroomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogGroomer: DogGroomer;
  dogName: string;
}

export function EditGroomerModal({ isOpen, onClose, dogGroomer, dogName }: EditGroomerModalProps) {
  const { updateGroomerRelationship } = useGroomers();
  const { toast } = useToast();
  const [isPreferred, setIsPreferred] = useState(dogGroomer.is_preferred);
  const [relationshipNotes, setRelationshipNotes] = useState(dogGroomer.relationship_notes || '');
  const [preferredGroomerName, setPreferredGroomerName] = useState(dogGroomer.preferred_groomer_name || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsPreferred(dogGroomer.is_preferred);
    setRelationshipNotes(dogGroomer.relationship_notes || '');
    setPreferredGroomerName(dogGroomer.preferred_groomer_name || '');
  }, [dogGroomer]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGroomerRelationship(dogGroomer.id, {
        is_preferred: isPreferred,
        relationship_notes: relationshipNotes,
        preferred_groomer_name: preferredGroomerName,
      });
      toast({
        title: "Groomer updated",
        description: `Details for ${dogGroomer.groomer.name} have been updated.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update groomer details. Please try again.",
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
          <DialogTitle>Edit groomer details</DialogTitle>
          <DialogDescription>
            Update {dogGroomer.groomer.name}'s details for {dogName}.
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
              Set as preferred groomer
            </Label>
          </div>

          {isPreferred && (
            <div className="space-y-2">
              <Label htmlFor="preferredGroomerName">Preferred groomer's name (optional)</Label>
              <Input
                id="preferredGroomerName"
                placeholder="e.g., Sarah Smith"
                value={preferredGroomerName}
                onChange={(e) => setPreferredGroomerName(e.target.value)}
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

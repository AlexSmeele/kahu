import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  serviceType: 'groomer' | 'walker' | 'vet';
  dogName: string;
  onConfirm: (data: { isPreferred: boolean; notes: string }) => Promise<void>;
}

export function AddServiceDrawer({
  isOpen,
  onClose,
  serviceName,
  serviceType,
  dogName,
  onConfirm,
}: AddServiceDrawerProps) {
  const [isPreferred, setIsPreferred] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm({ isPreferred, notes });
      // Reset form
      setIsPreferred(false);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error adding service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypeLabel = serviceType === 'groomer' ? 'groomer' : serviceType === 'walker' ? 'dog walker' : 'vet clinic';

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add {serviceName}</DrawerTitle>
          <DrawerDescription>
            Add this {serviceTypeLabel} to {dogName}'s profile
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preferred"
              checked={isPreferred}
              onCheckedChange={(checked) => setIsPreferred(checked as boolean)}
            />
            <Label htmlFor="preferred" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Set as preferred {serviceTypeLabel}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder={`Add any notes about this ${serviceTypeLabel}...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DrawerFooter>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Profile'
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

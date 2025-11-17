import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBugReports } from '@/hooks/useBugReports';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptedRoute: string;
}

export function ReportBugModal({ isOpen, onClose, attemptedRoute }: ReportBugModalProps) {
  const [userIntent, setUserIntent] = useState('');
  const [description, setDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const { isLoading, reportBug } = useBugReports();

  const handleReport = async () => {
    if (!userIntent.trim() || !description.trim()) return;

    try {
      await reportBug(
        attemptedRoute,
        userIntent,
        description,
        additionalDetails.trim() || null
      );
      handleClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    setUserIntent('');
    setDescription('');
    setAdditionalDetails('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Help us improve Kahu by reporting issues you encounter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Route Preview */}
          <div>
            <Label className="text-sm text-muted-foreground">Route that caused the error</Label>
            <div className="mt-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm">
              {attemptedRoute}
            </div>
          </div>

          {/* User Intent */}
          <div>
            <Label htmlFor="user-intent">
              What were you trying to do? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="user-intent"
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder="I was trying to view my dog's training progress..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              What happened? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I clicked on a link and it showed a 404 page..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Additional Details */}
          <div>
            <Label htmlFor="additional-details">Additional Details (optional)</Label>
            <Textarea
              id="additional-details"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any other information that might help us fix this issue..."
              rows={2}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReport}
            disabled={isLoading || !userIntent.trim() || !description.trim()}
            className="flex-1"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

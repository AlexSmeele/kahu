import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ReportMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string, details: string) => void;
  messageContent: string;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  { value: 'incorrect_information', label: 'Incorrect Information' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'unsafe_advice', label: 'Unsafe Advice' },
  { value: 'not_helpful', label: 'Not Helpful' },
  { value: 'other', label: 'Other' },
];

export const ReportMessageModal = ({
  isOpen,
  onClose,
  onReport,
  messageContent,
  isLoading = false,
}: ReportMessageModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');

  const handleReport = () => {
    if (!selectedReason) return;
    onReport(selectedReason, details);
    setSelectedReason('');
    setDetails('');
    onClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Message</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Message Preview</Label>
            <div className="mt-1 p-3 bg-muted rounded-md text-sm max-h-20 overflow-y-auto">
              {messageContent.length > 150 
                ? `${messageContent.substring(0, 150)}...` 
                : messageContent
              }
            </div>
          </div>

          <div>
            <Label>Why are you reporting this message?</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="mt-2"
            >
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="text-sm font-normal">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details">Additional Details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Please provide more context about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleReport} 
            disabled={isLoading || !selectedReason}
            variant="destructive"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
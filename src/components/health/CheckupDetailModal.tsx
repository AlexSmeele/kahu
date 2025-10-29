import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, ClipboardCheck, FileText } from "lucide-react";

interface CheckupDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkup: {
    id: string;
    date: string;
    notes?: string;
    findings?: any;
  };
}

export function CheckupDetailModal({ open, onOpenChange, checkup }: CheckupDetailModalProps) {
  const parseFindings = () => {
    if (!checkup.findings) return null;
    try {
      return typeof checkup.findings === 'string' ? JSON.parse(checkup.findings) : checkup.findings;
    } catch {
      return null;
    }
  };

  const findings = parseFindings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Health Checkup Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Health Checkup</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(checkup.date), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          {findings && (
            <div className="space-y-3">
              {findings.ears && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Ears & Eyes</p>
                  <p className="text-sm text-muted-foreground">{findings.ears}</p>
                </div>
              )}

              {findings.skin && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Skin & Coat</p>
                  <p className="text-sm text-muted-foreground">{findings.skin}</p>
                </div>
              )}

              {findings.body && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Body Condition</p>
                  <p className="text-sm text-muted-foreground">{findings.body}</p>
                </div>
              )}

              {findings.behavior && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Behavior</p>
                  <p className="text-sm text-muted-foreground">{findings.behavior}</p>
                </div>
              )}
            </div>
          )}

          {checkup.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Notes</span>
              </div>
              <p className="font-medium whitespace-pre-wrap">{checkup.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

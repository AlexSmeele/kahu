import { useState, useEffect } from "react";
import { Save, Scale, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { WeightRecord } from "@/hooks/useWeightRecords";

interface EditWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: WeightRecord | null;
  onSave: (id: string, weight: number, date: string, notes?: string) => void;
  onDelete: (id: string) => void;
}

export function EditWeightModal({ isOpen, onClose, record, onSave, onDelete }: EditWeightModalProps) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (record) {
      setWeight(record.weight.toString());
      const recordDate = new Date(record.date);
      setDate(recordDate.toISOString().split('T')[0]);
      setTime(recordDate.toTimeString().slice(0, 5));
      setNotes(record.notes || "");
    }
  }, [record]);

  const handleSave = () => {
    if (!record) return;
    
    if (!weight || isNaN(parseFloat(weight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    const dateTime = `${date}T${time}`;
    onSave(record.id, parseFloat(weight), dateTime, notes || undefined);
    onClose();
  };

  const handleDelete = () => {
    if (!record) return;
    onDelete(record.id);
    onClose();
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Edit Weight Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations about the weighing..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroomingSchedule } from "@/hooks/useGroomingSchedule";
import { Scissors, Brush, PawPrint, Ear, Check } from "lucide-react";
import { format } from "date-fns";

interface GroomingScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
}

const groomingTypes = [
  { value: "full_grooming", label: "Full Grooming", icon: Scissors },
  { value: "teeth_brushing", label: "Teeth Brushing", icon: Brush },
  { value: "nail_trimming", label: "Nail Trimming", icon: PawPrint },
  { value: "ear_cleaning", label: "Ear Cleaning", icon: Ear },
];

export const GroomingScheduleModal = ({
  isOpen,
  onClose,
  dogId,
}: GroomingScheduleModalProps) => {
  const { schedules, loading, addSchedule, completeGrooming } =
    useGroomingSchedule(dogId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    type: "",
    frequency: "7",
    notes: "",
  });

  const handleAddSchedule = async () => {
    if (!newSchedule.type) return;
    await addSchedule(
      newSchedule.type,
      parseInt(newSchedule.frequency),
      newSchedule.notes
    );
    setNewSchedule({ type: "", frequency: "7", notes: "" });
    setShowAddForm(false);
  };

  const getGroomingTypeInfo = (type: string) => {
    return groomingTypes.find((t) => t.value === type);
  };

  const isOverdue = (nextDueDate: string | null) => {
    if (!nextDueDate) return false;
    return new Date(nextDueDate) < new Date();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[min(95vw,600px)] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grooming Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full"
              variant="outline"
            >
              Add Grooming Schedule
            </Button>
          )}

          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">New Grooming Schedule</h3>
              <div className="space-y-3">
                <div>
                  <Label>Grooming Type</Label>
                  <Select
                    value={newSchedule.type}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {groomingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Frequency (days)</Label>
                  <Input
                    type="number"
                    value={newSchedule.frequency}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        frequency: e.target.value,
                      })
                    }
                    min="1"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newSchedule.notes}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, notes: e.target.value })
                    }
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddSchedule} className="flex-1">
                    Add Schedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : schedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No grooming schedules yet. Add one to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => {
                const typeInfo = getGroomingTypeInfo(schedule.grooming_type);
                const Icon = typeInfo?.icon || Scissors;
                const overdue = isOverdue(schedule.next_due_date);

                return (
                  <div
                    key={schedule.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {typeInfo?.label || schedule.grooming_type}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Every {schedule.frequency_days} days
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => completeGrooming(schedule.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    </div>

                    {schedule.next_due_date && (
                      <div
                        className={`text-sm ${
                          overdue
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {overdue ? "Overdue: " : "Next due: "}
                        {format(new Date(schedule.next_due_date), "MMM d, yyyy")}
                      </div>
                    )}

                    {schedule.last_completed_at && (
                      <p className="text-sm text-muted-foreground">
                        Last completed:{" "}
                        {format(
                          new Date(schedule.last_completed_at),
                          "MMM d, yyyy"
                        )}
                      </p>
                    )}

                    {schedule.notes && (
                      <p className="text-sm text-muted-foreground">
                        {schedule.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

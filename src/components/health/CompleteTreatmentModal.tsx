import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CompleteTreatmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentName: string;
  onComplete: (completionDateTime: Date) => void;
}

export function CompleteTreatmentModal({
  open,
  onOpenChange,
  treatmentName,
  onComplete,
}: CompleteTreatmentModalProps) {
  const [completionType, setCompletionType] = useState<"now" | "custom">("now");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), "HH:mm")
  );

  const handleComplete = () => {
    let completionDateTime: Date;

    if (completionType === "now") {
      completionDateTime = new Date();
    } else {
      // Combine selected date with selected time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      completionDateTime = new Date(selectedDate);
      completionDateTime.setHours(hours, minutes, 0, 0);
    }

    onComplete(completionDateTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Treatment</DialogTitle>
          <DialogDescription>
            Mark "{treatmentName}" as completed. Choose when the treatment was administered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={completionType} onValueChange={(value) => setCompletionType(value as "now" | "custom")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now" className="font-normal cursor-pointer">
                Complete now
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="font-normal cursor-pointer">
                Choose date and time
              </Label>
            </div>
          </RadioGroup>

          {completionType === "custom" && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete}>
            Complete Treatment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

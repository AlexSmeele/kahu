import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Cookie } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TreatLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    treat_type: string;
    treat_name: string;
    amount: number;
    unit: string;
    calories?: number;
    given_at?: Date;
    reason?: string;
    notes?: string;
  }) => void;
}

const TREAT_TYPES = [
  'Training Treat',
  'Dental Chew',
  'Bully Stick',
  'Kong Filling',
  'Biscuit',
  'Jerky',
  'Vegetable',
  'Fruit',
  'Other',
];

const UNITS = ['piece', 'g', 'oz', 'tbsp', 'tsp', 'cup'];

export function TreatLogModal({ open, onOpenChange, onSubmit }: TreatLogModalProps) {
  const [treatType, setTreatType] = useState('Training Treat');
  const [treatName, setTreatName] = useState('');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('piece');
  const [calories, setCalories] = useState('');
  const [givenAt, setGivenAt] = useState<Date>(new Date());
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!treatName.trim()) {
      return;
    }

    onSubmit({
      treat_type: treatType,
      treat_name: treatName.trim(),
      amount: parseFloat(amount) || 1,
      unit,
      calories: calories ? parseInt(calories) : undefined,
      given_at: givenAt,
      reason: reason.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setTreatName('');
    setAmount('1');
    setUnit('piece');
    setCalories('');
    setReason('');
    setNotes('');
    setGivenAt(new Date());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-primary" />
            Log Treat
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treat-type">Treat Type *</Label>
            <Select value={treatType} onValueChange={setTreatType}>
              <SelectTrigger id="treat-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TREAT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treat-name">Treat Name *</Label>
            <Input
              id="treat-name"
              value={treatName}
              onChange={(e) => setTreatName(e.target.value)}
              placeholder="e.g., Chicken training bits"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.1"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories (optional)</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Enter calorie count"
            />
          </div>

          <div className="space-y-2">
            <Label>Given At</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !givenAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {givenAt ? format(givenAt, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={givenAt}
                  onSelect={(date) => date && setGivenAt(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Training session, Good behavior"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Log Treat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

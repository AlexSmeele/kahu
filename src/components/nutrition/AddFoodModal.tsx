import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FoodItem {
  name: string;
  type: 'food' | 'supplement' | 'medication';
  supplier: string;
  amount: number;
  unit: string;
  notes?: string;
}

interface AddFoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'food' | 'supplement' | 'medication';
  onSave: (item: FoodItem) => void;
}

const FOOD_TYPES = [
  'Dry Kibble',
  'Wet Food', 
  'Raw Food',
  'Freeze Dried',
  'Dehydrated',
  'Treats',
  'Other'
];

const SUPPLEMENT_TYPES = [
  'Multivitamin',
  'Omega-3',
  'Glucosamine',
  'Probiotics',
  'Joint Support',
  'Digestive Aid',
  'Other'
];

const MEDICATION_TYPES = [
  'Prescription Medication',
  'Flea/Tick Prevention',
  'Heartworm Prevention', 
  'Pain Relief',
  'Antibiotics',
  'Other'
];

const UNITS = ['cups', 'grams', 'ounces', 'tablespoons', 'teaspoons', 'pieces', 'packets', 'ml'];

export function AddFoodModal({ open, onOpenChange, type, onSave }: AddFoodModalProps) {
  const [formData, setFormData] = useState<FoodItem>({
    name: '',
    type,
    supplier: '',
    amount: 0,
    unit: 'cups',
    notes: '',
  });

  const getTypeOptions = () => {
    switch (type) {
      case 'food':
        return FOOD_TYPES;
      case 'supplement':
        return SUPPLEMENT_TYPES;
      case 'medication':
        return MEDICATION_TYPES;
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'food':
        return 'Add Food';
      case 'supplement':
        return 'Add Supplement';
      case 'medication':
        return 'Add Medication';
      default:
        return 'Add Item';
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.supplier || formData.amount <= 0) {
      return;
    }

    onSave(formData);
    
    // Reset form
    setFormData({
      name: '',
      type,
      supplier: '',
      amount: 0,
      unit: 'cups',
      notes: '',
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setFormData({
      name: '',
      type,
      supplier: '',
      amount: 0,
      unit: 'cups',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[min(95vw,450px)] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-4 px-1 pb-4">
            <div>
              <Label htmlFor="foodType">
                {type === 'food' ? 'Food Type' : type === 'supplement' ? 'Supplement Type' : 'Medication Type'}
              </Label>
              <Select 
                value={formData.name} 
                onValueChange={(value) => setFormData({ ...formData, name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${type} type`} />
                </SelectTrigger>
                <SelectContent>
                  {getTypeOptions().map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplier">
                {type === 'medication' ? 'Prescribed By / Pharmacy' : 'Brand / Supplier'}
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder={type === 'medication' ? 'Dr. Smith / PetMeds' : 'Royal Canin, Hills, etc.'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="1.5"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">
                {type === 'medication' ? 'Dosage Instructions' : 'Additional Notes'} (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={
                  type === 'medication' 
                    ? 'e.g., Give with food, twice daily' 
                    : 'Any special feeding instructions...'
                }
                rows={3}
              />
            </div>
          </div>
         </ScrollArea>

         <div className="flex gap-2 pt-4 border-t">
           <Button variant="outline" onClick={handleClose} className="flex-1">
             Cancel
           </Button>
           <Button 
             onClick={handleSave} 
             className="flex-1"
             disabled={!formData.name || !formData.supplier || formData.amount <= 0}
           >
             <Save className="w-4 h-4 mr-2" />
             Add {type === 'food' ? 'Food' : type === 'supplement' ? 'Supplement' : 'Medication'}
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }
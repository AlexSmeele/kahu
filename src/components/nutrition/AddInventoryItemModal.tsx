import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FoodInventoryItem } from '@/hooks/useFoodInventory';

interface AddInventoryItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dogId: string;
  onAdd: (item: Omit<FoodInventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editItem?: FoodInventoryItem;
}

const FOOD_TYPES = ['Dry', 'Wet', 'Raw', 'Fresh', 'Freeze-Dried', 'Dehydrated', 'Treats'];
const UNITS = ['kg', 'g', 'lb', 'oz', 'cups', 'cans', 'pouches'];

export const AddInventoryItemModal = ({ open, onOpenChange, dogId, onAdd, editItem }: AddInventoryItemModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    food_name: editItem?.food_name || '',
    brand: editItem?.brand || '',
    food_type: editItem?.food_type || 'Dry',
    quantity_remaining: editItem?.quantity_remaining || 0,
    unit: editItem?.unit || 'kg',
    opened_date: editItem?.opened_date || '',
    expiration_date: editItem?.expiration_date || '',
    batch_lot_number: editItem?.batch_lot_number || '',
    storage_location: editItem?.storage_location || '',
    purchase_date: editItem?.purchase_date || '',
    purchase_cost: editItem?.purchase_cost || 0,
    low_stock_alert_threshold: editItem?.low_stock_alert_threshold || 0.5,
    alert_enabled: editItem?.alert_enabled ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onAdd({
        ...formData,
        dog_id: dogId,
        purchase_cost: formData.purchase_cost || undefined,
      });

      toast({
        title: editItem ? 'Item Updated' : 'Item Added',
        description: `${formData.food_name} has been ${editItem ? 'updated' : 'added'} to inventory.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editItem ? 'update' : 'add'} inventory item.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit' : 'Add'} Food Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food_name">Food Name *</Label>
            <Input
              id="food_name"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="food_type">Food Type *</Label>
              <Select value={formData.food_type} onValueChange={(value) => setFormData({ ...formData, food_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_remaining">Quantity Remaining *</Label>
              <Input
                id="quantity_remaining"
                type="number"
                step="0.01"
                value={formData.quantity_remaining}
                onChange={(e) => setFormData({ ...formData, quantity_remaining: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low_stock_alert_threshold">Low Stock Alert</Label>
              <Input
                id="low_stock_alert_threshold"
                type="number"
                step="0.01"
                value={formData.low_stock_alert_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_alert_threshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opened_date">Opened Date</Label>
              <Input
                id="opened_date"
                type="date"
                value={formData.opened_date}
                onChange={(e) => setFormData({ ...formData, opened_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch_lot_number">Batch/Lot Number</Label>
            <Input
              id="batch_lot_number"
              value={formData.batch_lot_number}
              onChange={(e) => setFormData({ ...formData, batch_lot_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage_location">Storage Location</Label>
            <Input
              id="storage_location"
              value={formData.storage_location}
              onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
              placeholder="e.g., Kitchen Pantry, Garage"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_cost">Purchase Cost</Label>
              <Input
                id="purchase_cost"
                type="number"
                step="0.01"
                value={formData.purchase_cost || ''}
                onChange={(e) => setFormData({ ...formData, purchase_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editItem ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

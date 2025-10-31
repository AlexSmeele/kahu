import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFoodInventory, FoodInventoryItem } from '@/hooks/useFoodInventory';
import { AddInventoryItemModal } from './AddInventoryItemModal';
import { Plus, Package, AlertTriangle, Calendar, MapPin, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FoodInventoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dogId: string;
}

export const FoodInventoryDrawer = ({ open, onOpenChange, dogId }: FoodInventoryDrawerProps) => {
  const { inventoryItems, loading, fetchInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, getLowStockItems, getExpiringItems } = useFoodInventory(dogId);
  const { toast } = useToast();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FoodInventoryItem | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (open && dogId) {
      fetchInventoryItems();
    }
  }, [open, dogId, fetchInventoryItems]);

  const lowStockItems = getLowStockItems();
  const expiringItems = getExpiringItems(14); // Items expiring in 14 days

  const handleAdd = async (item: Omit<FoodInventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (editItem) {
      await updateInventoryItem(editItem.id, item);
      setEditItem(undefined);
    } else {
      await addInventoryItem(item);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteInventoryItem(itemToDelete);
        toast({
          title: 'Item Deleted',
          description: 'Food item has been removed from inventory.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete inventory item.',
          variant: 'destructive',
        });
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const renderInventoryItem = (item: FoodInventoryItem) => {
    const isLowStock = item.alert_enabled && item.quantity_remaining <= item.low_stock_alert_threshold;
    const isExpiring = item.expiration_date && expiringItems.some(i => i.id === item.id);

    return (
      <Card key={item.id} className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{item.food_name}</h3>
              {item.brand && <Badge variant="outline">{item.brand}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{item.food_type}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditItem(item);
                setAddModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setItemToDelete(item.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <span className="font-medium">
              {item.quantity_remaining} {item.unit}
              {isLowStock && <Badge variant="destructive" className="ml-2">Low Stock</Badge>}
            </span>
          </div>

          {item.expiration_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expires
              </span>
              <span className={`text-sm ${isExpiring ? 'text-destructive font-medium' : ''}`}>
                {formatDistanceToNow(new Date(item.expiration_date), { addSuffix: true })}
                {isExpiring && <AlertTriangle className="inline h-3 w-3 ml-1" />}
              </span>
            </div>
          )}

          {item.opened_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Opened</span>
              <span className="text-sm">
                {formatDistanceToNow(new Date(item.opened_date), { addSuffix: true })}
              </span>
            </div>
          )}

          {item.storage_location && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location
              </span>
              <span className="text-sm">{item.storage_location}</span>
            </div>
          )}

          {item.batch_lot_number && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Batch</span>
              <span className="text-sm font-mono">{item.batch_lot_number}</span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Food Inventory
              </DrawerTitle>
              <Button onClick={() => setAddModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </DrawerHeader>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Alerts Section */}
            {(lowStockItems.length > 0 || expiringItems.length > 0) && (
              <div className="space-y-2">
                {lowStockItems.length > 0 && (
                  <Card className="p-3 bg-destructive/10 border-destructive/20">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low
                      </span>
                    </div>
                  </Card>
                )}
                {expiringItems.length > 0 && (
                  <Card className="p-3 bg-orange-500/10 border-orange-500/20">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring soon
                      </span>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Inventory Items */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No food items in inventory</p>
                <Button onClick={() => setAddModalOpen(true)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryItems.map(renderInventoryItem)}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <AddInventoryItemModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open);
          if (!open) setEditItem(undefined);
        }}
        dogId={dogId}
        onAdd={handleAdd}
        editItem={editItem}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this food item from inventory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

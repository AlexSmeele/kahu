import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useFoodInventory } from '@/hooks/useFoodInventory';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reason: string;
  checked: boolean;
}

interface SmartShoppingListProps {
  dogId: string;
}

export const SmartShoppingList = ({ dogId }: SmartShoppingListProps) => {
  const { inventoryItems, getLowStockItems, getExpiringItems } = useFoodInventory(dogId);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    generateShoppingList();
  }, [inventoryItems]);

  const generateShoppingList = () => {
    const list: ShoppingItem[] = [];
    
    // Add low stock items
    const lowStock = getLowStockItems();
    lowStock.forEach(item => {
      const neededQuantity = Math.ceil(item.low_stock_alert_threshold * 2);
      list.push({
        id: `low-${item.id}`,
        name: item.food_name,
        quantity: neededQuantity,
        unit: item.unit,
        reason: 'Low stock',
        checked: false,
      });
    });

    // Add soon-to-expire items that need replacement
    const expiring = getExpiringItems(7);
    expiring.forEach(item => {
      if (!list.some(i => i.name === item.food_name)) {
        list.push({
          id: `exp-${item.id}`,
          name: item.food_name,
          quantity: item.quantity_remaining,
          unit: item.unit,
          reason: 'Expiring soon',
          checked: false,
        });
      }
    });

    setShoppingList(list);
  };

  const toggleItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
    toast({
      title: 'Items Cleared',
      description: 'Completed items removed from shopping list.',
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Smart Shopping List</h3>
        </div>
        {shoppingList.some(item => item.checked) && (
          <Button onClick={clearCompleted} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Completed
          </Button>
        )}
      </div>

      {shoppingList.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Your shopping list is empty. Items will appear here when stock is low or expiring soon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shoppingList.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                item.checked ? 'bg-muted/50' : 'bg-background'
              }`}
            >
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className={`font-medium ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit} • {item.reason}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Tip: This list is automatically generated based on your inventory levels and expiration dates.
        </p>
      </div>
    </Card>
  );
};

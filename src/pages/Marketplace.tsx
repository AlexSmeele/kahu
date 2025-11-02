import { ArrowLeft, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MarketplaceScreen } from '@/components/screens/MarketplaceScreen';
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { OrderHistoryModal } from '@/components/marketplace/OrderHistoryModal';
import { useToast } from '@/hooks/use-toast';

export default function Marketplace() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(true);
  const [cartItems, setCartItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    supplier: string;
  }>>([]);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout successful!",
      description: `Order placed for ${cartItems.length} items. Total: $${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`,
    });
    setCartItems([]);
  };

  const handleReorder = (items: Array<{ id: string; name: string; price: number; quantity: number; imageUrl: string; supplier: string; }>) => {
    setCartItems(prev => {
      const newItems = [...prev];
      items.forEach(reorderItem => {
        const existingItemIndex = newItems.findIndex(item => item.id === reorderItem.id);
        if (existingItemIndex >= 0) {
          newItems[existingItemIndex].quantity += reorderItem.quantity;
        } else {
          newItems.push({ ...reorderItem });
        }
      });
      return newItems;
    });
    
    toast({
      title: "Items added to cart",
      description: `${items.length} items from your previous order have been added to cart.`,
    });
  };

  return (
    <div className="content-frame bg-background safe-top">
      <div className="sticky top-0 z-10 bg-background border-b safe-top">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold flex-1">Marketplace</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
          <CartDrawer
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onViewOrderHistory={() => setIsOrderHistoryOpen(true)}
          />
        </div>
      </div>
      <MarketplaceScreen 
        cartItems={cartItems}
        setCartItems={setCartItems}
        showFilters={showFilters}
      />
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onReorder={handleReorder}
      />
    </div>
  );
}

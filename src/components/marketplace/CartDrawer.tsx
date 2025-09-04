import { useState } from "react";
import { ShoppingCart, Clock, X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  supplier: string;
}

interface CartDrawerProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onViewOrderHistory: () => void;
}

export function CartDrawer({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  onViewOrderHistory 
}: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex items-center justify-between">
            <span>Shopping Cart</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onViewOrderHistory}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Order History
            </Button>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto px-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.supplier}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-foreground">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => onRemoveItem(item.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total: ${totalAmount.toFixed(2)}</span>
              <Badge variant="secondary">{totalItems} items</Badge>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                onCheckout();
                setIsOpen(false);
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
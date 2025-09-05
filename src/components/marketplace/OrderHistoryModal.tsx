import { useState } from "react";
import { Package, Calendar, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  supplier: string;
}

interface Order {
  id: string;
  date: Date;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  total: number;
  items: OrderItem[];
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReorder: (items: OrderItem[]) => void;
}

// Mock order data
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    status: "delivered",
    total: 68.98,
    items: [
      {
        id: "1",
        name: "Premium Dog Food - Chicken & Rice",
        price: 45.99,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop",
        supplier: "Royal Canin",
      },
      {
        id: "4",
        name: "Dental Chew Treats",
        price: 18.99,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
        supplier: "Greenies",
      },
    ],
  },
  {
    id: "ORD-002",
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
    status: "delivered",
    total: 114.98,
    items: [
      {
        id: "5",
        name: "Orthopedic Dog Bed",
        price: 89.99,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop",
        supplier: "PetSafe",
      },
      {
        id: "2",
        name: "Interactive Puzzle Toy",
        price: 24.99,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop",
        supplier: "Kong",
      },
    ],
  },
];

const statusColors = {
  delivered: "default",
  shipped: "secondary",
  processing: "outline",
  cancelled: "destructive",
} as const;

export function OrderHistoryModal({ isOpen, onClose, onReorder }: OrderHistoryModalProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order History
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            {mockOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              
              return (
                <Card key={order.id}>
                  <CardHeader 
                    className="cursor-pointer pb-3"
                    onClick={() => toggleOrderExpanded(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle className="text-base">{order.id}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            {format(order.date, "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">${order.total.toFixed(2)}</div>
                          <Badge variant={statusColors[order.status]} className="text-xs">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.supplier}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm">Qty: {item.quantity}</span>
                                <span className="text-sm font-semibold">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          onReorder(order.items);
                          onClose();
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reorder Items
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
            
            {mockOrders.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
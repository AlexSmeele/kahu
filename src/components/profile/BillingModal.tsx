import { useState } from "react";
import { CreditCard, Calendar, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

interface BillingHistory {
  id: string;
  date: Date;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoice?: string;
}

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: "2",
    type: "card",
    brand: "Mastercard",
    last4: "8888",
    expiryMonth: 8,
    expiryYear: 2024,
  },
];

const mockBillingHistory: BillingHistory[] = [
  {
    id: "1",
    date: new Date(2024, 7, 1),
    amount: 29.99,
    description: "Pro Plan - Monthly Subscription",
    status: "paid",
    invoice: "INV-001",
  },
  {
    id: "2",
    date: new Date(2024, 6, 1),
    amount: 29.99,
    description: "Pro Plan - Monthly Subscription", 
    status: "paid",
    invoice: "INV-002",
  },
  {
    id: "3",
    date: new Date(2024, 5, 15),
    amount: 45.99,
    description: "Premium Dog Food - Marketplace Purchase",
    status: "paid",
    invoice: "INV-003",
  },
];

export function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [billingHistory] = useState<BillingHistory[]>(mockBillingHistory);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  const getStatusColor = (status: BillingHistory['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));
  };

  const removePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
  };

  const handleAddCard = () => {
    // In a real app, you would integrate with a payment processor here
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: "card",
      brand: "Visa", // Would be determined by card number
      last4: newCard.number.slice(-4),
      expiryMonth: parseInt(newCard.expiry.split('/')[0]),
      expiryYear: 2000 + parseInt(newCard.expiry.split('/')[1]),
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    setNewCard({ number: "", expiry: "", cvc: "", name: "" });
    setShowAddCard(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[min(95vw,800px)] max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Billing & Payments
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="subscription" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="subscription" className="mt-0">
              <div className="space-y-4">
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Current Plan</span>
                      <Badge className="bg-primary text-primary-foreground">Pro</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium">Pro Monthly</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">$29.99/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next billing:</span>
                        <span className="font-medium">{format(new Date(2024, 8, 1), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Pro Plan Includes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Unlimited AI training sessions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Advanced health tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Family sharing (up to 10 members)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Premium marketplace access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Priority customer support</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="flex-1 text-destructive">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment-methods" className="mt-0">
              <div className="space-y-4">
                {/* Add Card Form */}
                {showAddCard && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={newCard.number}
                            onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={newCard.expiry}
                              onChange={(e) => setNewCard(prev => ({ ...prev, expiry: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvc">CVC</Label>
                            <Input
                              id="cvc"
                              placeholder="123"
                              value={newCard.cvc}
                              onChange={(e) => setNewCard(prev => ({ ...prev, cvc: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="name">Cardholder Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={newCard.name}
                            onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddCard} className="flex-1">
                            Add Card
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddCard(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Methods List */}
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card key={method.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                              {method.brand?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">•••• •••• •••• {method.last4}</div>
                              <div className="text-sm text-muted-foreground">
                                Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {method.isDefault && (
                              <Badge variant="outline" className="text-primary border-primary/30">
                                Default
                              </Badge>
                            )}
                            {!method.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDefaultPaymentMethod(method.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePaymentMethod(method.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowAddCard(true)}
                  className="w-full"
                  disabled={showAddCard}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="space-y-3">
                {billingHistory.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {format(item.date, 'MMM dd, yyyy')}
                            {item.invoice && (
                              <>
                                <span>•</span>
                                <span>{item.invoice}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.amount.toFixed(2)}</div>
                          <Badge className={`${getStatusColor(item.status)} text-xs border`}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {billingHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No billing history available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
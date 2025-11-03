import { useState } from "react";
import { DollarSign, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CostItem {
  category: string;
  upfront: number;
  monthly: number;
  notes?: string;
}

export function CostCalculator() {
  const [costs, setCosts] = useState<CostItem[]>([
    { category: "Initial supplies", upfront: 300, monthly: 0, notes: "Bed, bowls, collar, leash, crate" },
    { category: "Food", upfront: 50, monthly: 100, notes: "Quality dog food" },
    { category: "Veterinary care", upfront: 200, monthly: 50, notes: "Initial checkup, vaccines, monthly preventives" },
    { category: "Grooming", upfront: 50, monthly: 60, notes: "Bath, nails, brushing" },
    { category: "Training", upfront: 200, monthly: 0, notes: "Basic obedience classes" },
    { category: "Toys & enrichment", upfront: 50, monthly: 30, notes: "Interactive toys, chews" },
    { category: "Insurance", upfront: 0, monthly: 60, notes: "Pet insurance (optional)" },
    { category: "Emergency fund", upfront: 500, monthly: 0, notes: "For unexpected vet bills" },
  ]);

  const totalUpfront = costs.reduce((sum, item) => sum + item.upfront, 0);
  const totalMonthly = costs.reduce((sum, item) => sum + item.monthly, 0);
  const yearlyTotal = totalUpfront + (totalMonthly * 12);

  const updateCost = (index: number, field: 'upfront' | 'monthly', value: number) => {
    const newCosts = [...costs];
    newCosts[index][field] = value;
    setCosts(newCosts);
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl mb-1">Dog Ownership Cost Calculator</h3>
          <p className="text-sm text-muted-foreground">
            Customize values to match your situation (NZD)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToPDF}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          {costs.map((cost, index) => (
            <div key={index} className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">{cost.category}</Label>
                  {cost.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{cost.notes}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Upfront Cost</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={cost.upfront}
                      onChange={(e) => updateCost(index, 'upfront', Number(e.target.value))}
                      className="pl-8"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Monthly Cost</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={cost.monthly}
                      onChange={(e) => updateCost(index, 'monthly', Number(e.target.value))}
                      className="pl-8"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Total Upfront</div>
              <div className="text-3xl font-bold text-primary">${totalUpfront}</div>
              <div className="text-xs text-muted-foreground mt-2">One-time costs</div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Monthly Cost</div>
              <div className="text-3xl font-bold text-primary">${totalMonthly}</div>
              <div className="text-xs text-muted-foreground mt-2">Recurring expenses</div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">First Year Total</div>
              <div className="text-3xl font-bold text-primary">${yearlyTotal}</div>
              <div className="text-xs text-muted-foreground mt-2">Upfront + 12 months</div>
            </Card>
          </div>

          <div className="p-6 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Budget Planning Tips</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Set aside an emergency fund of $500-1,000 for unexpected vet bills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Consider pet insurance ($40-80/month) to help with major medical costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Costs increase as dogs age - factor in senior care expenses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Quality food and preventive care now can save money on health issues later</span>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

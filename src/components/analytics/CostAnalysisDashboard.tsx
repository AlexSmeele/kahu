import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useFoodInventory } from '@/hooks/useFoodInventory';
import { DollarSign, TrendingUp, Package, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface CostAnalysisDashboardProps {
  dogId: string;
}

export const CostAnalysisDashboard = ({ dogId }: CostAnalysisDashboardProps) => {
  const { inventoryItems } = useFoodInventory(dogId);
  const [monthlyCost, setMonthlyCost] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [avgItemCost, setAvgItemCost] = useState(0);

  useEffect(() => {
    if (!inventoryItems.length) return;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const currentMonthItems = inventoryItems.filter(item => {
      if (!item.purchase_date) return false;
      const purchaseDate = new Date(item.purchase_date);
      return purchaseDate >= monthStart && purchaseDate <= monthEnd;
    });

    const monthTotal = currentMonthItems.reduce((sum, item) => sum + (item.purchase_cost || 0), 0);
    const allTimeCost = inventoryItems.reduce((sum, item) => sum + (item.purchase_cost || 0), 0);
    const avgCost = inventoryItems.length > 0 ? allTimeCost / inventoryItems.length : 0;

    setMonthlyCost(monthTotal);
    setTotalSpent(allTimeCost);
    setAvgItemCost(avgCost);
  }, [inventoryItems]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        Cost Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">This Month</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">${monthlyCost.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            All time
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Cost/Item</span>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">${avgItemCost.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Per purchase
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="font-medium mb-3">Cost Breakdown by Item</h4>
        <div className="space-y-2">
          {inventoryItems
            .filter(item => item.purchase_cost && item.purchase_cost > 0)
            .sort((a, b) => (b.purchase_cost || 0) - (a.purchase_cost || 0))
            .slice(0, 5)
            .map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.food_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.brand} • {item.quantity_remaining} {item.unit}
                  </p>
                </div>
                <p className="font-semibold">${item.purchase_cost?.toFixed(2)}</p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

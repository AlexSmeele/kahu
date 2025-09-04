import { useState, useMemo, useEffect } from "react";
import { format, subMonths, subYears, startOfDay, differenceInMonths, differenceInYears } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Calendar, Scale, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeightRecord {
  id: string;
  weight: number;
  date: Date;
  notes?: string;
}

interface WeightTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
  dogName: string;
  dogBirthday?: Date;
}

// Mock data - in a real app, this would come from the database
const mockWeightData: WeightRecord[] = [
  { id: "1", weight: 8.2, date: new Date(2024, 0, 15), notes: "First vet visit" },
  { id: "2", weight: 8.8, date: new Date(2024, 1, 15) },
  { id: "3", weight: 9.4, date: new Date(2024, 2, 15) },
  { id: "4", weight: 10.1, date: new Date(2024, 3, 15) },
  { id: "5", weight: 10.8, date: new Date(2024, 4, 15) },
  { id: "6", weight: 11.2, date: new Date(2024, 5, 15) },
  { id: "7", weight: 11.6, date: new Date(2024, 6, 15) },
  { id: "8", weight: 12.0, date: new Date(2024, 7, 15) },
  { id: "9", weight: 12.4, date: new Date(2024, 8, 15) },
];

const TIME_PERIODS = [
  { key: '1m', label: '1 Month', months: 1 },
  { key: '3m', label: '3 Months', months: 3 },
  { key: '6m', label: '6 Months', months: 6 },
  { key: '1y', label: '1 Year', months: 12 },
  { key: '3y', label: '3 Years', months: 36 },
  { key: '5y', label: '5 Years', months: 60 },
  { key: 'all', label: 'All Time', months: Infinity },
];

export function WeightTracker({ isOpen, onClose, currentWeight, dogName, dogBirthday }: WeightTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1y');
  const [showAddWeight, setShowAddWeight] = useState(false);

  // Calculate dog's age and available time periods
  const availablePeriods = useMemo(() => {
    if (!dogBirthday) return TIME_PERIODS;
    
    const dogAgeMonths = differenceInMonths(new Date(), dogBirthday);
    const filteredPeriods = TIME_PERIODS.filter(period => 
      period.months <= dogAgeMonths || period.key === 'all'
    );
    
    return filteredPeriods;
  }, [dogBirthday]);

  // Set default period based on dog age
  const defaultPeriod = useMemo(() => {
    if (!dogBirthday) return '1y';
    
    const dogAgeMonths = differenceInMonths(new Date(), dogBirthday);
    if (dogAgeMonths < 12) {
      // For dogs under 1 year, show maximum available period
      const maxPeriod = availablePeriods[availablePeriods.length - 1];
      return maxPeriod.key;
    }
    return '1y';
  }, [dogBirthday, availablePeriods]);

  // Set default period based on dog age and update when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPeriod(defaultPeriod);
    }
  }, [isOpen, defaultPeriod]);

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    const selectedPeriodConfig = TIME_PERIODS.find(p => p.key === selectedPeriod);
    if (!selectedPeriodConfig || selectedPeriod === 'all') {
      return mockWeightData;
    }

    const cutoffDate = subMonths(new Date(), selectedPeriodConfig.months);
    return mockWeightData.filter(record => record.date >= cutoffDate);
  }, [selectedPeriod]);

  // Prepare chart data
  const chartData = filteredData.map(record => ({
    date: format(record.date, 'MMM dd'),
    weight: record.weight,
    fullDate: record.date,
  }));

  // Calculate weight changes
  const dataWithChanges = filteredData.map((record, index) => {
    const previousRecord = index > 0 ? filteredData[index - 1] : null;
    const change = previousRecord ? record.weight - previousRecord.weight : 0;
    
    return {
      ...record,
      change,
      changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
    };
  });

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary" />
              {dogName}'s Weight History
            </DialogTitle>
            <Button onClick={() => setShowAddWeight(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Weight
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time Period Selector */}
          <div className="flex flex-wrap gap-2">
            {availablePeriods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
                className="text-xs"
              >
                {period.label}
              </Button>
            ))}
          </div>

          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              {/* Current Weight Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card-soft p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{currentWeight} kg</div>
                  <div className="text-sm text-muted-foreground">Current Weight</div>
                </div>
                <div className="card-soft p-4 text-center">
                  <div className="text-lg font-bold text-green-600">
                    {filteredData.length > 0 ? `+${(currentWeight - filteredData[0].weight).toFixed(1)} kg` : '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Change</div>
                </div>
                <div className="card-soft p-4 text-center">
                  <div className="text-lg font-bold text-blue-600">{filteredData.length}</div>
                  <div className="text-sm text-muted-foreground">Records</div>
                </div>
              </div>

              {/* Chart */}
              <div className="card-soft p-4">
                <h3 className="font-semibold mb-4">Weight Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} kg`, 'Weight']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="card-soft">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Weight Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredData.length} records from {selectedPeriod === 'all' ? 'all time' : TIME_PERIODS.find(p => p.key === selectedPeriod)?.label}
                  </p>
                </div>
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-3">
                    {dataWithChanges.reverse().map((record, index) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Scale className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{record.weight} kg</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(record.date, 'MMM dd, yyyy')}
                            </div>
                            {record.notes && (
                              <div className="text-xs text-muted-foreground mt-1">{record.notes}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {record.change !== 0 && (
                            <div className={`flex items-center gap-1 ${getChangeColor(record.changeType)}`}>
                              {getTrendIcon(record.changeType)}
                              <span className="text-sm font-medium">
                                {record.change > 0 ? '+' : ''}{record.change.toFixed(1)} kg
                              </span>
                            </div>
                          )}
                          {record.change === 0 && index !== dataWithChanges.length - 1 && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Minus className="w-4 h-4" />
                              <span className="text-sm">No change</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
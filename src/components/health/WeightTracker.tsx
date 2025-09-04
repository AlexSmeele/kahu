import { useState, useMemo, useEffect } from "react";
import { format, subMonths, differenceInMonths } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Calendar, Scale, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: '3y', label: '3Y', months: 36 },
  { key: '5y', label: '5Y', months: 60 },
  { key: 'all', label: 'All', months: Infinity },
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
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
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
      <DialogContent className="w-[calc(100%-1rem)] max-w-[380px] h-[calc(100%-2rem)] max-h-[560px] overflow-hidden flex flex-col p-3">
        <DialogHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Weight History
            </DialogTitle>
            <Button onClick={() => setShowAddWeight(true)} size="sm" className="h-6 text-xs px-2">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full flex flex-col space-y-2">
            {/* Time Period Selector */}
            <div className="flex flex-wrap gap-1 flex-shrink-0">
              {availablePeriods.map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key)}
                  className="text-xs h-6 px-2"
                >
                  {period.label}
                </Button>
              ))}
            </div>

            <Tabs defaultValue="chart" className="flex-1 min-h-0 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0 h-8">
                <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
                <TabsTrigger value="list" className="text-xs">List</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-2">
                  {/* Current Weight Summary */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="card-soft p-2 text-center">
                      <div className="text-base font-bold text-primary">{currentWeight} kg</div>
                      <div className="text-xs text-muted-foreground">Current</div>
                    </div>
                    <div className="card-soft p-2 text-center">
                      <div className="text-sm font-bold text-green-600">
                        {filteredData.length > 0 ? `+${(currentWeight - filteredData[0].weight).toFixed(1)}` : '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Change</div>
                    </div>
                    <div className="card-soft p-2 text-center">
                      <div className="text-sm font-bold text-blue-600">{filteredData.length}</div>
                      <div className="text-xs text-muted-foreground">Records</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="card-soft p-2">
                    <h3 className="font-semibold mb-2 text-xs">Weight Trend</h3>
                    <div className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            fontSize={8}
                            tick={{ fontSize: 8 }}
                          />
                          <YAxis 
                            fontSize={8}
                            tick={{ fontSize: 8 }}
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
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 2 }}
                            activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="list" className="flex-1 min-h-0 overflow-hidden">
                <div className="card-soft h-full flex flex-col">
                  <div className="p-2 border-b flex-shrink-0">
                    <h3 className="font-semibold text-xs">Weight Records</h3>
                    <p className="text-xs text-muted-foreground">{filteredData.length} records</p>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                    {dataWithChanges.reverse().map((record, index) => (
                      <div key={record.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Scale className="w-3 h-3 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm">{record.weight} kg</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{format(record.date, 'MMM dd')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {record.change !== 0 && (
                            <div className={`flex items-center gap-1 ${getChangeColor(record.changeType)}`}>
                              {getTrendIcon(record.changeType)}
                              <span className="text-xs font-medium">
                                {record.change > 0 ? '+' : ''}{record.change.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
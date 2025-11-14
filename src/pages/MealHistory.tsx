import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, Utensils, Activity, Download, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDogs } from '@/hooks/useDogs';
import { useNutrition } from '@/hooks/useNutrition';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { MealRecord } from '@/hooks/useMealTracking';
import { generateMealCSV, downloadCSV, generatePrintableHTML, printToPDF } from '@/lib/mealExport';

export default function MealHistory() {
  const navigate = useNavigate();
  const { dogId } = useParams();
  const { dogs } = useDogs();
  const currentDog = dogs.find(d => d.id === dogId) || dogs[0];
  const { nutritionPlan } = useNutrition(currentDog?.id || '');
  const { toast } = useToast();
  
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // Days

  useEffect(() => {
    fetchMealHistory();
  }, [currentDog?.id, nutritionPlan?.id, dateRange]);

  const fetchMealHistory = async () => {
    if (!currentDog?.id || !nutritionPlan?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const endDate = new Date();
    const startDate = subDays(endDate, dateRange);

    try {
      const { data, error } = await supabase
        .from('meal_records')
        .select('*')
        .eq('dog_id', currentDog.id)
        .eq('nutrition_plan_id', nutritionPlan.id)
        .gte('scheduled_date', format(startDate, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(endDate, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: false })
        .order('meal_time', { ascending: false });

      if (error) throw error;
      setMealRecords((data || []) as unknown as MealRecord[]);
    } catch (error) {
      console.error('Error fetching meal history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = generateMealCSV(mealRecords, {
        dogName: currentDog?.name || 'Unknown',
        dogBreed: currentDog?.breed?.breed,
        dateRange: `${format(subDays(new Date(), dateRange), 'MMM d, yyyy')} - ${format(new Date(), 'MMM d, yyyy')}`,
        exportDate: format(new Date(), 'MMM d, yyyy h:mm a')
      });

      const filename = `${currentDog?.name || 'dog'}_meal_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvContent, filename);

      toast({
        title: 'CSV Downloaded',
        description: `Meal history exported as ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to export meal history. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = () => {
    try {
      const htmlContent = generatePrintableHTML(mealRecords, {
        dogName: currentDog?.name || 'Unknown',
        dogBreed: currentDog?.breed?.breed,
        dateRange: `${format(subDays(new Date(), dateRange), 'MMM d, yyyy')} - ${format(new Date(), 'MMM d, yyyy')}`,
        exportDate: format(new Date(), 'MMM d, yyyy h:mm a')
      });

      printToPDF(htmlContent);

      toast({
        title: 'PDF Ready',
        description: 'Print dialog opened. Choose "Save as PDF" to export.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unable to export to PDF',
        variant: 'destructive',
      });
    }
  };

  if (!currentDog) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
        <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Meal History</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">No dog found</p>
        </div>
      </div>
    );
  }

  // Analytics calculations
  const completedMeals = mealRecords.filter(m => m.completed_at).length;
  const totalScheduled = mealRecords.length;
  const completionRate = totalScheduled > 0 ? Math.round((completedMeals / totalScheduled) * 100) : 0;
  
  const avgPercentageEaten = mealRecords.filter(m => m.percentage_eaten).length > 0
    ? Math.round(mealRecords.filter(m => m.percentage_eaten).reduce((sum, m) => sum + (m.percentage_eaten || 0), 0) / mealRecords.filter(m => m.percentage_eaten).length)
    : 0;

  const eatingSpeedData = mealRecords.filter(m => m.eating_speed).reduce((acc, m) => {
    const speed = m.eating_speed || 'unknown';
    acc[speed] = (acc[speed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vomitIncidents = mealRecords.filter(m => m.vomited_after).length;
  const beggingBefore = mealRecords.filter(m => m.begged_before).length;
  const beggingAfter = mealRecords.filter(m => m.begged_after).length;

  // Group meals by date for timeline
  const mealsByDate = mealRecords.reduce((acc, meal) => {
    const date = meal.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, MealRecord[]>);

  const StatCard = ({ icon: Icon, label, value, trend, color = "text-primary" }: any) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-${color.split('-')[1]}-500/10 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-xs font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      {/* Header */}
      <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Meal History</h1>
            <p className="text-xs text-muted-foreground">{currentDog.name} • Last {dateRange} days</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="w-4 h-4 mr-2" />
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Print as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Date Range Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[7, 14, 30, 90].map((days) => (
              <Button
                key={days}
                variant={dateRange === days ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(days)}
              >
                {days} days
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading meal history...</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div>
                <h2 className="text-base font-semibold mb-3">Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={CheckCircle2}
                    label="Completion Rate"
                    value={`${completionRate}%`}
                    color="text-green-600"
                  />
                  <StatCard
                    icon={Utensils}
                    label="Avg Eaten"
                    value={`${avgPercentageEaten}%`}
                    color="text-blue-600"
                  />
                  <StatCard
                    icon={Activity}
                    label="Total Meals"
                    value={completedMeals}
                    color="text-purple-600"
                  />
                  <StatCard
                    icon={Calendar}
                    label="Days Tracked"
                    value={Object.keys(mealsByDate).length}
                    color="text-amber-600"
                  />
                </div>
              </div>

              {/* Tabs for different views */}
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Timeline View */}
                <TabsContent value="timeline" className="space-y-4 mt-4">
                  {Object.entries(mealsByDate).length === 0 ? (
                    <Card className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No meal records found</p>
                    </Card>
                  ) : (
                    Object.entries(mealsByDate).map(([date, meals]) => (
                      <Card key={date} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{format(new Date(date), 'EEEE, MMM d')}</h3>
                          <Badge variant={meals.every(m => m.completed_at) ? "default" : "outline"}>
                            {meals.filter(m => m.completed_at).length} / {meals.length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {meals.map((meal) => (
                            <div
                              key={meal.id}
                              className={`p-3 rounded-lg border ${
                                meal.completed_at ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {meal.completed_at ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="font-medium text-sm">{meal.meal_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {meal.meal_time}
                                  </span>
                                </div>
                                {meal.percentage_eaten && (
                                  <Badge variant="outline" className="text-xs">
                                    {meal.percentage_eaten}% eaten
                                  </Badge>
                                )}
                              </div>
                              {meal.completed_at && (
                                <div className="text-xs text-muted-foreground space-y-1">
                                  {meal.eating_speed && (
                                    <p>Speed: <span className="capitalize">{meal.eating_speed}</span></p>
                                  )}
                                  {meal.eating_behavior && (
                                    <p>Behavior: <span className="capitalize">{meal.eating_behavior}</span></p>
                                  )}
                                  {meal.notes && (
                                    <p className="italic mt-1">"{meal.notes}"</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Behaviors View */}
                <TabsContent value="behaviors" className="space-y-4 mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Eating Speed Distribution
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(eatingSpeedData).map(([speed, count]) => (
                        <div key={speed} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{speed}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${(count / completedMeals) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {count} ({Math.round((count / completedMeals) * 100)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Behavioral Patterns</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Begging before meals</span>
                        <Badge>{beggingBefore} times</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Begging after meals</span>
                        <Badge>{beggingAfter} times</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Vomiting incidents</span>
                        <Badge variant={vomitIncidents > 0 ? "destructive" : "outline"}>
                          {vomitIncidents} times
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Insights View */}
                <TabsContent value="insights" className="space-y-4 mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Key Insights
                    </h3>
                    <div className="space-y-3">
                      {completionRate >= 90 && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Excellent meal consistency!</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {currentDog.name} is eating {completionRate}% of scheduled meals regularly.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {avgPercentageEaten < 70 && avgPercentageEaten > 0 && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Low food consumption</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {currentDog.name} is only eating {avgPercentageEaten}% of meals on average. Consider consulting your vet.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {vomitIncidents > 3 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Frequent vomiting detected</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {vomitIncidents} vomiting incidents in {dateRange} days. Please consult your veterinarian.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {beggingBefore > completedMeals * 0.5 && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Frequent begging before meals</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {currentDog.name} begs before {Math.round((beggingBefore / completedMeals) * 100)}% of meals. Consider adjusting meal times or portions.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {eatingSpeedData['very_fast'] > completedMeals * 0.3 && (
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Fast eating pattern</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {currentDog.name} eats very fast frequently. Consider using a slow-feeder bowl to prevent bloating.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Bottom spacing */}
              <div className="h-20" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

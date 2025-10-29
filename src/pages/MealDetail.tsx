import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_MEAL_RECORDS, isMockDogId } from "@/lib/mockData";

export default function MealDetail() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const dogIdFromState = location.state?.dogId;
  const dogIdFromStorage = localStorage.getItem("selectedDogId");
  const dogId = dogIdFromState || dogIdFromStorage;

  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeal = async () => {
      if (!mealId) return;

      // Check mock data first
      if (dogId && isMockDogId(dogId)) {
        const found = MOCK_MEAL_RECORDS.find(m => m.id === mealId);
        if (found) {
          setMeal(found);
        } else {
          navigate(-1);
        }
        setLoading(false);
        return;
      }

      // Fetch from database
      try {
        const { data, error } = await supabase
          .from('meal_records')
          .select('*')
          .eq('id', mealId)
          .single();

        if (error) throw error;
        
        if (data) {
          setMeal(data);
        } else {
          navigate(-1);
        }
      } catch (error) {
        console.error('Error fetching meal:', error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [mealId, dogId, navigate]);

  const handleBack = () => {
    const state = location.state as any;
    const from = state?.from as string | undefined;
    const scrollPosition = state?.scrollPosition;
    
    if (from) {
      navigate(from, { state: { scrollPosition } });
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/?tab=wellness');
    }
  };

  if (loading || !meal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading meal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Meal Details</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{meal.meal_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(meal.scheduled_date), 'MMMM d, yyyy')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Scheduled Time</span>
                </div>
                <p className="font-medium">{meal.meal_time}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {meal.completed_at ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>Status</span>
                </div>
                <p className="font-medium">
                  {meal.completed_at ? 'Fed' : 'Not Fed'}
                </p>
              </div>
            </div>

            {meal.completed_at && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed At</p>
                <p className="font-medium">
                  {format(new Date(meal.completed_at), 'h:mm a')}
                </p>
              </div>
            )}

            {meal.amount_given && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount Given</p>
                <p className="font-medium">{meal.amount_given} cups</p>
              </div>
            )}

            {meal.notes && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{meal.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

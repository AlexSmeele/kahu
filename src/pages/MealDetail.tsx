import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Check, X, Edit3, Trash2, Utensils, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useMealTracking } from "@/hooks/useMealTracking";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_MEAL_RECORDS, isMockDogId } from "@/lib/mockData";

export default function MealDetail() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogIdFromState = location.state?.dogId;
  const dogIdFromStorage = localStorage.getItem("selectedDogId");
  const dogId = dogIdFromState || dogIdFromStorage;

  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    meal_name: "",
    meal_time: "",
    amount_given: 0,
    amount_consumed: 0,
    percentage_eaten: 100,
    eating_behavior: "normal",
    bowl_cleaned_before: false,
    notes: "",
  });

  const { updateMealRecord, deleteMealRecord } = useMealTracking(dogId);

  useEffect(() => {
    const fetchMeal = async () => {
      if (!mealId) return;

      // Check mock data first
      if (dogId && isMockDogId(dogId)) {
        const found = MOCK_MEAL_RECORDS.find(m => m.id === mealId);
        if (found) {
          setMeal(found);
          setEditForm({
            meal_name: found.meal_name || '',
            meal_time: found.meal_time || '',
            amount_given: found.amount_given || 0,
            amount_consumed: found.amount_consumed || 0,
            percentage_eaten: found.percentage_eaten || 100,
            eating_behavior: found.eating_behavior || 'normal',
            bowl_cleaned_before: found.bowl_cleaned_before || false,
            notes: found.notes || '',
          });
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
          setEditForm({
            meal_name: data.meal_name || '',
            meal_time: data.meal_time || '',
            amount_given: data.amount_given || 0,
            amount_consumed: data.amount_consumed || 0,
            percentage_eaten: data.percentage_eaten || 100,
            eating_behavior: data.eating_behavior || 'normal',
            bowl_cleaned_before: data.bowl_cleaned_before || false,
            notes: data.notes || '',
          });
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!mealId || !dogId) return;

    // Handle mock data
    if (isMockDogId(dogId)) {
      toast({
        title: 'Demo mode',
        description: 'Changes are not persisted in demo mode',
      });
      setIsEditing(false);
      return;
    }

    const success = await updateMealRecord(mealId, {
      meal_name: editForm.meal_name,
      meal_time: editForm.meal_time,
      amount_given: editForm.amount_given || undefined,
      amount_consumed: editForm.amount_consumed || undefined,
      percentage_eaten: editForm.percentage_eaten || undefined,
      eating_behavior: editForm.eating_behavior || undefined,
      bowl_cleaned_before: editForm.bowl_cleaned_before,
      notes: editForm.notes || undefined,
    });

    if (success) {
      setIsEditing(false);
      // Refetch meal
      const { data } = await supabase
        .from("meal_records")
        .select("*")
        .eq("id", mealId)
        .single();
      if (data) setMeal(data);
    }
  };

  const handleCancel = () => {
    if (meal) {
      setEditForm({
        meal_name: meal.meal_name || '',
        meal_time: meal.meal_time || '',
        amount_given: meal.amount_given || 0,
        amount_consumed: meal.amount_consumed || 0,
        percentage_eaten: meal.percentage_eaten || 100,
        eating_behavior: meal.eating_behavior || 'normal',
        bowl_cleaned_before: meal.bowl_cleaned_before || false,
        notes: meal.notes || '',
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!mealId || !dogId) return;

    // Handle mock data
    if (isMockDogId(dogId)) {
      toast({
        title: 'Demo mode',
        description: 'Cannot delete meals in demo mode',
      });
      setShowDeleteDialog(false);
      return;
    }

    const success = await deleteMealRecord(mealId);
    if (success) {
      navigate(-1);
    }
  };

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
                <Utensils className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Meal Details</h1>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Meal Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(meal.scheduled_date), 'MMMM d, yyyy')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="meal_name">Meal Name</Label>
                  <Input
                    id="meal_name"
                    value={editForm.meal_name}
                    onChange={(e) => setEditForm({ ...editForm, meal_name: e.target.value })}
                    placeholder="e.g., Breakfast"
                  />
                </div>

                <div>
                  <Label htmlFor="meal_time">Meal Time</Label>
                  <Input
                    id="meal_time"
                    type="time"
                    value={editForm.meal_time}
                    onChange={(e) => setEditForm({ ...editForm, meal_time: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount_given">Amount Given (cups)</Label>
                    <Input
                      id="amount_given"
                      type="number"
                      step="0.1"
                      value={editForm.amount_given}
                      onChange={(e) => setEditForm({ ...editForm, amount_given: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount_consumed">Amount Consumed</Label>
                    <Input
                      id="amount_consumed"
                      type="number"
                      step="0.1"
                      value={editForm.amount_consumed}
                      onChange={(e) => setEditForm({ ...editForm, amount_consumed: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Percentage Eaten: {editForm.percentage_eaten}%</Label>
                  <Slider 
                    value={[editForm.percentage_eaten]} 
                    onValueChange={(value) => setEditForm({ ...editForm, percentage_eaten: value[0] })}
                    max={100} 
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Eating Behavior</Label>
                  <RadioGroup 
                    value={editForm.eating_behavior}
                    onValueChange={(value) => setEditForm({ ...editForm, eating_behavior: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="eager" id="eager" />
                      <Label htmlFor="eager" className="font-normal">Eager - Ate quickly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal" className="font-normal">Normal pace</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reluctant" id="reluctant" />
                      <Label htmlFor="reluctant" className="font-normal">Reluctant - Took time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sniffed_only" id="sniffed" />
                      <Label htmlFor="sniffed" className="font-normal">Sniffed but didn't eat</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="refused" id="refused" />
                      <Label htmlFor="refused" className="font-normal">Completely refused</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bowl_cleaned"
                      checked={editForm.bowl_cleaned_before}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, bowl_cleaned_before: checked as boolean })}
                    />
                    <Label htmlFor="bowl_cleaned" className="font-normal">Bowl cleaned before meal</Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    💡 Food bowls should be cleaned after every meal with hot soapy water
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Add any notes about this meal..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Meal Name</p>
                  <p className="text-2xl font-bold">{meal.meal_name}</p>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  {meal.amount_given && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Amount Given</p>
                      <p className="font-medium">{meal.amount_given} cups</p>
                    </div>
                  )}
                  {meal.amount_consumed && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Amount Consumed</p>
                      <p className="font-medium">{meal.amount_consumed} cups</p>
                    </div>
                  )}
                </div>

                {meal.percentage_eaten !== null && meal.percentage_eaten !== undefined && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Percentage Eaten</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${meal.percentage_eaten}%` }}
                        />
                      </div>
                      <span className="font-medium">{meal.percentage_eaten}%</span>
                    </div>
                  </div>
                )}

                {meal.eating_behavior && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Eating Behavior</p>
                    <p className="font-medium capitalize">{meal.eating_behavior.replace('_', ' ')}</p>
                  </div>
                )}

                {meal.bowl_cleaned_before && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <Droplet className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Bowl was cleaned before this meal</p>
                  </div>
                )}

                {meal.notes && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{meal.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this meal record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Utensils, Edit3, Trash2, Plus, X, Copy } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMealTracking, type MealComponent } from "@/hooks/useMealTracking";
import { useNutrition } from "@/hooks/useNutrition";
import { useFoodInventory } from "@/hooks/useFoodInventory";
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
    eating_speed: "normal",
    food_temperature: "room_temp",
    energy_level_after: "normal",
    begged_before: false,
    begged_after: false,
    vomited_after: false,
    vomit_time_minutes: 0,
    snubbed_items: "",
    bowl_cleaned_before: false,
    notes: "",
  });
  
  const [mealComponents, setMealComponents] = useState<MealComponent[]>([]);

  const { updateMealRecord, deleteMealRecord } = useMealTracking(dogId);
  const { nutritionPlan } = useNutrition(dogId);
  const { inventoryItems, fetchInventoryItems } = useFoodInventory(dogId);

  useEffect(() => {
    if (dogId) {
      fetchInventoryItems();
    }
  }, [dogId, fetchInventoryItems]);

  // Find planned meal from nutrition plan
  const plannedMeal = nutritionPlan?.meal_schedule?.find((m: any) => 
    m.time === meal?.meal_time && m.name === meal?.meal_name
  );

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
            eating_speed: String(found.eating_speed || 'normal'),
            food_temperature: String(found.food_temperature || 'room_temp'),
            energy_level_after: String(found.energy_level_after || 'normal'),
            begged_before: found.begged_before || false,
            begged_after: found.begged_after || false,
            vomited_after: found.vomited_after || false,
            vomit_time_minutes: found.vomit_time_minutes || 0,
            snubbed_items: found.snubbed_items || '',
            bowl_cleaned_before: found.bowl_cleaned_before || false,
            notes: found.notes || '',
          });
          setMealComponents((found as any).meal_components || []);
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
            eating_speed: String(data.eating_speed || 'normal'),
            food_temperature: String(data.food_temperature || 'room_temp'),
            energy_level_after: String(data.energy_level_after || 'normal'),
            begged_before: data.begged_before || false,
            begged_after: data.begged_after || false,
            vomited_after: data.vomited_after || false,
            vomit_time_minutes: data.vomit_time_minutes || 0,
            snubbed_items: String(data.snubbed_items || ''),
            bowl_cleaned_before: data.bowl_cleaned_before || false,
            notes: data.notes || '',
          });
          setMealComponents((data.meal_components as any) || []);
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
      eating_speed: editForm.eating_speed || undefined,
      food_temperature: editForm.food_temperature || undefined,
      energy_level_after: editForm.energy_level_after || undefined,
      begged_before: editForm.begged_before,
      begged_after: editForm.begged_after,
      vomited_after: editForm.vomited_after,
      vomit_time_minutes: editForm.vomited_after ? editForm.vomit_time_minutes : undefined,
      snubbed_items: editForm.snubbed_items || undefined,
      bowl_cleaned_before: editForm.bowl_cleaned_before,
      notes: editForm.notes || undefined,
      meal_components: mealComponents.length > 0 ? mealComponents : undefined,
    });

    if (success) {
      setIsEditing(false);
      const { data } = await supabase
        .from("meal_records")
        .select("*")
        .eq("id", mealId)
        .single();
      if (data) {
        setMeal(data);
        setMealComponents((data.meal_components as any) || []);
      }
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
        eating_speed: String(meal.eating_speed || 'normal'),
        food_temperature: String(meal.food_temperature || 'room_temp'),
        energy_level_after: String(meal.energy_level_after || 'normal'),
        begged_before: meal.begged_before || false,
        begged_after: meal.begged_after || false,
        vomited_after: meal.vomited_after || false,
        vomit_time_minutes: meal.vomit_time_minutes || 0,
        snubbed_items: meal.snubbed_items || '',
        bowl_cleaned_before: meal.bowl_cleaned_before || false,
        notes: meal.notes || '',
      });
      setMealComponents(meal.meal_components || []);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!mealId || !dogId) return;

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

  const handleCopyFromPlan = () => {
    if (plannedMeal?.components && Array.isArray(plannedMeal.components)) {
      setMealComponents(plannedMeal.components);
      toast({
        title: "Copied from plan",
        description: "Meal components copied from nutrition plan",
      });
    } else {
      toast({
        title: "No planned components",
        description: "This meal doesn't have itemized components in the plan",
        variant: "destructive",
      });
    }
  };

  const handleAddComponent = () => {
    setMealComponents([
      ...mealComponents,
      { name: "", amount: 0, unit: "cups", category: "kibble" }
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    setMealComponents(mealComponents.filter((_, i) => i !== index));
  };

  const handleUpdateComponent = (index: number, field: keyof MealComponent, value: any) => {
    const updated = [...mealComponents];
    updated[index] = { ...updated[index], [field]: value };
    setMealComponents(updated);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      kibble: "bg-amber-100 text-amber-800",
      wet: "bg-blue-100 text-blue-800",
      raw: "bg-red-100 text-red-800",
      treats: "bg-purple-100 text-purple-800",
      supplements: "bg-green-100 text-green-800",
      medication: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading || !meal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading meal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{meal.meal_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(meal.scheduled_date), 'MMMM d, yyyy')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Time Scheduled</span>
                    <p className="font-medium text-lg">{meal.meal_time}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Time Served</span>
                    <p className="font-medium text-lg">
                      {meal.completed_at ? format(new Date(meal.completed_at), 'HH:mm') : 'Not served yet'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What Was Served Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>What Was Served</CardTitle>
                {isEditing && plannedMeal?.components && (
                  <Button variant="outline" size="sm" onClick={handleCopyFromPlan}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy from Plan
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {mealComponents.map((component, index) => (
                    <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Item Name</Label>
                            <Input
                              value={component.name}
                              onChange={(e) => handleUpdateComponent(index, "name", e.target.value)}
                              placeholder="Food name"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Brand (optional)</Label>
                            <Input
                              value={component.brand || ""}
                              onChange={(e) => handleUpdateComponent(index, "brand", e.target.value)}
                              placeholder="Brand"
                              className="h-8"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Amount</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={component.amount}
                              onChange={(e) => handleUpdateComponent(index, "amount", parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit</Label>
                            <Select value={component.unit} onValueChange={(v) => handleUpdateComponent(index, "unit", v)}>
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cups">Cups</SelectItem>
                                <SelectItem value="g">Grams</SelectItem>
                                <SelectItem value="ml">ML</SelectItem>
                                <SelectItem value="pieces">Pieces</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Category</Label>
                            <Select value={component.category} onValueChange={(v) => handleUpdateComponent(index, "category", v)}>
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kibble">Kibble</SelectItem>
                                <SelectItem value="wet">Wet Food</SelectItem>
                                <SelectItem value="raw">Raw</SelectItem>
                                <SelectItem value="treats">Treats</SelectItem>
                                <SelectItem value="supplements">Supplements</SelectItem>
                                <SelectItem value="medication">Medication</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveComponent(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddComponent} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              ) : (
                <>
                  {mealComponents.length > 0 ? (
                    <div className="space-y-2">
                      {mealComponents.map((component, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <div>
                            <div className="font-medium">{component.name}</div>
                            {component.brand && <div className="text-xs text-muted-foreground">{component.brand}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{component.amount} {component.unit}</span>
                            <Badge className={getCategoryColor(component.category)}>{component.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No itemized components recorded.
                      {plannedMeal?.components && " Use Edit mode to add items or copy from plan."}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Planned Menu (if available) */}
          {plannedMeal?.components && Array.isArray(plannedMeal.components) && plannedMeal.components.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Planned Menu (from nutrition plan)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plannedMeal.components.map((component: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-secondary/30 rounded text-sm">
                      <div>
                        <div className="font-medium">{component.name}</div>
                        {component.brand && <div className="text-xs text-muted-foreground">{component.brand}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{component.amount} {component.unit}</span>
                        <Badge variant="outline" className="text-xs">{component.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consumption Details */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
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
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount Given</span>
                    <span>{meal.amount_given || 0} cups</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount Consumed</span>
                    <span>{meal.amount_consumed || 0} cups</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Percentage Eaten</span>
                    <span>{meal.percentage_eaten || 0}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Behavior & Observations */}
          <Card>
            <CardHeader>
              <CardTitle>Behavior & Observations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Eating Behavior</Label>
                    <RadioGroup 
                      value={editForm.eating_behavior}
                      onValueChange={(value) => setEditForm({ ...editForm, eating_behavior: value })}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eager" id="eager" />
                        <Label htmlFor="eager" className="font-normal">Eager</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <Label htmlFor="normal" className="font-normal">Normal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reluctant" id="reluctant" />
                        <Label htmlFor="reluctant" className="font-normal">Reluctant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="refused" id="refused" />
                        <Label htmlFor="refused" className="font-normal">Refused</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Eating Speed</Label>
                    <Select value={editForm.eating_speed} onValueChange={(value) => setEditForm({ ...editForm, eating_speed: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Food Temperature</Label>
                    <Select value={editForm.food_temperature} onValueChange={(value) => setEditForm({ ...editForm, food_temperature: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cold">Cold</SelectItem>
                        <SelectItem value="room_temp">Room Temp</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Energy Level After</Label>
                    <Select value={editForm.energy_level_after} onValueChange={(value) => setEditForm({ ...editForm, energy_level_after: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="begged_before"
                        checked={editForm.begged_before}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, begged_before: checked as boolean })}
                      />
                      <Label htmlFor="begged_before" className="font-normal">Begged before meal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="begged_after"
                        checked={editForm.begged_after}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, begged_after: checked as boolean })}
                      />
                      <Label htmlFor="begged_after" className="font-normal">Begged after meal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bowl_cleaned_before"
                        checked={editForm.bowl_cleaned_before}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, bowl_cleaned_before: checked as boolean })}
                      />
                      <Label htmlFor="bowl_cleaned_before" className="font-normal">Bowl cleaned before</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vomited_after"
                        checked={editForm.vomited_after}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, vomited_after: checked as boolean })}
                      />
                      <Label htmlFor="vomited_after" className="font-normal">Vomited after</Label>
                    </div>
                  </div>

                  {editForm.vomited_after && (
                    <div>
                      <Label htmlFor="vomit_time">Time until vomit (minutes)</Label>
                      <Input
                        id="vomit_time"
                        type="number"
                        value={editForm.vomit_time_minutes}
                        onChange={(e) => setEditForm({ ...editForm, vomit_time_minutes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="snubbed_items">Snubbed Items (optional)</Label>
                    <Textarea
                      id="snubbed_items"
                      value={editForm.snubbed_items}
                      onChange={(e) => setEditForm({ ...editForm, snubbed_items: e.target.value })}
                      placeholder="Items the dog refused..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Any additional observations..."
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Eating Behavior</span>
                    <span className="capitalize">{meal.eating_behavior || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Eating Speed</span>
                    <span className="capitalize">{meal.eating_speed || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Food Temperature</span>
                    <span className="capitalize">{meal.food_temperature?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Energy Level After</span>
                    <span className="capitalize">{meal.energy_level_after || 'N/A'}</span>
                  </div>
                  {meal.begged_before && <div className="text-sm">✓ Begged before meal</div>}
                  {meal.begged_after && <div className="text-sm">✓ Begged after meal</div>}
                  {meal.bowl_cleaned_before && <div className="text-sm">✓ Bowl cleaned before</div>}
                  {meal.vomited_after && (
                    <div className="text-sm text-destructive">
                      ⚠ Vomited {meal.vomit_time_minutes} minutes after eating
                    </div>
                  )}
                  {meal.snubbed_items && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">Snubbed Items:</span>
                      <p className="text-sm mt-1">{meal.snubbed_items}</p>
                    </div>
                  )}
                  {meal.notes && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">Notes:</span>
                      <p className="text-sm mt-1">{meal.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Fixed Action Buttons - Within Viewport */}
      {isEditing && (
        <div className="container max-w-2xl mx-auto px-4 py-4 flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The meal record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

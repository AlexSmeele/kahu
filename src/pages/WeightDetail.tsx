import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Scale, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useWeightRecords } from "@/hooks/useWeightRecords";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";

export default function WeightDetail() {
  const { weightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId") || "";
  
  const [weight, setWeight] = useState<any>(null);
  const [previousWeight, setPreviousWeight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    weight: "",
    date: "",
    notes: "",
  });
  
  const { weightRecords, updateWeightRecord, deleteWeightRecord } = useWeightRecords(dogId);
  
  useEffect(() => {
    fetchWeightData();
  }, [weightId, dogId, weightRecords]);
  
  const fetchWeightData = async () => {
    setLoading(true);
    try {
      const sortedRecords = [...weightRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const currentIndex = sortedRecords.findIndex((w) => w.id === weightId);
      
      if (currentIndex !== -1) {
        const found = sortedRecords[currentIndex];
        setWeight(found);
        setEditForm({
          weight: found.weight.toString(),
          date: found.date,
          notes: found.notes || "",
        });
        
        if (currentIndex > 0) {
          setPreviousWeight(sortedRecords[currentIndex - 1]);
        }
      } else {
        toast({
          title: "Weight record not found",
          description: "The requested weight record could not be found.",
          variant: "destructive",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching weight record:", error);
      toast({
        title: "Error",
        description: "Failed to load weight record.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    if (isMockDogId(dogId)) {
      toast({
        title: "Demo Mode",
        description: "Editing is disabled for demo dogs.",
      });
      return;
    }
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    if (!editForm.weight || !editForm.date) {
      toast({
        title: "Error",
        description: "Weight and date are required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateWeightRecord(weightId!, parseFloat(editForm.weight), editForm.date, editForm.notes);
      setWeight({ ...weight, weight: parseFloat(editForm.weight), date: editForm.date, notes: editForm.notes });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Weight record updated successfully.",
      });
    } catch (error) {
      console.error("Error updating weight record:", error);
      toast({
        title: "Error",
        description: "Failed to update weight record.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = () => {
    setEditForm({
      weight: weight.weight.toString(),
      date: weight.date,
      notes: weight.notes || "",
    });
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    if (isMockDogId(dogId)) {
      toast({
        title: "Demo Mode",
        description: "Deleting is disabled for demo dogs.",
      });
      setShowDeleteDialog(false);
      return;
    }
    
    try {
      await deleteWeightRecord(weightId!);
      toast({
        title: "Success",
        description: "Weight record deleted successfully.",
      });
      handleBack();
    } catch (error) {
      console.error("Error deleting weight record:", error);
      toast({
        title: "Error",
        description: "Failed to delete weight record.",
        variant: "destructive",
      });
    }
  };
  
  const handleBack = () => {
    const from = location.state?.from;
    if (from) {
      navigate(from);
    } else {
      navigate(-1);
    }
  };
  
  const calculateChange = () => {
    if (!previousWeight) return null;
    
    const change = weight.weight - previousWeight.weight;
    const percentageChange = ((change / previousWeight.weight) * 100).toFixed(1);
    
    return { change: change.toFixed(1), percentage: percentageChange };
  };
  
  const getTrendIcon = () => {
    const change = calculateChange();
    if (!change) return <Minus className="h-5 w-5 text-muted-foreground" />;
    
    if (parseFloat(change.change) > 0) {
      return <TrendingUp className="h-5 w-5 text-orange-600" />;
    } else if (parseFloat(change.change) < 0) {
      return <TrendingDown className="h-5 w-5 text-blue-600" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!weight) return null;
  
  const change = calculateChange();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Weight Record</h1>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="icon" onClick={handleEdit}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date Recorded</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{format(new Date(weight.date), "MMMM d, yyyy")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Weight Details */}
        <Card>
          <CardHeader>
            <CardTitle>Weight Measurement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  placeholder="Enter weight in kg"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scale className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-3xl font-bold">{weight.weight} kg</p>
                    <p className="text-sm text-muted-foreground">{(weight.weight * 2.205).toFixed(1)} lbs</p>
                  </div>
                </div>
                {getTrendIcon()}
              </div>
            )}
            
            {!isEditing && change && (
              <div className="p-4 bg-muted rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Change from previous record</p>
                <p className={`text-lg font-semibold ${parseFloat(change.change) > 0 ? 'text-orange-600' : parseFloat(change.change) < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                  {parseFloat(change.change) > 0 ? '+' : ''}{change.change} kg ({parseFloat(change.percentage) > 0 ? '+' : ''}{change.percentage}%)
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Notes</Label>
              {isEditing ? (
                <Textarea
                  placeholder="Add any notes about this weight measurement..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              ) : (
                weight.notes && <p className="text-sm text-muted-foreground">{weight.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weight Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this weight record? This action cannot be undone.
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

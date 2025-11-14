import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useInjuries } from "@/hooks/useInjuries";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";

export default function InjuryDetail() {
  const { injuryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId") || "";
  
  const [injury, setInjury] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    description: "",
    notes: "",
  });
  
  const { injuries, updateInjury, deleteInjury } = useInjuries(dogId);
  
  useEffect(() => {
    fetchInjuryData();
  }, [injuryId, dogId, injuries]);
  
  const fetchInjuryData = async () => {
    setLoading(true);
    try {
      const found = injuries.find((i) => i.id === injuryId);
      if (found) {
        setInjury(found);
        setEditForm({
          title: found.title,
          date: found.date,
          description: found.description || "",
          notes: found.notes || "",
        });
      } else {
        toast({
          title: "Injury not found",
          description: "The requested injury record could not be found.",
          variant: "destructive",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching injury:", error);
      toast({
        title: "Error",
        description: "Failed to load injury details.",
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
    if (!editForm.title || !editForm.date) {
      toast({
        title: "Error",
        description: "Injury type and date are required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateInjury(injuryId!, {
        title: editForm.title,
        date: editForm.date,
        description: editForm.description,
        notes: editForm.notes,
      });
      setInjury({ ...injury, ...editForm });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Injury updated successfully.",
      });
    } catch (error) {
      console.error("Error updating injury:", error);
      toast({
        title: "Error",
        description: "Failed to update injury.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = () => {
    setEditForm({
      title: injury.title,
      date: injury.date,
      description: injury.description || "",
      notes: injury.notes || "",
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
      await deleteInjury(injuryId!);
      toast({
        title: "Success",
        description: "Injury deleted successfully.",
      });
      handleBack();
    } catch (error) {
      console.error("Error deleting injury:", error);
      toast({
        title: "Error",
        description: "Failed to delete injury.",
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
  
  if (!injury) return null;
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b safe-top">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h1 className="text-xl font-semibold">Injury Details</h1>
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
                <p className="text-sm text-muted-foreground">Date of Injury</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{format(new Date(injury.date), "MMMM d, yyyy")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Injury Details */}
        <Card>
          <CardHeader>
            <CardTitle>Injury Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label>Injury Type *</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="e.g., Cut, Sprain, Bite"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="How did it occur? What treatment was provided?"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Recovery Notes</Label>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Recovery progress, follow-up care..."
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Injury Type</p>
                  <p className="text-lg font-semibold">{injury.title}</p>
                </div>
                
                {injury.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{injury.description}</p>
                  </div>
                )}
                
                {injury.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Recovery Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{injury.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Injury</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this injury record? This action cannot be undone.
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

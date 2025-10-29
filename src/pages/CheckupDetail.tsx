import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, ClipboardCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useHealthCheckups } from "@/hooks/useHealthCheckups";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";
import { Slider } from "@/components/ui/slider";

export default function CheckupDetail() {
  const { checkupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId") || "";
  
  const [checkup, setCheckup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    checkup_date: "",
    ear_condition: "",
    ear_notes: "",
    eye_condition: "",
    eye_notes: "",
    skin_condition: "",
    skin_notes: "",
    body_condition_score: 3,
    lumps_found: false,
    lump_notes: "",
    behavior_changes: "",
    overall_notes: "",
  });
  
  const { checkups, updateCheckup, deleteCheckup } = useHealthCheckups(dogId);
  
  useEffect(() => {
    fetchCheckupData();
  }, [checkupId, dogId, checkups]);
  
  const fetchCheckupData = async () => {
    setLoading(true);
    try {
      const found = checkups.find((c) => c.id === checkupId);
      if (found) {
        setCheckup(found);
        setEditForm({
          checkup_date: found.checkup_date,
          ear_condition: found.ear_condition || "",
          ear_notes: found.ear_notes || "",
          eye_condition: found.eye_condition || "",
          eye_notes: found.eye_notes || "",
          skin_condition: found.skin_condition || "",
          skin_notes: found.skin_notes || "",
          body_condition_score: found.body_condition_score || 3,
          lumps_found: found.lumps_found || false,
          lump_notes: found.lump_notes || "",
          behavior_changes: found.behavior_changes || "",
          overall_notes: found.overall_notes || "",
        });
      } else {
        toast({
          title: "Checkup not found",
          description: "The requested checkup could not be found.",
          variant: "destructive",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching checkup:", error);
      toast({
        title: "Error",
        description: "Failed to load checkup details.",
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
    try {
      await updateCheckup(checkupId!, editForm);
      setCheckup({ ...checkup, ...editForm });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Checkup updated successfully.",
      });
    } catch (error) {
      console.error("Error updating checkup:", error);
      toast({
        title: "Error",
        description: "Failed to update checkup.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = () => {
    setEditForm({
      checkup_date: checkup.checkup_date,
      ear_condition: checkup.ear_condition || "",
      ear_notes: checkup.ear_notes || "",
      eye_condition: checkup.eye_condition || "",
      eye_notes: checkup.eye_notes || "",
      skin_condition: checkup.skin_condition || "",
      skin_notes: checkup.skin_notes || "",
      body_condition_score: checkup.body_condition_score || 3,
      lumps_found: checkup.lumps_found || false,
      lump_notes: checkup.lump_notes || "",
      behavior_changes: checkup.behavior_changes || "",
      overall_notes: checkup.overall_notes || "",
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
      await deleteCheckup(checkupId!);
      toast({
        title: "Success",
        description: "Checkup deleted successfully.",
      });
      handleBack();
    } catch (error) {
      console.error("Error deleting checkup:", error);
      toast({
        title: "Error",
        description: "Failed to delete checkup.",
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
  
  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score === 3) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getScoreLabel = (score: number) => {
    const labels = ["Poor", "Below Average", "Average", "Good", "Excellent"];
    return labels[score - 1] || "Average";
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
  
  if (!checkup) return null;
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ClipboardCheck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Health Checkup</h1>
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
                <p className="text-sm text-muted-foreground">Checkup Date</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.checkup_date}
                    onChange={(e) => setEditForm({ ...editForm, checkup_date: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{format(new Date(checkup.checkup_date), "MMMM d, yyyy")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Checkup Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Health Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Body Condition */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Body Condition Score</Label>
                <span className={`text-sm font-medium ${getScoreColor(isEditing ? editForm.body_condition_score : checkup.body_condition_score || 3)}`}>
                  {isEditing ? editForm.body_condition_score : checkup.body_condition_score || 3}/5
                </span>
              </div>
              {isEditing && (
                <Slider
                  value={[editForm.body_condition_score]}
                  onValueChange={(value) => setEditForm({ ...editForm, body_condition_score: value[0] })}
                  min={1}
                  max={5}
                  step={1}
                />
              )}
            </div>
            
            {/* Skin & Coat */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Skin & Coat</Label>
                <span className={`text-sm font-medium ${getScoreColor(isEditing ? editForm.skin_coat_score : checkup.skin_coat_score)}`}>
                  {getScoreLabel(isEditing ? editForm.skin_coat_score : checkup.skin_coat_score)} ({isEditing ? editForm.skin_coat_score : checkup.skin_coat_score}/5)
                </span>
              </div>
              {isEditing ? (
                <>
                  <Slider
                    value={[editForm.skin_coat_score]}
                    onValueChange={(value) => setEditForm({ ...editForm, skin_coat_score: value[0] })}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <Textarea
                    placeholder="Notes about skin and coat..."
                    value={editForm.skin_coat_notes}
                    onChange={(e) => setEditForm({ ...editForm, skin_coat_notes: e.target.value })}
                  />
                </>
              ) : (
                checkup.skin_coat_notes && <p className="text-sm text-muted-foreground">{checkup.skin_coat_notes}</p>
              )}
            </div>
            
            {/* Body Condition */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Body Condition</Label>
                <span className={`text-sm font-medium ${getScoreColor(isEditing ? editForm.body_condition_score : checkup.body_condition_score)}`}>
                  {getScoreLabel(isEditing ? editForm.body_condition_score : checkup.body_condition_score)} ({isEditing ? editForm.body_condition_score : checkup.body_condition_score}/5)
                </span>
              </div>
              {isEditing ? (
                <>
                  <Slider
                    value={[editForm.body_condition_score]}
                    onValueChange={(value) => setEditForm({ ...editForm, body_condition_score: value[0] })}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <Textarea
                    placeholder="Notes about body condition..."
                    value={editForm.body_condition_notes}
                    onChange={(e) => setEditForm({ ...editForm, body_condition_notes: e.target.value })}
                  />
                </>
              ) : (
                checkup.body_condition_notes && <p className="text-sm text-muted-foreground">{checkup.body_condition_notes}</p>
              )}
            </div>
            
            {/* Teeth & Gums */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Teeth & Gums</Label>
                <span className={`text-sm font-medium ${getScoreColor(isEditing ? editForm.teeth_gums_score : checkup.teeth_gums_score)}`}>
                  {getScoreLabel(isEditing ? editForm.teeth_gums_score : checkup.teeth_gums_score)} ({isEditing ? editForm.teeth_gums_score : checkup.teeth_gums_score}/5)
                </span>
              </div>
              {isEditing ? (
                <>
                  <Slider
                    value={[editForm.teeth_gums_score]}
                    onValueChange={(value) => setEditForm({ ...editForm, teeth_gums_score: value[0] })}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <Textarea
                    placeholder="Notes about teeth and gums..."
                    value={editForm.teeth_gums_notes}
                    onChange={(e) => setEditForm({ ...editForm, teeth_gums_notes: e.target.value })}
                  />
                </>
              ) : (
                checkup.teeth_gums_notes && <p className="text-sm text-muted-foreground">{checkup.teeth_gums_notes}</p>
              )}
            </div>
            
            {/* Behavior & Energy */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Behavior & Energy</Label>
                <span className={`text-sm font-medium ${getScoreColor(isEditing ? editForm.behavior_energy_score : checkup.behavior_energy_score)}`}>
                  {getScoreLabel(isEditing ? editForm.behavior_energy_score : checkup.behavior_energy_score)} ({isEditing ? editForm.behavior_energy_score : checkup.behavior_energy_score}/5)
                </span>
              </div>
              {isEditing ? (
                <>
                  <Slider
                    value={[editForm.behavior_energy_score]}
                    onValueChange={(value) => setEditForm({ ...editForm, behavior_energy_score: value[0] })}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <Textarea
                    placeholder="Notes about behavior and energy..."
                    value={editForm.behavior_energy_notes}
                    onChange={(e) => setEditForm({ ...editForm, behavior_energy_notes: e.target.value })}
                  />
                </>
              ) : (
                checkup.behavior_energy_notes && <p className="text-sm text-muted-foreground">{checkup.behavior_energy_notes}</p>
              )}
            </div>
            
            {/* Lumps & Bumps */}
            <div className="space-y-2">
              <Label>Lumps & Bumps</Label>
              {isEditing ? (
                <Textarea
                  placeholder="Any lumps or bumps found..."
                  value={editForm.lumps_bumps_notes}
                  onChange={(e) => setEditForm({ ...editForm, lumps_bumps_notes: e.target.value })}
                />
              ) : (
                checkup.lumps_bumps_notes && <p className="text-sm text-muted-foreground">{checkup.lumps_bumps_notes}</p>
              )}
            </div>
            
            {/* Overall Notes */}
            <div className="space-y-2">
              <Label>Overall Notes</Label>
              {isEditing ? (
                <Textarea
                  placeholder="General observations..."
                  value={editForm.overall_notes}
                  onChange={(e) => setEditForm({ ...editForm, overall_notes: e.target.value })}
                />
              ) : (
                checkup.overall_notes && <p className="text-sm text-muted-foreground">{checkup.overall_notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checkup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this health checkup? This action cannot be undone.
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

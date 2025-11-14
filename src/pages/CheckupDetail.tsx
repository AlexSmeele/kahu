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
import { Checkbox } from "@/components/ui/checkbox";

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
      navigate(-1);
    } catch (error) {
      console.error("Error deleting checkup:", error);
      toast({
        title: "Error",
        description: "Failed to delete checkup.",
        variant: "destructive",
      });
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score === 3) return "text-yellow-600";
    return "text-red-600";
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b safe-top">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
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
        
        <Card>
          <CardHeader>
            <CardTitle>Health Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Body Condition Score */}
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
            
            {/* Ears */}
            <div className="space-y-2">
              <Label>Ear Condition</Label>
              {isEditing ? (
                <>
                  <Input
                    placeholder="e.g., Normal, Clean"
                    value={editForm.ear_condition}
                    onChange={(e) => setEditForm({ ...editForm, ear_condition: e.target.value })}
                  />
                  <Textarea
                    placeholder="Notes about ears..."
                    value={editForm.ear_notes}
                    onChange={(e) => setEditForm({ ...editForm, ear_notes: e.target.value })}
                  />
                </>
              ) : (
                <>
                  {checkup.ear_condition && <p className="text-sm">{checkup.ear_condition}</p>}
                  {checkup.ear_notes && <p className="text-sm text-muted-foreground">{checkup.ear_notes}</p>}
                </>
              )}
            </div>
            
            {/* Eyes */}
            <div className="space-y-2">
              <Label>Eye Condition</Label>
              {isEditing ? (
                <>
                  <Input
                    placeholder="e.g., Clear, Bright"
                    value={editForm.eye_condition}
                    onChange={(e) => setEditForm({ ...editForm, eye_condition: e.target.value })}
                  />
                  <Textarea
                    placeholder="Notes about eyes..."
                    value={editForm.eye_notes}
                    onChange={(e) => setEditForm({ ...editForm, eye_notes: e.target.value })}
                  />
                </>
              ) : (
                <>
                  {checkup.eye_condition && <p className="text-sm">{checkup.eye_condition}</p>}
                  {checkup.eye_notes && <p className="text-sm text-muted-foreground">{checkup.eye_notes}</p>}
                </>
              )}
            </div>
            
            {/* Skin */}
            <div className="space-y-2">
              <Label>Skin Condition</Label>
              {isEditing ? (
                <>
                  <Input
                    placeholder="e.g., Healthy, No issues"
                    value={editForm.skin_condition}
                    onChange={(e) => setEditForm({ ...editForm, skin_condition: e.target.value })}
                  />
                  <Textarea
                    placeholder="Notes about skin..."
                    value={editForm.skin_notes}
                    onChange={(e) => setEditForm({ ...editForm, skin_notes: e.target.value })}
                  />
                </>
              ) : (
                <>
                  {checkup.skin_condition && <p className="text-sm">{checkup.skin_condition}</p>}
                  {checkup.skin_notes && <p className="text-sm text-muted-foreground">{checkup.skin_notes}</p>}
                </>
              )}
            </div>
            
            {/* Lumps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Checkbox
                      checked={editForm.lumps_found}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, lumps_found: checked as boolean })}
                    />
                    <Label>Lumps or bumps found</Label>
                  </>
                ) : (
                  <>
                    <Label>Lumps Found:</Label>
                    <span className="text-sm">{checkup.lumps_found ? "Yes" : "No"}</span>
                  </>
                )}
              </div>
              {(isEditing || checkup.lump_notes) && (
                isEditing ? (
                  <Textarea
                    placeholder="Details about any lumps..."
                    value={editForm.lump_notes}
                    onChange={(e) => setEditForm({ ...editForm, lump_notes: e.target.value })}
                  />
                ) : (
                  checkup.lump_notes && <p className="text-sm text-muted-foreground">{checkup.lump_notes}</p>
                )
              )}
            </div>
            
            {/* Behavior Changes */}
            <div className="space-y-2">
              <Label>Behavior Changes</Label>
              {isEditing ? (
                <Textarea
                  placeholder="Any behavioral observations..."
                  value={editForm.behavior_changes}
                  onChange={(e) => setEditForm({ ...editForm, behavior_changes: e.target.value })}
                />
              ) : (
                checkup.behavior_changes && <p className="text-sm">{checkup.behavior_changes}</p>
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
                checkup.overall_notes && <p className="text-sm">{checkup.overall_notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
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

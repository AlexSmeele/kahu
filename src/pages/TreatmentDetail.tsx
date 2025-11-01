import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Pill, Calendar, Check, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMedicalTreatments } from "@/hooks/useMedicalTreatments";
import { format, addWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";
import { CompleteTreatmentModal } from "@/components/health/CompleteTreatmentModal";
import { VetClinicAutocomplete } from "@/components/ui/vet-clinic-autocomplete";

export default function TreatmentDetail() {
  const { treatmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId") || "";
  
  const [treatment, setTreatment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedVetClinic, setSelectedVetClinic] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    treatment_name: "",
    last_administered_date: "",
    frequency_weeks: "",
    next_due_date: "",
    notes: "",
    vet_clinic_id: "",
  });
  
  const { treatments, loading: treatmentsLoading, updateTreatment, deleteTreatment } = useMedicalTreatments(dogId);
  
  useEffect(() => {
    fetchTreatmentData();
  }, [treatmentId, dogId, treatments]);
  
  const fetchTreatmentData = async () => {
    // Wait for treatments to finish loading before checking
    if (treatmentsLoading) {
      setLoading(true);
      return;
    }
    
    setLoading(true);
    try {
      const found = treatments.find((t) => t.id === treatmentId);
      if (found) {
        setTreatment(found);
        setSelectedVetClinic((found as any).vet_clinic || null);
        setEditForm({
          treatment_name: found.treatment_name,
          last_administered_date: found.last_administered_date,
          frequency_weeks: found.frequency_weeks?.toString() || "",
          next_due_date: found.next_due_date || "",
          notes: found.notes || "",
          vet_clinic_id: found.vet_clinic_id || "",
        });
      } else if (!treatmentsLoading) {
        // Only show error if data has finished loading and still not found
        toast({
          title: "Treatment not found",
          description: "The requested treatment could not be found.",
          variant: "destructive",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching treatment:", error);
      toast({
        title: "Error",
        description: "Failed to load treatment details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!editForm.treatment_name || !editForm.last_administered_date) {
      toast({
        title: "Error",
        description: "Treatment name and date are required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateTreatment(treatmentId!, {
        treatment_name: editForm.treatment_name,
        last_administered_date: editForm.last_administered_date,
        frequency_weeks: editForm.frequency_weeks ? parseInt(editForm.frequency_weeks) : undefined,
        next_due_date: editForm.next_due_date || undefined,
        notes: editForm.notes,
        vet_clinic_id: selectedVetClinic?.id || null,
      });
      setTreatment({ ...treatment, ...editForm, vet_clinic: selectedVetClinic });
      setIsEditing(false);
      toast({ title: "Success", description: "Treatment updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update treatment.", variant: "destructive" });
    }
  };
  
  const handleComplete = async (completionDateTime: Date) => {
    if (isMockDogId(dogId)) {
      toast({ title: "Demo Mode", description: "Completing treatments is disabled for demo dogs." });
      return;
    }

    try {
      // Calculate next due date if frequency is set
      let nextDueDate = null;
      if (treatment.frequency_weeks) {
        nextDueDate = addWeeks(completionDateTime, treatment.frequency_weeks).toISOString();
      }

      await updateTreatment(treatmentId!, {
        last_administered_date: completionDateTime.toISOString(),
        next_due_date: nextDueDate,
      });

      toast({
        title: "Treatment Completed",
        description: `${treatment.treatment_name} marked as completed on ${format(completionDateTime, "PPP 'at' p")}`,
      });

      // Refresh treatment data
      const updated = treatments.find((t) => t.id === treatmentId);
      if (updated) {
        setTreatment(updated);
        setEditForm({
          treatment_name: updated.treatment_name,
          last_administered_date: updated.last_administered_date,
          frequency_weeks: updated.frequency_weeks?.toString() || "",
          next_due_date: updated.next_due_date || "",
          notes: updated.notes || "",
          vet_clinic_id: updated.vet_clinic_id || "",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete treatment.", variant: "destructive" });
    }
  };

  const handleCancel = async () => {
    if (isMockDogId(dogId)) {
      toast({ title: "Demo Mode", description: "Canceling treatments is disabled for demo dogs." });
      setShowCancelDialog(false);
      return;
    }
    try {
      await deleteTreatment(treatmentId!);
      toast({ title: "Success", description: "Treatment schedule canceled." });
      navigate(-1);
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel treatment.", variant: "destructive" });
    }
  };
  
  const handleDelete = async () => {
    if (isMockDogId(dogId)) {
      toast({ title: "Demo Mode", description: "Deleting is disabled for demo dogs." });
      setShowDeleteDialog(false);
      return;
    }
    try {
      await deleteTreatment(treatmentId!);
      toast({ title: "Success", description: "Treatment deleted successfully." });
      navigate(-1);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete treatment.", variant: "destructive" });
    }
  };
  
  if (loading) return <div className="min-h-screen bg-background pb-20"><div className="container max-w-2xl mx-auto px-4 py-6"><div className="animate-pulse space-y-4"><div className="h-12 bg-muted rounded"></div></div></div></div>;
  if (!treatment) return null;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => {
              const from = location.state?.from || '/?tab=wellness';
              navigate(from);
            }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Pill className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Treatment Details</h1>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}><Edit3 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}><Trash2 className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Last Administered</p>
                {isEditing ? (
                  <Input type="date" value={editForm.last_administered_date} onChange={(e) => setEditForm({ ...editForm, last_administered_date: e.target.value })} />
                ) : (
                  <p className="font-medium">{format(new Date(treatment.last_administered_date), "MMMM d, yyyy")}</p>
                )}
              </div>
            </div>
            {treatment.next_due_date && !isEditing && (
              <div className="mt-4 pt-4 border-t flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Due</p>
                  <p className="font-medium">{format(new Date(treatment.next_due_date), "MMMM d, yyyy")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Treatment Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2"><Label>Treatment Name *</Label><Input value={editForm.treatment_name} onChange={(e) => setEditForm({ ...editForm, treatment_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Frequency (weeks)</Label><Input type="number" value={editForm.frequency_weeks} onChange={(e) => setEditForm({ ...editForm, frequency_weeks: e.target.value })} /></div>
                <div className="space-y-2"><Label>Next Due Date</Label><Input type="date" value={editForm.next_due_date} onChange={(e) => setEditForm({ ...editForm, next_due_date: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Veterinary Clinic</Label>
                  <VetClinicAutocomplete
                    value={selectedVetClinic}
                    onChange={setSelectedVetClinic}
                    placeholder="Search for clinic..."
                  />
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
              </>
            ) : (
              <>
                <div><p className="text-sm text-muted-foreground">Treatment</p><p className="text-lg font-semibold">{treatment.treatment_name}</p></div>
                {treatment.frequency_weeks && <div><p className="text-sm text-muted-foreground">Frequency</p><p className="font-medium">Every {treatment.frequency_weeks} weeks</p></div>}
                {treatment.vet_clinic && (
                  <div>
                    <p className="text-sm text-muted-foreground">Veterinary Clinic</p>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{treatment.vet_clinic.name}</p>
                        <p className="text-sm text-muted-foreground">{treatment.vet_clinic.address}</p>
                        {treatment.vet_clinic.phone && (
                          <p className="text-sm text-muted-foreground">{treatment.vet_clinic.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {treatment.notes && <div><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm">{treatment.notes}</p></div>}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
      
      {/* Sticky Bottom Action Buttons */}
      {!isEditing && (
        <div className="sticky bottom-0 left-0 right-0 z-10 bg-background border-t">
          <div className="container max-w-2xl mx-auto px-4 py-4 safe-bottom">
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCancelDialog(true)} 
                variant="outline" 
                className="flex-1"
                size="lg"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={() => setShowCompleteModal(true)} 
                className="flex-1"
                size="lg"
              >
                <Check className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      <CompleteTreatmentModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        treatmentName={treatment?.treatment_name || ""}
        onComplete={handleComplete}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Treatment Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this treatment schedule? This will remove the treatment from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Schedule</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Cancel Schedule</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Treatment</AlertDialogTitle><AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

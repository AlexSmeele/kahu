import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Heart, Pill, Calendar, Check, Clock, FileText, CheckCircle, BookOpen, AlertTriangle } from "lucide-react";
import { useDevicePreview } from "@/preview/DevicePreviewProvider";
import { IOSStatusBar } from "@/components/headers/IOSStatusBar";
import { DynamicIsland } from "@/components/headers/DynamicIsland";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMedicalTreatments } from "@/hooks/useMedicalTreatments";
import { format, addWeeks, isPast, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";
import { CompleteTreatmentModal } from "@/components/health/CompleteTreatmentModal";
import { VetClinicAutocomplete } from "@/components/ui/vet-clinic-autocomplete";

export default function TreatmentDetail() {
  const { treatmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isMobileDevice } = useDevicePreview();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId") || "";
  
  const [treatment, setTreatment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
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
        setRescheduleDate(found.next_due_date || "");
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

  const handleReschedule = async () => {
    if (isMockDogId(dogId)) {
      toast({ title: "Demo Mode", description: "Rescheduling is disabled for demo dogs." });
      setShowRescheduleDialog(false);
      return;
    }
    
    if (!rescheduleDate) {
      toast({ title: "Error", description: "Please select a date.", variant: "destructive" });
      return;
    }

    try {
      await updateTreatment(treatmentId!, {
        next_due_date: rescheduleDate,
      });
      toast({ title: "Success", description: "Treatment rescheduled successfully." });
      setShowRescheduleDialog(false);
      
      const updated = treatments.find((t) => t.id === treatmentId);
      if (updated) {
        setTreatment(updated);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reschedule treatment.", variant: "destructive" });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  if (!treatment) return null;
  
  // Check if treatment is overdue
  const isOverdue = treatment.next_due_date && isPast(new Date(treatment.next_due_date)) && !isToday(new Date(treatment.next_due_date));
  
  // Get frequency text
  const getFrequencyText = () => {
    if (!treatment.frequency_weeks) return "As needed";
    if (treatment.frequency_weeks === 4) return "Monthly";
    if (treatment.frequency_weeks === 12) return "Quarterly";
    if (treatment.frequency_weeks === 52) return "Yearly";
    return `Every ${treatment.frequency_weeks} weeks`;
  };

  // If editing, show edit modal
  if (isEditing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
          {!isMobileDevice && (
            <div className="relative h-[54px]">
              <DynamicIsland />
              <IOSStatusBar />
            </div>
          )}
          {isMobileDevice && <div className="safe-top" />}
          
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(false)}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Edit Treatment</h1>
              <div className="w-10" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6 pb-40">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Treatment Name *</Label>
                  <Input 
                    value={editForm.treatment_name} 
                    onChange={(e) => setEditForm({ ...editForm, treatment_name: e.target.value })} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Last Administered *</Label>
                  <Input 
                    type="date" 
                    value={editForm.last_administered_date} 
                    onChange={(e) => setEditForm({ ...editForm, last_administered_date: e.target.value })} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Frequency (weeks)</Label>
                  <Input 
                    type="number" 
                    value={editForm.frequency_weeks} 
                    onChange={(e) => setEditForm({ ...editForm, frequency_weeks: e.target.value })} 
                    placeholder="e.g. 4 for monthly"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Next Due Date</Label>
                  <Input 
                    type="date" 
                    value={editForm.next_due_date} 
                    onChange={(e) => setEditForm({ ...editForm, next_due_date: e.target.value })} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Veterinary Clinic</Label>
                  <VetClinicAutocomplete
                    value={selectedVetClinic}
                    onChange={setSelectedVetClinic}
                    placeholder="Search for clinic..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={editForm.notes} 
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} 
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 z-10 bg-background border-t">
          <div className="container max-w-2xl mx-auto px-4 py-4 safe-bottom">
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline" 
                className="flex-1"
                size="lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1"
                size="lg"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // View mode
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        {!isMobileDevice && (
          <div className="relative h-[54px]">
            <DynamicIsland />
            <IOSStatusBar />
          </div>
        )}
        {isMobileDevice && <div className="safe-top" />}
        
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                const from = location.state?.from || '/?tab=wellness';
                navigate(from);
              }}
              className="rounded-full flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Heart className="h-6 w-6 text-secondary fill-secondary" />
              <h1 className="text-xl font-semibold truncate">{treatment.treatment_name}</h1>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditing(true)}
              className="rounded-full flex-shrink-0"
            >
              <Edit3 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-4 pb-40">
          
          {/* Due Date Card */}
          {treatment.next_due_date && (
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-secondary/20">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                    <p className="text-2xl font-semibold">
                      {format(new Date(treatment.next_due_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  {isOverdue && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details Grid */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Last Given */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-full bg-primary/20">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-0.5">Last Given</p>
                    <p className="font-semibold truncate">
                      {format(new Date(treatment.last_administered_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Frequency */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-full bg-primary/20">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-0.5">Frequency</p>
                    <p className="font-semibold truncate">{getFrequencyText()}</p>
                  </div>
                </div>

                {/* Dosage */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-full bg-primary/20">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-0.5">Dosage</p>
                    <p className="font-semibold truncate">As prescribed</p>
                  </div>
                </div>

                {/* Brand/Type */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-full bg-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-0.5">Brand/Type</p>
                    <p className="font-semibold truncate">{treatment.treatment_name}</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {treatment.notes && (
                <>
                  <div className="my-6 border-t" />
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-full bg-primary/20">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm leading-relaxed">{treatment.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Vet Clinic Button */}
          {treatment.vet_clinic && (
            <Button 
              variant="outline" 
              className="w-full h-auto py-4 justify-start gap-3"
              onClick={() => {
                toast({ title: "Coming soon", description: "Booking integration coming soon!" });
              }}
            >
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              <span>Book with {treatment.vet_clinic.name}</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Bottom Action Buttons */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-background border-t">
        <div className="container max-w-2xl mx-auto px-4 py-4 safe-bottom">
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowCompleteModal(true)} 
              className="flex-1 h-12"
              size="lg"
            >
              <Check className="h-5 w-5 mr-2" />
              Mark Complete
            </Button>
            <Button 
              onClick={() => setShowRescheduleDialog(true)} 
              variant="outline" 
              className="flex-1 h-12"
              size="lg"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Reschedule
            </Button>
          </div>
        </div>
      </div>

      {/* Complete Treatment Modal */}
      <CompleteTreatmentModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        treatmentName={treatment?.treatment_name || ""}
        onComplete={handleComplete}
      />

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Treatment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">New Due Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

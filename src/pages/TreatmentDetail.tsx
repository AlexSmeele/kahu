import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Heart, Calendar, Check, Clock, FileText, CheckCircle, AlertTriangle, Building2, Pill } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMedicalTreatments } from "@/hooks/useMedicalTreatments";
import { format, addWeeks, isPast, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CompleteTreatmentModal } from "@/components/health/CompleteTreatmentModal";
import { VetClinicAutocomplete } from "@/components/ui/vet-clinic-autocomplete";
import { useDevicePreview } from "@/preview/DevicePreviewProvider";
import { IOSStatusBar } from "@/components/headers/IOSStatusBar";
import { DynamicIsland } from "@/components/headers/DynamicIsland";

export default function TreatmentDetail() {
  const { treatmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { isDesktop } = useDevicePreview();
  
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
  
  // Refs for dynamic spacing
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(0);
  
  const { treatments, loading: treatmentsLoading, updateTreatment, deleteTreatment } = useMedicalTreatments(dogId);
  
  useEffect(() => {
    fetchTreatmentData();
  }, [treatmentId, dogId, treatments]);
  
  // Measure header and footer heights for dynamic spacing
  useLayoutEffect(() => {
    const measure = () => {
      const statusBarHeight = isDesktop ? 54 : 0;
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const footerHeight = footerRef.current?.offsetHeight ?? 0;
      setTopOffset(statusBarHeight + headerHeight);
      setBottomOffset(footerHeight);
    };
    
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isDesktop, isEditing, theme, showCompleteModal, showRescheduleDialog]);
  
  const fetchTreatmentData = async () => {
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
    if (!treatment) return;
    
    const success = await updateTreatment(treatment.id, {
      treatment_name: editForm.treatment_name,
      last_administered_date: editForm.last_administered_date,
      frequency_weeks: parseInt(editForm.frequency_weeks) || null,
      next_due_date: editForm.next_due_date,
      notes: editForm.notes,
      vet_clinic_id: editForm.vet_clinic_id || null,
    });
    
    if (success) {
      setIsEditing(false);
      toast({
        title: "Treatment updated",
        description: "Your treatment details have been saved.",
      });
    }
  };
  
  const handleComplete = async (completedDate: Date) => {
    if (!treatment) return;
    
    const frequencyWeeks = treatment.frequency_weeks || 4;
    const nextDueDate = addWeeks(completedDate, frequencyWeeks);
    
    const success = await updateTreatment(treatment.id, {
      last_administered_date: format(completedDate, "yyyy-MM-dd"),
      next_due_date: format(nextDueDate, "yyyy-MM-dd"),
    });
    
    if (success) {
      setShowCompleteModal(false);
      toast({
        title: "Treatment completed",
        description: `Next dose scheduled for ${format(nextDueDate, "MMM d, yyyy")}`,
      });
    }
  };
  
  const handleReschedule = async () => {
    if (!treatment || !rescheduleDate) return;
    
    const success = await updateTreatment(treatment.id, {
      next_due_date: rescheduleDate,
    });
    
    if (success) {
      setShowRescheduleDialog(false);
      toast({
        title: "Treatment rescheduled",
        description: `Next dose scheduled for ${format(new Date(rescheduleDate), "MMM d, yyyy")}`,
      });
    }
  };
  
  const handleDelete = async () => {
    if (!treatment) return;
    
    const success = await deleteTreatment(treatment.id);
    
    if (success) {
      toast({
        title: "Treatment deleted",
        description: "The treatment has been removed.",
      });
      navigate(-1);
    }
  };
  
  // Helper functions
  const getFrequencyText = (weeks: number | null) => {
    if (!weeks) return "As needed";
    if (weeks === 1) return "Weekly";
    if (weeks === 4) return "Monthly";
    return `Every ${weeks} weeks`;
  };
  
  const isOverdue = treatment?.next_due_date ? isPast(new Date(treatment.next_due_date)) && !isPast(new Date(treatment.next_due_date).setHours(23, 59, 59)) : false;
  const daysOverdue = treatment?.next_due_date ? differenceInDays(new Date(), new Date(treatment.next_due_date)) : 0;
  
  const isDark = theme === "dark";
  
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Loading treatment details...</p>
        </div>
      </div>
    );
  }
  
  if (!treatment) {
    return null;
  }
  
  // Edit Mode
  if (isEditing) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} isolate`}>
        {/* Status Bar - Desktop Preview Only */}
        {isDesktop && (
          <div className={`fixed top-0 left-0 right-0 h-[54px] z-50 ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} pointer-events-none`}>
            <DynamicIsland />
            <IOSStatusBar />
          </div>
        )}
        
        {/* Fixed Header */}
        <div ref={headerRef} className={`fixed top-[54px] left-0 right-0 z-[60] ${isDark ? 'bg-[#1a1a1a]/95' : 'bg-white/95'} backdrop-blur-sm ${isDark ? 'border-white/5' : 'border-gray-200'} border-b`}>
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsEditing(false)}
                className={`w-10 h-10 rounded-full ${isDark ? 'bg-white/10 hover:bg-white/15 border-white/20' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'} border transition-all flex items-center justify-center`}
              >
                <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
              </button>
              
              <h1 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Treatment</h1>
              
              <div className="w-10" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div 
          className="px-4 space-y-4 overflow-y-auto"
          style={{
            marginTop: `${topOffset}px`,
            height: `calc(100vh - ${topOffset + bottomOffset}px)`
          }}
        >
          <div className={`bg-gradient-to-br ${isDark ? 'from-white/10 to-white/5 border-white/10' : 'from-white to-gray-50 border-gray-200 shadow-md'} border rounded-2xl p-5 space-y-4`}>
            <div>
              <Label className={isDark ? 'text-white/60' : 'text-gray-600'}>Treatment Name</Label>
              <Input
                value={editForm.treatment_name}
                onChange={(e) => setEditForm({ ...editForm, treatment_name: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={isDark ? 'text-white/60' : 'text-gray-600'}>Last Given</Label>
                <Input
                  type="date"
                  value={editForm.last_administered_date}
                  onChange={(e) => setEditForm({ ...editForm, last_administered_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className={isDark ? 'text-white/60' : 'text-gray-600'}>Next Due</Label>
                <Input
                  type="date"
                  value={editForm.next_due_date}
                  onChange={(e) => setEditForm({ ...editForm, next_due_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label className={isDark ? 'text-white/60' : 'text-gray-600'}>Frequency (weeks)</Label>
              <Input
                type="number"
                value={editForm.frequency_weeks}
                onChange={(e) => setEditForm({ ...editForm, frequency_weeks: e.target.value })}
                className="mt-1"
                placeholder="e.g., 4 for monthly"
              />
            </div>
            
            <div>
              <Label className={isDark ? 'text-white/60' : 'text-gray-600'}>Vet Clinic</Label>
              <VetClinicAutocomplete
                value={selectedVetClinic}
                onChange={(clinic) => {
                  setSelectedVetClinic(clinic);
                  setEditForm({ ...editForm, vet_clinic_id: clinic?.id || "" });
                }}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className={isDark ? 'text-white/60' : 'text-gray-600'}>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div ref={footerRef} className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-[#1a1a1a]/95' : 'bg-white/95'} backdrop-blur-sm ${isDark ? 'border-white/5' : 'border-gray-200'} border-t p-4 space-y-3 safe-bottom`}>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className={`flex-1 bg-gradient-to-br ${isDark ? 'from-white/10 to-white/5 border-white/10' : 'from-gray-100 to-gray-200 border-gray-300'} border rounded-xl py-4 flex items-center justify-center transition-all hover:scale-105`}
            >
              <span className={isDark ? 'text-white' : 'text-gray-900'}>Cancel</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl py-4 flex items-center justify-center transition-all hover:from-emerald-600 hover:to-emerald-700"
            >
              <Check className="w-5 h-5 text-white mr-2" />
              <span className="text-white">Save Changes</span>
            </button>
          </div>
          
          <AlertDialog>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            >
              Delete Treatment
            </AlertDialogAction>
          </AlertDialog>
        </div>
      </div>
    );
  }
  
  // View Mode
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} isolate`}>
      {/* Status Bar - Desktop Preview Only */}
      {isDesktop && (
        <div className={`fixed top-0 left-0 right-0 h-[54px] z-50 ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} pointer-events-none`}>
          <DynamicIsland />
          <IOSStatusBar />
        </div>
      )}
      
      {/* Fixed Header */}
      <div ref={headerRef} className={`fixed top-[54px] left-0 right-0 z-[60] ${isDark ? 'bg-[#1a1a1a]/95' : 'bg-white/95'} backdrop-blur-sm ${isDark ? 'border-white/5' : 'border-gray-200'} border-b`}>
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate('/');
              }}
              className={`w-10 h-10 rounded-full ${isDark ? 'bg-white/10 hover:bg-white/15 border-white/20' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'} border transition-all flex items-center justify-center flex-shrink-0`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
            
            <Heart 
              className={`w-5 h-5 ${isOverdue ? 'text-orange-500' : isDark ? 'text-emerald-400' : 'text-emerald-500'} flex-shrink-0`}
              fill={isOverdue ? '#f97316' : isDark ? '#34d399' : '#10b981'}
            />
            
            <h1 className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'} flex-1 min-w-0 truncate`}>
              {treatment.treatment_name}
            </h1>
            
            <button
              onClick={() => setIsEditing(true)}
              className={`w-10 h-10 rounded-full ${isDark ? 'bg-white/10 hover:bg-white/15 border-white/20' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'} border transition-all flex items-center justify-center flex-shrink-0`}
            >
              <Edit3 className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div 
        className="px-4 space-y-3 overflow-y-auto"
        style={{
          marginTop: `${topOffset}px`,
          height: `calc(100vh - ${topOffset + bottomOffset}px)`
        }}
      >
        {/* Due Date Card */}
        <div className={`bg-gradient-to-br ${isDark ? 'from-white/10 to-white/5 border-white/10' : 'from-white to-gray-50 border-gray-200 shadow-md'} border rounded-2xl p-4 flex items-center gap-3`}>
          <Calendar className={`w-5 h-5 ${isOverdue ? 'text-orange-500' : isDark ? 'text-emerald-400' : 'text-emerald-500'} flex-shrink-0`} />
          
          <div className="flex-1">
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-0.5`}>Due Date</p>
            <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {treatment.next_due_date ? format(new Date(treatment.next_due_date), "MMM d, yyyy") : "Not scheduled"}
            </p>
          </div>
          
          {isOverdue && daysOverdue > 0 && (
            <div className="bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-orange-400">Overdue {daysOverdue}d</span>
            </div>
          )}
        </div>
        
        {/* Event Details Card */}
        <div className={`bg-gradient-to-br ${isDark ? 'from-white/10 to-white/5 border-white/10' : 'from-white to-gray-50 border-gray-200 shadow-md'} border rounded-2xl p-5 space-y-4`}>
          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Last Given */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center flex-shrink-0`}>
                <Clock className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Last Given</p>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'} break-words`}>
                  {treatment.last_administered_date ? format(new Date(treatment.last_administered_date), "MMM d, yyyy") : "Not recorded"}
                </p>
              </div>
            </div>
            
            {/* Frequency */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center flex-shrink-0`}>
                <Calendar className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Frequency</p>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'} break-words`}>
                  {getFrequencyText(treatment.frequency_weeks)}
                </p>
              </div>
            </div>
            
            {/* Dosage */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center flex-shrink-0`}>
                <Pill className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Dosage</p>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'} break-words`}>
                  As prescribed
                </p>
              </div>
            </div>
            
            {/* Brand/Type */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center flex-shrink-0`}>
                <CheckCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Brand/Type</p>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'} break-words`}>
                  {treatment.treatment_name}
                </p>
              </div>
            </div>
          </div>
          
          {/* Notes Section */}
          {treatment.notes && (
            <div className="flex items-start gap-3 pt-1">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center flex-shrink-0`}>
                <FileText className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Notes</p>
                <p className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}>{treatment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Bottom Actions Bar */}
      <div ref={footerRef} className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-[#1a1a1a]/95' : 'bg-white/95'} backdrop-blur-sm ${isDark ? 'border-white/5' : 'border-gray-200'} border-t p-4 space-y-3 safe-bottom`}>
        {/* Book with Vets Button */}
        <button 
          disabled
          className={`w-full bg-gradient-to-br ${isDark ? 'from-white/5 to-white/[0.02] border-white/10' : 'from-gray-100 to-gray-50 border-gray-300'} border rounded-xl py-4 flex items-center justify-center gap-2 opacity-40 cursor-not-allowed`}
        >
          <Building2 className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
          <span className={isDark ? 'text-white' : 'text-gray-700'}>
            Book with {selectedVetClinic?.name || "Vets"}
          </span>
        </button>
        
        {/* Mark Complete & Reschedule */}
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCompleteModal(true)}
            className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl py-4 flex items-center justify-center gap-2 transition-all hover:from-emerald-600 hover:to-emerald-700"
          >
            <Check className="w-5 h-5 text-white" />
            <span className="text-white">Mark Complete</span>
          </button>
          
          <button 
            onClick={() => setShowRescheduleDialog(true)}
            className={`flex-1 bg-gradient-to-br ${isDark ? 'from-white/10 to-white/5 border-white/10' : 'from-gray-100 to-gray-200 border-gray-300'} border rounded-xl py-4 flex items-center justify-center gap-2 transition-all hover:scale-105`}
          >
            <Calendar className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            <span className={isDark ? 'text-white' : 'text-gray-700'}>Reschedule</span>
          </button>
        </div>
      </div>
      
      {/* Complete Treatment Modal */}
      <CompleteTreatmentModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        treatmentName={treatment.treatment_name}
        onComplete={handleComplete}
      />
      
      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Treatment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>New Due Date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
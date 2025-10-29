import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Syringe, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useVaccines } from "@/hooks/useVaccines";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

export default function VaccinationDetail() {
  const { vaccinationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId");
  
  const [vaccination, setVaccination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    administered_date: '',
    due_date: '',
    veterinarian: '',
    batch_number: '',
    clinic: '',
    notes: '',
  });
  
  const { updateVaccinationRecord, deleteVaccinationRecord } = useVaccines(dogId);
  
  useEffect(() => {
    fetchVaccinationData();
  }, [vaccinationId, dogId]);
  
  const fetchVaccinationData = async () => {
    if (!vaccinationId || !dogId) return;
    
    setLoading(true);
    try {
      if (isMockDogId(dogId)) {
        const { MOCK_VACCINATION_RECORDS } = await import('@/lib/mockData');
        const mockVaccination = MOCK_VACCINATION_RECORDS.find((v: any) => v.id === vaccinationId);
        if (mockVaccination) {
          setVaccination(mockVaccination);
          setEditForm({
            administered_date: mockVaccination.administered_date || '',
            due_date: mockVaccination.due_date || '',
            veterinarian: mockVaccination.veterinarian || '',
            batch_number: mockVaccination.batch_number || '',
            clinic: '',
            notes: mockVaccination.notes || '',
          });
        }
      } else {
        const { data, error } = await supabase
          .from('vaccination_records')
          .select('*, vaccine:vaccines(*)')
          .eq('id', vaccinationId)
          .single();
          
        if (error) throw error;
        setVaccination(data);
        setEditForm({
          administered_date: data.administered_date || '',
          due_date: data.due_date || '',
          veterinarian: data.veterinarian || '',
          batch_number: data.batch_number || '',
          clinic: '',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching vaccination:', error);
      toast({
        title: "Error",
        description: "Failed to load vaccination details",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => setIsEditing(true);
  
  const handleSave = async () => {
    if (isMockDogId(dogId)) {
      toast({
        title: "Demo Mode",
        description: "Editing is disabled in demo mode",
      });
      return;
    }
    
    try {
      await updateVaccinationRecord(
        vaccinationId!,
        editForm.administered_date,
        editForm.due_date || undefined,
        editForm.veterinarian || undefined,
        editForm.batch_number || undefined,
        editForm.notes || undefined
      );
      setIsEditing(false);
      fetchVaccinationData();
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (vaccination) {
      setEditForm({
        administered_date: vaccination.administered_date || '',
        due_date: vaccination.due_date || '',
        veterinarian: vaccination.veterinarian || '',
        batch_number: vaccination.batch_number || '',
        clinic: vaccination.clinic || '',
        notes: vaccination.notes || '',
      });
    }
  };
  
  const handleDelete = async () => {
    if (isMockDogId(dogId)) {
      toast({
        title: "Demo Mode",
        description: "Deleting is disabled in demo mode",
      });
      return;
    }
    
    try {
      await deleteVaccinationRecord(vaccinationId!);
      navigate(-1);
    } catch (error) {
      // Error handled in hook
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
  
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      core: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      lifestyle: 'bg-green-500/10 text-green-700 dark:text-green-400',
      regional: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      injectable_therapy: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (!vaccination) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Vaccination</h1>
              </div>
            </div>
            
            {!isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
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
                <p className="text-sm text-muted-foreground">Administered</p>
                <p className="font-medium">
                  {vaccination.administered_date 
                    ? format(new Date(vaccination.administered_date), 'MMMM d, yyyy') 
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Vaccine Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vaccine Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vaccine Name</p>
              <p className="font-medium text-lg">{vaccination.vaccine?.name || 'Unknown Vaccine'}</p>
            </div>
            
            {vaccination.vaccine?.vaccine_type && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <Badge className={getTypeColor(vaccination.vaccine.vaccine_type)}>
                  {vaccination.vaccine.vaccine_type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}
            
            {vaccination.vaccine?.protects_against && (
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Protects Against</p>
                  <p>{vaccination.vaccine.protects_against}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Administration Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Administration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="administered_date">Administered Date</Label>
                  <Input
                    id="administered_date"
                    type="date"
                    value={editForm.administered_date}
                    onChange={(e) => setEditForm({ ...editForm, administered_date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="due_date">Next Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinarian</Label>
                  <Input
                    id="veterinarian"
                    value={editForm.veterinarian}
                    onChange={(e) => setEditForm({ ...editForm, veterinarian: e.target.value })}
                    placeholder="Dr. Smith"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinic">Clinic</Label>
                  <Input
                    id="clinic"
                    value={editForm.clinic}
                    onChange={(e) => setEditForm({ ...editForm, clinic: e.target.value })}
                    placeholder="Animal Hospital"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    value={editForm.batch_number}
                    onChange={(e) => setEditForm({ ...editForm, batch_number: e.target.value })}
                    placeholder="ABC123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
              </>
            ) : (
              <>
                  {vaccination.veterinarian && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Veterinarian</p>
                      <p className="font-medium">{vaccination.veterinarian}</p>
                    </div>
                  )}
                  
                  {vaccination.vet_clinic_id && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Clinic ID</p>
                      <p className="font-medium">{vaccination.vet_clinic_id}</p>
                    </div>
                  )}
                
                {vaccination.batch_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Batch Number</p>
                    <p className="font-mono text-sm">{vaccination.batch_number}</p>
                  </div>
                )}
                
                {vaccination.due_date && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next Booster Due</p>
                    <p className="font-medium">
                      {format(new Date(vaccination.due_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
                
                {vaccination.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="whitespace-pre-wrap">{vaccination.notes}</p>
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
            <AlertDialogTitle>Delete Vaccination Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vaccination record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

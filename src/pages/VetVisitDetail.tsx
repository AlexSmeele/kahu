import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Stethoscope, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useVetVisits } from "@/hooks/useVetVisits";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

const VISIT_TYPES = [
  { value: 'routine', label: 'Routine Checkup' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'surgery', label: 'Surgery' },
];

export default function VetVisitDetail() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId");
  
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    type: '',
    veterinarian: '',
    clinic: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    cost: '',
    notes: '',
  });
  
  const { updateVetVisit, deleteVetVisit } = useVetVisits(dogId);
  
  useEffect(() => {
    fetchVisitData();
  }, [visitId, dogId]);
  
  const fetchVisitData = async () => {
    if (!visitId || !dogId) return;
    
    setLoading(true);
    try {
      if (isMockDogId(dogId)) {
        const { MOCK_HEALTH_RECORDS } = await import('@/lib/mockData');
        const mockVisit = MOCK_HEALTH_RECORDS.find((r: any) => 
          r.id === visitId && r.record_type === 'vet_visit'
        );
        if (mockVisit) {
        setVisit(mockVisit);
          setEditForm({
            date: mockVisit.date || '',
            type: 'routine',
            veterinarian: mockVisit.veterinarian || '',
            clinic: '',
            reason: mockVisit.title || '',
            diagnosis: mockVisit.description || '',
            treatment: '',
            cost: '',
            notes: mockVisit.notes || '',
          });
        }
      } else {
        const { data, error } = await supabase
          .from('health_records')
          .select('*')
          .eq('id', visitId)
          .eq('record_type', 'vet_visit')
          .single();
          
        if (error) throw error;
        setVisit(data);
        setEditForm({
          date: data.date || '',
          type: 'routine',
          veterinarian: data.veterinarian || '',
          clinic: '',
          reason: data.title || '',
          diagnosis: data.description || '',
          treatment: '',
          cost: '',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching vet visit:', error);
      toast({
        title: "Error",
        description: "Failed to load vet visit details",
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
      await updateVetVisit(visitId!, {
        date: new Date(editForm.date),
        type: editForm.type as any,
        veterinarian: editForm.veterinarian,
        clinic: editForm.clinic,
        reason: editForm.reason,
        diagnosis: editForm.diagnosis,
        notes: editForm.notes,
      });
      setIsEditing(false);
      fetchVisitData();
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (visit) {
      setEditForm({
        date: visit.date || '',
        type: visit.type || 'routine',
        veterinarian: visit.veterinarian || '',
        clinic: visit.clinic || '',
        reason: visit.title || '',
        diagnosis: visit.diagnosis || '',
        treatment: visit.treatment || '',
        cost: visit.cost?.toString() || '',
        notes: visit.notes || '',
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
      await deleteVetVisit(visitId!);
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
      routine: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      emergency: 'bg-red-500/10 text-red-700 dark:text-red-400',
      'follow-up': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      vaccination: 'bg-green-500/10 text-green-700 dark:text-green-400',
      surgery: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
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
  
  if (!visit) {
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
                <Stethoscope className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Vet Visit</h1>
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
        {/* Date & Time Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {visit.date ? format(new Date(visit.date), 'MMMM d, yyyy') : 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Visit Type</Label>
                  <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    placeholder="Annual checkup"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={editForm.diagnosis}
                    onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Textarea
                    id="treatment"
                    value={editForm.treatment}
                    onChange={(e) => setEditForm({ ...editForm, treatment: e.target.value })}
                    placeholder="Enter treatment plan..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={editForm.cost}
                    onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                    placeholder="0.00"
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
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <Badge className={getTypeColor('routine')}>
                    Vet Visit
                  </Badge>
                </div>
                
                {visit.veterinarian && (
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Veterinarian</p>
                      <p className="font-medium">{visit.veterinarian}</p>
                    </div>
                  </div>
                )}
                
                {visit.vet_clinic_id && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Clinic ID</p>
                      <p className="font-medium">{visit.vet_clinic_id}</p>
                    </div>
                  </div>
                )}
                
                {visit.title && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reason</p>
                    <p>{visit.title}</p>
                  </div>
                )}
                
                {visit.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="whitespace-pre-wrap">{visit.description}</p>
                  </div>
                )}
                
                {visit.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="whitespace-pre-wrap">{visit.notes}</p>
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
            <AlertDialogTitle>Delete Vet Visit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vet visit record? This action cannot be undone.
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

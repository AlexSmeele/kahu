import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Scissors, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useGroomingSchedule } from "@/hooks/useGroomingSchedule";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

export default function GroomingDetail() {
  const { groomingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const dogId = location.state?.dogId || localStorage.getItem("selectedDogId");
  
  const [grooming, setGrooming] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    grooming_type: '',
    frequency_days: '',
    notes: '',
  });
  
  const { updateSchedule, deleteSchedule, completeGrooming } = useGroomingSchedule(dogId);
  
  useEffect(() => {
    fetchGroomingData();
  }, [groomingId, dogId]);
  
  const fetchGroomingData = async () => {
    if (!groomingId || !dogId) return;
    
    setLoading(true);
    try {
      if (isMockDogId(dogId)) {
        const { MOCK_HEALTH_RECORDS } = await import('@/lib/mockData');
        const mockGrooming = MOCK_HEALTH_RECORDS.find((r: any) => 
          r.id === groomingId && r.record_type === 'grooming'
        );
        if (mockGrooming) {
          setGrooming(mockGrooming);
          setEditForm({
            grooming_type: mockGrooming.grooming_type || mockGrooming.title || '',
            frequency_days: mockGrooming.frequency_days?.toString() || '30',
            notes: mockGrooming.notes || '',
          });
        }
      } else {
        const { data, error } = await supabase
          .from('grooming_schedules')
          .select('*')
          .eq('id', groomingId)
          .single();
          
        if (error) throw error;
        setGrooming(data);
        setEditForm({
          grooming_type: data.grooming_type || '',
          frequency_days: data.frequency_days?.toString() || '30',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching grooming:', error);
      toast({
        title: "Error",
        description: "Failed to load grooming details",
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
      await updateSchedule(groomingId!, {
        grooming_type: editForm.grooming_type,
        frequency_days: parseInt(editForm.frequency_days),
        notes: editForm.notes,
      });
      setIsEditing(false);
      fetchGroomingData();
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (grooming) {
      setEditForm({
        grooming_type: grooming.grooming_type || grooming.title || '',
        frequency_days: grooming.frequency_days?.toString() || '30',
        notes: grooming.notes || '',
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
      await deleteSchedule(groomingId!);
      navigate(-1);
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleMarkComplete = async () => {
    if (isMockDogId(dogId)) {
      toast({
        title: "Demo Mode",
        description: "Marking complete is disabled in demo mode",
      });
      return;
    }
    
    try {
      await completeGrooming(groomingId!);
      fetchGroomingData();
      toast({
        title: "Success",
        description: "Grooming marked as complete",
      });
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
  
  const getDaysUntilDue = () => {
    if (!grooming?.next_due_date) return null;
    return differenceInDays(new Date(grooming.next_due_date), new Date());
  };
  
  const isOverdue = () => {
    const days = getDaysUntilDue();
    return days !== null && days < 0;
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
  
  if (!grooming) {
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
                <Scissors className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Grooming</h1>
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
        {/* Status Card */}
        {grooming.next_due_date && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Next Due</p>
                    <p className="font-medium">
                      {format(new Date(grooming.next_due_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {isOverdue() ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Overdue
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {getDaysUntilDue()} days
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Grooming Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="grooming_type">Grooming Type</Label>
                  <Input
                    id="grooming_type"
                    value={editForm.grooming_type}
                    onChange={(e) => setEditForm({ ...editForm, grooming_type: e.target.value })}
                    placeholder="Bath, Nail Trim, Haircut, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency_days">Frequency (days)</Label>
                  <Input
                    id="frequency_days"
                    type="number"
                    value={editForm.frequency_days}
                    onChange={(e) => setEditForm({ ...editForm, frequency_days: e.target.value })}
                    placeholder="30"
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
                  <p className="font-medium text-lg">{grooming.grooming_type || grooming.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Frequency</p>
                    <p className="font-medium">Every {grooming.frequency_days} days</p>
                  </div>
                  
                  {grooming.last_completed_at && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last Completed</p>
                      <p className="font-medium">
                        {format(new Date(grooming.last_completed_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
                
                {grooming.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="whitespace-pre-wrap">{grooming.notes}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button onClick={handleMarkComplete} className="w-full">
                    Mark as Complete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grooming Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this grooming schedule? This action cannot be undone.
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

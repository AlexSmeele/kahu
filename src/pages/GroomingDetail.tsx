import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Scissors, Calendar, AlertCircle, Camera, X, Image as ImageIcon, Clipboard, Video, Check } from "lucide-react";
import videoPlaceholder from "@/assets/video-placeholder.jpg";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGroomingSchedule, GroomingCompletion } from "@/hooks/useGroomingSchedule";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId, MOCK_GROOMING_SCHEDULES } from "@/lib/mockData";
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
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completions, setCompletions] = useState<GroomingCompletion[]>([]);
  const [completionForm, setCompletionForm] = useState({
    notes: '',
    photos: [] as File[],
  });
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    grooming_type: '',
    frequency_days: '',
    notes: '',
    how_to_video_url: '',
    how_to_guide: '',
  });
  
  const { updateSchedule, deleteSchedule, completeGrooming, fetchCompletions } = useGroomingSchedule(dogId);
  
  useEffect(() => {
    console.log('[GroomingDetail] Mount:', { groomingId, dogId });
    fetchGroomingData();
    if (groomingId) {
      fetchCompletionHistory();
    }
  }, [groomingId, dogId]);

  const fetchCompletionHistory = async () => {
    if (!groomingId) return;
    const history = await fetchCompletions(groomingId);
    setCompletions(history);
  };
  
  const fetchGroomingData = async () => {
    if (!groomingId) return;
    
    setLoading(true);
    try {
      // Try loading from mock data first if we have a mock dogId
      if (dogId && isMockDogId(dogId)) {
        const mockGrooming = MOCK_GROOMING_SCHEDULES.find((s: any) => s.id === groomingId);
        if (mockGrooming) {
          console.log('[GroomingDetail] Loaded from mock schedules:', mockGrooming);
          setGrooming(mockGrooming);
          setEditForm({
            grooming_type: mockGrooming.grooming_type || '',
            frequency_days: mockGrooming.frequency_days?.toString() || '30',
            notes: mockGrooming.notes || '',
            how_to_video_url: mockGrooming.how_to_video_url || '',
            how_to_guide: mockGrooming.how_to_guide || '',
          });
          return;
        }
      }
      
      // Try Supabase fetch
      const { data, error } = await supabase
        .from('grooming_schedules')
        .select('*')
        .eq('id', groomingId)
        .maybeSingle();
      
      if (data) {
        console.log('[GroomingDetail] Loaded from Supabase:', data);
        setGrooming(data);
        setEditForm({
          grooming_type: data.grooming_type || '',
          frequency_days: data.frequency_days?.toString() || '30',
          notes: data.notes || '',
          how_to_video_url: data.how_to_video_url || '',
          how_to_guide: data.how_to_guide || '',
        });
        
        // Set dogId if we didn't have one
        if (!dogId && data.dog_id) {
          localStorage.setItem('selectedDogId', data.dog_id);
        }
        return;
      }
      
      // Fallback to mock data if Supabase didn't return anything
      const mockGrooming = MOCK_GROOMING_SCHEDULES.find((s: any) => s.id === groomingId);
      if (mockGrooming) {
        console.warn('[GroomingDetail] Supabase miss, fallback to mock:', mockGrooming);
        setGrooming(mockGrooming);
        setEditForm({
          grooming_type: mockGrooming.grooming_type || '',
          frequency_days: mockGrooming.frequency_days?.toString() || '30',
          notes: mockGrooming.notes || '',
          how_to_video_url: mockGrooming.how_to_video_url || '',
          how_to_guide: mockGrooming.how_to_guide || '',
        });
        return;
      }
      
      // No data found anywhere
      throw new Error('Grooming schedule not found');
    } catch (error) {
      console.error('[GroomingDetail] Error fetching grooming:', error);
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
        how_to_video_url: editForm.how_to_video_url || null,
        how_to_guide: editForm.how_to_guide || null,
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
        how_to_video_url: grooming.how_to_video_url || '',
        how_to_guide: grooming.how_to_guide || '',
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
  
  const handleMarkComplete = () => {
    if (!dogId || isMockDogId(dogId)) {
      toast({
        title: "Demo Mode",
        description: "Marking complete is disabled in demo mode",
      });
      return;
    }
    setShowCompleteDialog(true);
  };

  const handleCompleteSubmit = async () => {
    if (!groomingId) return;
    
    try {
      setUploading(true);
      let photoUrls: string[] = [];

      // Upload photos if any
      if (completionForm.photos.length > 0) {
        const uploadPromises = completionForm.photos.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${dogId}/${groomingId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('grooming-photos')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('grooming-photos')
            .getPublicUrl(filePath);

          return data.publicUrl;
        });

        photoUrls = await Promise.all(uploadPromises);
      }

      await completeGrooming(groomingId, completionForm.notes || undefined, photoUrls.length > 0 ? photoUrls : undefined);
      
      setShowCompleteDialog(false);
      setCompletionForm({ notes: '', photos: [] });
      fetchGroomingData();
      fetchCompletionHistory();
      
      toast({
        title: "Success",
        description: "Grooming marked as complete",
      });
    } catch (error) {
      console.error('Error completing grooming:', error);
      toast({
        title: "Error",
        description: "Failed to complete grooming",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCompletionForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 5) // Max 5 photos
    }));
  };

  const removePhoto = (index: number) => {
    setCompletionForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
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
      <div className="min-h-screen h-full bg-background overflow-y-auto">
        <div className="container max-w-2xl mx-auto px-4 py-6 pb-32 space-y-6">
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
    <div className="min-h-screen h-full bg-background overflow-y-auto">
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
      <div className="container max-w-2xl mx-auto px-4 py-6 pb-32 safe-bottom">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Clipboard className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="howto" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              How-To
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
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
                        <Check className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Completion History */}
            {completions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completion History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completions.map((completion) => (
                    <div key={completion.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {format(new Date(completion.completed_at), 'MMMM d, yyyy')}
                        </p>
                        <Badge variant="secondary">
                          {format(new Date(completion.completed_at), 'h:mm a')}
                        </Badge>
                      </div>
                      
                      {completion.notes && (
                        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                          {completion.notes}
                        </p>
                      )}
                      
                      {completion.photos && completion.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {completion.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Grooming photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="howto" className="space-y-6">
            {/* Video Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Instructional Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL (YouTube or Vimeo)</Label>
                    <Input
                      id="video_url"
                      type="url"
                      value={editForm.how_to_video_url}
                      onChange={(e) => setEditForm({ ...editForm, how_to_video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                ) : grooming.how_to_video_url ? (
                  <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={grooming.how_to_video_url.includes('youtube.com') || grooming.how_to_video_url.includes('youtu.be')
                        ? grooming.how_to_video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                        : grooming.how_to_video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative w-full rounded-lg overflow-hidden group cursor-pointer">
                    <img 
                      src={videoPlaceholder} 
                      alt="Video tutorial coming soon"
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
                        Video tutorial coming soon
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guide Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clipboard className="w-5 h-5" />
                  Step-by-Step Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="guide">Guide Instructions</Label>
                    <Textarea
                      id="guide"
                      value={editForm.how_to_guide}
                      onChange={(e) => setEditForm({ ...editForm, how_to_guide: e.target.value })}
                      className="min-h-[300px]"
                      placeholder="Enter step-by-step instructions for this grooming task..."
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use line breaks to separate steps
                    </p>
                  </div>
                ) : grooming.how_to_guide ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-semibold mt-4 mb-2 first:mt-0" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-3 mb-1 first:mt-0" {...props} />,
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-3" {...props} />,
                        strong: ({node, ...props}) => <strong className="block font-semibold mt-3 mb-1 first:mt-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 text-sm ml-2 mb-3" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 text-sm ml-2 mb-3" {...props} />,
                        li: ({node, ...props}) => <li className="ml-2" {...props} />,
                      }}
                    >
                      {grooming.how_to_guide}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Clipboard className="w-12 h-12 mb-2 opacity-50" />
                    <p>No guide available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Grooming Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Grooming</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completion_notes">Notes (Optional)</Label>
              <Textarea
                id="completion_notes"
                value={completionForm.notes}
                onChange={(e) => setCompletionForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any observations or notes about this grooming session..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Photos (Optional)</Label>
              <div className="flex flex-col gap-2">
                {completionForm.photos.length < 5 && (
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 hover:bg-accent transition-colors flex items-center justify-center gap-2">
                      <Camera className="w-5 h-5" />
                      <span className="text-sm">Add Photos ({completionForm.photos.length}/5)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </label>
                )}
                
                {completionForm.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {completionForm.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCompleteDialog(false);
                  setCompletionForm({ notes: '', photos: [] });
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCompleteSubmit}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Complete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Clock, MapPin, TrendingUp, Calendar, Navigation, Footprints, Zap, PlayCircle, GraduationCap, Moon, Dog, FileText, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useActivity, ActivityRecord } from "@/hooks/useActivity";
import { format } from "date-fns";
import { logger } from "@/lib/logger";
import { MOCK_ACTIVITY_RECORDS, isMockDogId } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function ActivityDetail() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activity, setActivity] = useState<ActivityRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    activity_type: "",
    duration_minutes: 0,
    distance_km: 0,
    calories_burned: 0,
    notes: "",
  });

  // Get dogId from route state first, fallback to localStorage
  const dogIdFromState = location.state?.dogId;
  const dogIdFromStorage = localStorage.getItem("selectedDogId");
  const dogId = dogIdFromState || dogIdFromStorage;

  const { updateActivity, deleteActivity } = useActivity(dogId);
  const { toast } = useToast();

  // Fetch activity details
  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId || !dogId) return;

      logger.info("ActivityDetail: Fetching activity", { activityId, dogId });
      
      // Support mock data
      if (isMockDogId(dogId)) {
        const mockActivity = MOCK_ACTIVITY_RECORDS.find(
          (a) => a.id === activityId && a.dog_id === dogId
        );
        
        if (!mockActivity) {
          logger.error("ActivityDetail: Mock activity not found");
          navigate(-1);
          return;
        }
        
        setActivity(mockActivity);
        setEditForm({
          activity_type: mockActivity.activity_type || '',
          duration_minutes: mockActivity.duration_minutes || 0,
          distance_km: mockActivity.distance_km || 0,
          calories_burned: mockActivity.calories_burned || 0,
          notes: mockActivity.notes || '',
        });
        return;
      }

      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("activity_records")
        .select("*")
        .eq("id", activityId)
        .eq("dog_id", dogId)
        .single();

      if (error) {
        logger.error("ActivityDetail: Error fetching activity", error);
        navigate(-1);
        return;
      }

      setActivity(data);
      setEditForm({
        activity_type: data.activity_type,
        duration_minutes: data.duration_minutes || 0,
        distance_km: data.distance_km || 0,
        calories_burned: data.calories_burned || 0,
        notes: data.notes || "",
      });
    };

    fetchActivity();
  }, [activityId, dogId, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!activityId || !dogId) return;

    // Handle mock data
    if (isMockDogId(dogId)) {
      toast({
        title: 'Demo mode',
        description: 'Changes are not persisted in demo mode',
      });
      setIsEditing(false);
      return;
    }

    const success = await updateActivity(activityId, {
      activity_type: editForm.activity_type as any,
      duration_minutes: editForm.duration_minutes || undefined,
      distance_km: editForm.distance_km || undefined,
      calories_burned: editForm.calories_burned || undefined,
      notes: editForm.notes || undefined,
    });

    if (success) {
      setIsEditing(false);
      // Refetch activity
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("activity_records")
        .select("*")
        .eq("id", activityId)
        .single();
      if (data) setActivity(data);
    }
  };

  const handleCancel = () => {
    if (activity) {
      setEditForm({
        activity_type: activity.activity_type,
        duration_minutes: activity.duration_minutes || 0,
        distance_km: activity.distance_km || 0,
        calories_burned: activity.calories_burned || 0,
        notes: activity.notes || "",
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!activityId || !dogId) return;

    // Handle mock data
    if (isMockDogId(dogId)) {
      toast({
        title: 'Demo mode',
        description: 'Cannot delete activities in demo mode',
      });
      setShowDeleteDialog(false);
      return;
    }

    const success = await deleteActivity(activityId);
    if (success) {
      navigate(-1);
    }
  };

  const getActivityIcon = (type: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
      walk: Footprints,
      run: Zap,
      play: PlayCircle,
      training: GraduationCap,
      rest: Moon,
    };
    return icons[type] || Dog;
  };

  const getActivityLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleBack = () => {
    const state = location.state as any;
    const from = state?.from as string | undefined;
    const scrollPosition = state?.scrollPosition;
    
    if (from) {
      navigate(from, { state: { scrollPosition } });
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/?tab=wellness');
    }
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading activity...</div>
      </div>
    );
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
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = getActivityIcon(activity.activity_type);
                  return <IconComponent className="h-6 w-6 text-primary" />;
                })()}
                <h1 className="text-xl font-semibold">{getActivityLabel(activity.activity_type)}</h1>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date & Time Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(activity.start_time), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(activity.start_time), "h:mm a")}
                  {activity.end_time && ` - ${format(new Date(activity.end_time), "h:mm a")}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="activity_type">Activity Type</Label>
                  <Select
                    value={editForm.activity_type}
                    onValueChange={(value) => setEditForm({ ...editForm, activity_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk">Walk</SelectItem>
                      <SelectItem value="run">Run</SelectItem>
                      <SelectItem value="play">Play</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="rest">Rest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={editForm.duration_minutes}
                      onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="distance_km">Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editForm.distance_km}
                      onChange={(e) => setEditForm({ ...editForm, distance_km: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="calories_burned">Calories Burned</Label>
                  <Input
                    type="number"
                    value={editForm.calories_burned}
                    onChange={(e) => setEditForm({ ...editForm, calories_burned: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Add any notes about this activity..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
                </div>
              </>
            ) : (
              <>
                {activity.duration_minutes && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-2xl font-bold">{activity.duration_minutes} minutes</p>
                    </div>
                  </div>
                )}

                {activity.distance_km && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Distance</p>
                      <p className="text-2xl font-bold">{activity.distance_km.toFixed(1)} km</p>
                    </div>
                  </div>
                )}

                {activity.calories_burned && (
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Calories Burned</p>
                      <p className="text-2xl font-bold">{activity.calories_burned} Cal</p>
                    </div>
                  </div>
                )}

                {activity.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-muted-foreground">{activity.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Navigation className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tracking Method</p>
                    <Badge variant="secondary" className="mt-1">
                      {activity.tracking_method === "manual" ? "Manual Entry" : 
                       activity.tracking_method === "gps" ? "GPS Tracked" : 
                       activity.tracking_method === "accelerometer" ? "Auto-Tracked" : 
                       activity.tracking_method}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* GPS Map Placeholder */}
        {activity.gps_data && (
          <Card>
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Map view coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this activity record. This action cannot be undone.
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

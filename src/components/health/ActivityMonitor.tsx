import { useState } from "react";
import { Plus, Target, Clock, MapPin, Edit3, Trash2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActivity, ActivityRecord } from "@/hooks/useActivity";
import { format } from "date-fns";

interface ActivityMonitorProps {
  dogId: string;
}

export function ActivityMonitor({ dogId }: ActivityMonitorProps) {
  const { goal, records, todayProgress, loading, addActivity, updateActivity, deleteActivity, updateGoal } = useActivity(dogId);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);

  const progressPercentage = goal ? Math.min((todayProgress.minutes / goal.target_minutes) * 100, 100) : 0;

  const handleAddActivity = async (formData: FormData) => {
    const activityType = formData.get('activity_type') as string;
    const duration = parseInt(formData.get('duration_minutes') as string || '0');
    const distance = parseFloat(formData.get('distance_km') as string || '0');
    const notes = formData.get('notes') as string;

    const success = await addActivity({
      activity_type: activityType as any,
      duration_minutes: duration || undefined,
      distance_km: distance || undefined,
      notes: notes || undefined,
      start_time: new Date().toISOString(),
      tracking_method: 'manual'
    });

    if (success) {
      setIsAddingActivity(false);
    }
  };

  const handleUpdateGoal = async (formData: FormData) => {
    const targetMinutes = parseInt(formData.get('target_minutes') as string);
    const activityLevel = formData.get('activity_level') as string;

    const success = await updateGoal({
      target_minutes: targetMinutes,
      activity_level: activityLevel as any
    });

    if (success) {
      setIsEditingGoal(false);
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    setTrackingStart(new Date());
  };

  const stopTracking = async () => {
    if (!trackingStart) return;

    const duration = Math.round((Date.now() - trackingStart.getTime()) / (1000 * 60));
    
    await addActivity({
      activity_type: 'walk',
      duration_minutes: duration,
      start_time: trackingStart.toISOString(),
      end_time: new Date().toISOString(),
      tracking_method: 'accelerometer',
      notes: 'Auto-tracked activity'
    });

    setIsTracking(false);
    setTrackingStart(null);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'walk': return '🚶';
      case 'run': return '🏃';
      case 'play': return '🎾';
      case 'training': return '🎓';
      default: return '💤';
    }
  };

  if (loading) {
    return <div className="space-y-4">Loading activity data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Daily Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{todayProgress.minutes}min</span>
              <span className="text-sm text-muted-foreground">
                of {goal?.target_minutes || 60} minutes
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{todayProgress.distance.toFixed(1)} km</span>
              <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
                {progressPercentage.toFixed(0)}% Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddActivity(formData);
            }} className="space-y-4">
              <div>
                <Label htmlFor="activity_type">Activity Type</Label>
                <Select name="activity_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk">🚶 Walk</SelectItem>
                    <SelectItem value="run">🏃 Run</SelectItem>
                    <SelectItem value="play">🎾 Play</SelectItem>
                    <SelectItem value="training">🎓 Training</SelectItem>
                    <SelectItem value="rest">💤 Rest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input type="number" name="duration_minutes" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="distance_km">Distance (km)</Label>
                  <Input type="number" step="0.1" name="distance_km" placeholder="0.0" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea name="notes" placeholder="How did it go?" />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Activity</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingActivity(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button 
          variant={isTracking ? "destructive" : "default"} 
          className="h-12"
          onClick={isTracking ? stopTracking : startTracking}
        >
          {isTracking ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Stop Tracking
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Tracking
            </>
          )}
        </Button>
      </div>

      {/* Goal Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity Goal</CardTitle>
          <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Activity Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateGoal(formData);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="target_minutes">Daily Target (minutes)</Label>
                  <Input 
                    type="number" 
                    name="target_minutes" 
                    defaultValue={goal?.target_minutes || 60}
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="activity_level">Activity Level</Label>
                  <Select name="activity_level" defaultValue={goal?.activity_level || 'moderate'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Senior/Calm dogs</SelectItem>
                      <SelectItem value="moderate">Moderate - Most dogs</SelectItem>
                      <SelectItem value="high">High - Working/Active breeds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Update Goal</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditingGoal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">
            {goal?.target_minutes || 60} minutes daily
          </div>
          <div className="text-sm text-muted-foreground capitalize">
            {goal?.activity_level || 'moderate'} intensity level
          </div>
        </CardContent>
      </Card>

      {/* Today's Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {records.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No activities recorded today
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getActivityIcon(record.activity_type)}</span>
                      <div>
                        <div className="font-medium capitalize">{record.activity_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(record.start_time), 'HH:mm')}
                          {record.duration_minutes && ` • ${record.duration_minutes}min`}
                          {record.distance_km && ` • ${record.distance_km}km`}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingActivity(record)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteActivity(record.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <Dialog open={true} onOpenChange={() => setEditingActivity(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const duration = parseInt(formData.get('duration_minutes') as string || '0');
              const distance = parseFloat(formData.get('distance_km') as string || '0');
              const notes = formData.get('notes') as string;

              await updateActivity(editingActivity.id, {
                duration_minutes: duration || undefined,
                distance_km: distance || undefined,
                notes: notes || undefined
              });
              setEditingActivity(null);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input 
                    type="number" 
                    name="duration_minutes" 
                    defaultValue={editingActivity.duration_minutes || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="distance_km">Distance (km)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    name="distance_km" 
                    defaultValue={editingActivity.distance_km || ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  name="notes" 
                  defaultValue={editingActivity.notes || ''}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Update</Button>
                <Button type="button" variant="outline" onClick={() => setEditingActivity(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
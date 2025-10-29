import { useState } from "react";
import { Plus, Play, Pause, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActivity } from "@/hooks/useActivity";
import { EditActivityGoalModal } from "@/components/home/EditActivityGoalModal";

interface ActivityMonitorProps {
  dogId: string;
}

export function ActivityMonitor({ dogId }: ActivityMonitorProps) {
  const { goal, todayProgress, loading, addActivity, updateGoal } = useActivity(dogId);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
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

  const handleUpdateGoal = async (targetMinutes: number) => {
    return await updateGoal({ target_minutes: targetMinutes });
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
      case 'walk': return 'Walk';
      case 'run': return 'Run';
      case 'play': return 'Play';
      case 'training': return 'Training';
      default: return 'Rest';
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsEditingGoal(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
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
            <Button variant="secondary" className="h-12 bg-card hover:bg-accent border">
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

      {/* Edit Goal Modal */}
      <EditActivityGoalModal
        dogId={dogId}
        isOpen={isEditingGoal}
        onClose={() => setIsEditingGoal(false)}
        currentGoal={goal}
        onSave={handleUpdateGoal}
      />
    </div>
  );
}
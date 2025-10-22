import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { useToast } from "@/hooks/use-toast";

interface ActivityRecordModalProps {
  dogId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityRecordModal({ dogId, isOpen, onClose }: ActivityRecordModalProps) {
  const [activityType, setActivityType] = useState("walk");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  
  const { addActivity } = useActivity(dogId);
  const { toast } = useToast();

  const handleManualSubmit = async () => {
    if (!duration) {
      toast({ title: "Please enter duration", variant: "destructive" });
      return;
    }

    const success = await addActivity({
      activity_type: activityType,
      duration_minutes: parseInt(duration),
      distance_km: distance ? parseFloat(distance) : undefined,
      start_time: new Date().toISOString(),
      tracking_method: 'manual'
    });

    if (success) {
      setDuration("");
      setDistance("");
      onClose();
    }
  };

  const handleStartTracking = () => {
    setIsTracking(true);
    setTrackingStart(new Date());
    toast({ title: "Tracking started", description: "Recording your activity..." });
  };

  const handleStopTracking = async () => {
    if (!trackingStart) return;

    const now = new Date();
    const durationMinutes = Math.round((now.getTime() - trackingStart.getTime()) / 60000);

    const success = await addActivity({
      activity_type: activityType,
      duration_minutes: durationMinutes,
      start_time: trackingStart.toISOString(),
      end_time: now.toISOString(),
      tracking_method: 'gps'
    });

    if (success) {
      setIsTracking(false);
      setTrackingStart(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Activity</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">Walk</SelectItem>
                  <SelectItem value="run">Run</SelectItem>
                  <SelectItem value="play">Play</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="swim">Swim</SelectItem>
                  <SelectItem value="hike">Hike</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Distance (km) - Optional</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="2.5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            <Button onClick={handleManualSubmit} className="w-full">
              Save Activity
            </Button>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType} disabled={isTracking}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">Walk</SelectItem>
                  <SelectItem value="run">Run</SelectItem>
                  <SelectItem value="hike">Hike</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isTracking ? (
              <Button onClick={handleStartTracking} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Start Tracking
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {trackingStart && Math.floor((Date.now() - trackingStart.getTime()) / 60000)} min
                  </div>
                  <p className="text-sm text-muted-foreground">Recording activity...</p>
                </div>
                <Button onClick={handleStopTracking} variant="destructive" className="w-full">
                  <Square className="w-4 h-4 mr-2" />
                  Stop & Save
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

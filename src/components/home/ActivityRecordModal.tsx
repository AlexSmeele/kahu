import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square, Flame, MapPin } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { useToast } from "@/hooks/use-toast";
import { useDogs } from "@/hooks/useDogs";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateCalories } from "@/lib/mockDataPatterns";

// Fix default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ActivityRecordModalProps {
  dogId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

// Component to recenter map when positions update
function MapRecenter({ positions }: { positions: Position[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const lastPos = positions[positions.length - 1];
      map.setView([lastPos.lat, lastPos.lng], 15);
    }
  }, [positions, map]);
  
  return null;
}

export function ActivityRecordModal({ dogId, isOpen, onClose }: ActivityRecordModalProps) {
  const [activityType, setActivityType] = useState("walk");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trackedDistance, setTrackedDistance] = useState(0);
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  
  const { addActivity } = useActivity(dogId);
  const { dogs } = useDogs();
  const { toast } = useToast();
  
  const currentDog = dogs.find(d => d.id === dogId);
  const dogWeight = currentDog?.weight || 15; // Default to 15kg if not set

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

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleStartTracking = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: "GPS not available", 
        description: "Your device doesn't support GPS tracking",
        variant: "destructive" 
      });
      return;
    }

    setIsTracking(true);
    setTrackingStart(new Date());
    setPositions([]);
    setTrackedDistance(0);
    setEstimatedCalories(0);
    setElapsedMinutes(0);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos: Position = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };
        setPositions([newPos]);
      },
      (error) => {
        console.error('GPS error:', error);
        toast({ 
          title: "GPS error", 
          description: "Unable to get your location. Please enable location services.",
          variant: "destructive" 
        });
        setIsTracking(false);
        setTrackingStart(null);
      }
    );

    // Watch position updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos: Position = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };
        
        setPositions(prev => {
          const updated = [...prev, newPos];
          
          // Calculate total distance
          if (prev.length > 0) {
            const lastPos = prev[prev.length - 1];
            const distDelta = calculateDistance(lastPos, newPos);
            setTrackedDistance(prevDist => {
              const newDistance = prevDist + distDelta;
              
              // Update calories based on new distance and time
              if (trackingStart) {
                const minutes = Math.floor((Date.now() - trackingStart.getTime()) / 60000);
                setElapsedMinutes(minutes);
                const calories = calculateCalories(activityType, minutes, newDistance, dogWeight);
                setEstimatedCalories(calories);
              }
              
              return newDistance;
            });
          }
          
          return updated;
        });
      },
      (error) => {
        console.error('GPS tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
    
    toast({ title: "Tracking started", description: "Recording your walk with GPS..." });
  };

  const handleStopTracking = async () => {
    if (!trackingStart) return;

    // Stop watching position
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const now = new Date();
    const durationMinutes = Math.round((now.getTime() - trackingStart.getTime()) / 60000);

    const success = await addActivity({
      activity_type: activityType,
      duration_minutes: durationMinutes,
      distance_km: trackedDistance,
      calories_burned: estimatedCalories,
      start_time: trackingStart.toISOString(),
      end_time: now.toISOString(),
      tracking_method: 'gps',
      gps_data: positions.length > 0 ? { route: positions } : undefined
    });

    if (success) {
      setIsTracking(false);
      setTrackingStart(null);
      setPositions([]);
      setTrackedDistance(0);
      setEstimatedCalories(0);
      setElapsedMinutes(0);
      onClose();
    }
  };

  // Update elapsed time every second when tracking
  useEffect(() => {
    if (!isTracking || !trackingStart) return;

    const interval = setInterval(() => {
      const minutes = Math.floor((Date.now() - trackingStart.getTime()) / 60000);
      setElapsedMinutes(minutes);
      
      // Recalculate calories
      const calories = calculateCalories(activityType, minutes, trackedDistance, dogWeight);
      setEstimatedCalories(calories);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, trackingStart, activityType, trackedDistance, dogWeight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

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
                {/* Map View */}
                {positions.length > 0 && (
                  <div className="h-64 rounded-lg overflow-hidden border-2 border-border">
                    <MapContainer
                      center={[positions[0].lat, positions[0].lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Polyline 
                        positions={positions.map(p => [p.lat, p.lng] as [number, number])}
                        color="#3b82f6"
                        weight={4}
                      />
                      {positions.length > 0 && (
                        <Marker position={[positions[positions.length - 1].lat, positions[positions.length - 1].lng]} />
                      )}
                      <MapRecenter positions={positions} />
                    </MapContainer>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card rounded-lg p-3 border border-border text-center">
                    <div className="text-2xl font-bold text-primary">
                      {elapsedMinutes}
                    </div>
                    <p className="text-xs text-muted-foreground">Minutes</p>
                  </div>
                  
                  <div className="bg-card rounded-lg p-3 border border-border text-center">
                    <div className="text-2xl font-bold text-blue-500 flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {trackedDistance.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">km</p>
                  </div>
                  
                  <div className="bg-card rounded-lg p-3 border border-border text-center">
                    <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4" />
                      {estimatedCalories}
                    </div>
                    <p className="text-xs text-muted-foreground">calories</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  GPS tracking active
                </p>

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

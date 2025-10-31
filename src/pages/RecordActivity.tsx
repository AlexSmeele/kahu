import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Settings, Play, Square, Flame, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { useDogs } from "@/hooks/useDogs";
import { useMedicalTreatments } from "@/hooks/useMedicalTreatments";
import { useToast } from "@/hooks/use-toast";
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

export default function RecordActivity() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dogId = searchParams.get('dogId');
  const { toast } = useToast();

  // Activity recording states
  const [activityType, setActivityType] = useState("walk");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  
  // Goal editing states
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(60);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // GPS tracking states
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trackedDistance, setTrackedDistance] = useState(0);
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const watchIdRef = useRef<number | null>(null);

  const { addActivity, goal, updateGoal } = useActivity(dogId || '');
  const { dogs } = useDogs();
  const { treatments } = useMedicalTreatments(dogId || '');

  const currentDog = dogs.find(d => d.id === dogId);
  const dogWeight = currentDog?.weight || 15;

  useEffect(() => {
    if (!dogId) {
      toast({ title: "No dog selected", variant: "destructive" });
      navigate('/');
    }
  }, [dogId, navigate, toast]);

  useEffect(() => {
    if (goal) {
      setTargetMinutes(goal.target_minutes);
    }
  }, [goal]);

  // Check if there are active treatments
  const activeTreatments = treatments.filter(t => {
    if (!t.next_due_date) return false;
    const nextDue = new Date(t.next_due_date);
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return nextDue <= twoWeeksFromNow;
  });

  const handleSaveGoal = async () => {
    setIsSavingGoal(true);
    const success = await updateGoal({ target_minutes: targetMinutes });
    setIsSavingGoal(false);
    if (success) {
      setShowGoalEdit(false);
      toast({ title: "Goal updated successfully" });
    }
  };

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
      toast({ title: "Activity recorded" });
      navigate('/');
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
      toast({ title: "Activity saved" });
      navigate('/');
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
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Record Activity</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowGoalEdit(!showGoalEdit)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Goal
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Activity Goal Card (collapsible) */}
        {showGoalEdit && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTreatments.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Active Medical Factors:</p>
                    <ul className="space-y-1 text-sm">
                      {activeTreatments.map(treatment => (
                        <li key={treatment.id} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            {treatment.treatment_name}
                            {treatment.notes && ` - ${treatment.notes}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Consider these factors when setting your activity goal
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="target-minutes">Daily Target (minutes)</Label>
                <Input
                  id="target-minutes"
                  type="number"
                  min="1"
                  max="300"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended range: 30-90 minutes depending on breed and age
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowGoalEdit(false)} 
                  disabled={isSavingGoal}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveGoal} disabled={isSavingGoal}>
                  {isSavingGoal ? "Saving..." : "Save Goal"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Manual Entry / Live Tracking */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="manual">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

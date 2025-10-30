import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { ActivityRecord } from "@/hooks/useActivity";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface WalkMapViewerProps {
  dogId: string;
}

export function WalkMapViewer({ dogId }: WalkMapViewerProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityRecord[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivitiesWithGPS();
  }, [dogId]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, activityTypeFilter, dateFilter]);

  const fetchActivitiesWithGPS = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activity_records")
      .select("*")
      .eq("dog_id", dogId)
      .not("gps_data", "is", null)
      .order("start_time", { ascending: false });

    if (!error && data) {
      setActivities(data);
      if (data.length > 0) {
        setSelectedActivity(data[0]);
      }
    }
    setLoading(false);
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Activity type filter
    if (activityTypeFilter !== "all") {
      filtered = filtered.filter((a) => a.activity_type === activityTypeFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => new Date(a.start_time) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => new Date(a.start_time) >= monthAgo);
    }

    // Search filter (by notes or date)
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          format(new Date(a.start_time), "MMMM d, yyyy").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const getMapCenter = (): [number, number] => {
    if (selectedActivity?.gps_data?.route && selectedActivity.gps_data.route.length > 0) {
      const route = selectedActivity.gps_data.route;
      return [route[0].lat, route[0].lng];
    }
    return [0, 0];
  };

  const getRoutePositions = (activity: ActivityRecord): [number, number][] => {
    if (!activity.gps_data?.route) return [];
    return activity.gps_data.route.map((pos: any) => [pos.lat, pos.lng] as [number, number]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading walks...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No GPS-tracked walks yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start tracking walks to see them on the map
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by date or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="walk">Walk</SelectItem>
                <SelectItem value="run">Run</SelectItem>
                <SelectItem value="play">Play</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary">
            {filteredActivities.length} walk{filteredActivities.length !== 1 ? "s" : ""} found
          </Badge>
        </CardContent>
      </Card>

      {/* Map */}
      {selectedActivity && selectedActivity.gps_data?.route && (
        <Card>
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapContainer
                center={getMapCenter()}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                key={selectedActivity.id}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline
                  positions={getRoutePositions(selectedActivity)}
                  color="#8b5cf6"
                  weight={4}
                  opacity={0.8}
                />
                {selectedActivity.gps_data.route.length > 0 && (
                  <Marker
                    position={[
                      selectedActivity.gps_data.route[0].lat,
                      selectedActivity.gps_data.route[0].lng,
                    ]}
                  >
                    <Popup>Start</Popup>
                  </Marker>
                )}
                {selectedActivity.gps_data.route.length > 1 && (
                  <Marker
                    position={[
                      selectedActivity.gps_data.route[selectedActivity.gps_data.route.length - 1].lat,
                      selectedActivity.gps_data.route[selectedActivity.gps_data.route.length - 1].lng,
                    ]}
                  >
                    <Popup>End</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            {/* Selected Activity Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedActivity.duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedActivity.distance_km?.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>{selectedActivity.calories_burned} cal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Walk History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredActivities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedActivity?.id === activity.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.activity_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.start_time), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{activity.duration_minutes} min</span>
                        <span>{activity.distance_km?.toFixed(1)} km</span>
                        {activity.calories_burned && <span>{activity.calories_burned} cal</span>}
                      </div>
                      {activity.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {activity.notes}
                        </p>
                      )}
                    </div>
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

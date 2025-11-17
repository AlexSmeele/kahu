import { useState, useEffect, useMemo } from 'react';
import { Stethoscope, Search, MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceCard } from './ServiceCard';
import { SearchResultCard } from './SearchResultCard';
import { SearchFilters, type SortOption, type MinRatingOption } from './SearchFilters';
import { AddServiceToDogsModal } from './AddServiceToDogsModal';
import { useVetClinics, type VetClinic } from '@/hooks/useVetClinics';
import { useDogs } from '@/hooks/useDogs';
import { useToast } from '@/hooks/use-toast';

interface VetClinicsSectionProps {
  dogId: string;
}

export function VetClinicsSection({ dogId }: VetClinicsSectionProps) {
  // Hooks
  const { dogVetClinics, isLoading, updateClinicRelationship, removeVetClinic, addVetClinic, searchVetClinics } = useVetClinics(dogId);
  const { dogs } = useDogs();
  const { toast } = useToast();
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VetClinic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [minRating, setMinRating] = useState<MinRatingOption>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<VetClinic | null>(null);

  const currentDog = dogs.find(d => d.id === dogId);

  // Auto-search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      setSortBy('distance');
      setMinRating('all');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setMinRating('all');
      setIsSearching(true);
      setIsSearchMode(true);
      
      try {
        const results = await searchVetClinics(
          searchQuery,
          userLocation?.latitude,
          userLocation?.longitude
        );
        setSearchResults(results);
        
        // Default to distance sort if distances are available, otherwise rating
        const hasDistances = results.some(c => typeof c.distance === 'number');
        setSortBy(hasDistances ? 'distance' : 'rating');
        
        if (results.length === 0) {
          toast({
            title: "No results found",
            description: "Try a different search term or location.",
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "Could not search. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, userLocation]);

  // Location handling
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGettingLocation(false);
        toast({
          title: "Location enabled",
          description: "Search results will be sorted by proximity.",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Location access denied",
          description: "Unable to access your location. Searching without location.",
          variant: "destructive",
        });
      }
    );
  };


  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchMode(false);
    setSortBy('distance');
    setMinRating('all');
  };

  // Filter and sort search results
  const filteredAndSortedResults = useMemo(() => {
    let results = [...searchResults];

    // Apply minimum rating filter
    if (minRating !== 'all') {
      const threshold = parseFloat(minRating);
      results = results.filter(result => 
        result.rating ? result.rating >= threshold : false
      );
    }

    // Compute missing distances client-side if possible
    if (userLocation) {
      const { latitude: lat0, longitude: lon0 } = userLocation;
      const toRad = (x: number) => (x * Math.PI) / 180;
      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
      };

      results = results.map(r =>
        r.distance == null && r.latitude != null && r.longitude != null
          ? { ...r, distance: haversine(lat0, lon0, Number(r.latitude), Number(r.longitude)) }
          : r
      );
    }

    // Apply sorting
    if (sortBy === 'distance') {
      results.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        if (distA !== distB) return distA - distB;
        // Tie-breaker: rating
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    } else if (sortBy === 'rating') {
      results.sort((a, b) => {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        return ratingB - ratingA;
      });
    }

    return results;
  }, [searchResults, sortBy, minRating, userLocation]);

  // Add clinic
  const handleAddClinic = (clinic: VetClinic) => {
    setSelectedClinic(clinic);
    setAddModalOpen(true);
  };

  const handleConfirmAddClinic = async (
    selections: Array<{ dogId: string; isPrimary: boolean; notes: string }>
  ) => {
    if (!selectedClinic) return;

    const dogNames: string[] = [];
    
    try {
      for (const selection of selections) {
        await addVetClinic(
          selection.dogId,
          selectedClinic,
          selection.isPrimary,
          selection.notes
        );
        const dog = dogs.find(d => d.id === selection.dogId);
        if (dog) dogNames.push(dog.name);
      }

      toast({
        title: "Vet clinic added",
        description: `${selectedClinic.name} has been added to ${dogNames.join(', ')}.`,
      });
      
      setSelectedClinic(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add vet clinic. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set preferred
  const handleSetPreferred = async (relationshipId: string) => {
    try {
      await updateClinicRelationship(relationshipId, { is_primary: true });
      toast({
        title: "Primary vet updated",
        description: "Your preferred vet clinic has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferred vet clinic.",
        variant: "destructive",
      });
    }
  };

  // Remove
  const handleRemove = async (relationshipId: string, clinicName: string) => {
    try {
      await removeVetClinic(relationshipId);
      toast({
        title: "Vet clinic removed",
        description: `${clinicName} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove vet clinic.",
        variant: "destructive",
      });
    }
  };

  // Check if already added
  const isClinicAlreadyAdded = (clinicId: string) => {
    return dogVetClinics.some(dvc => dvc.vet_clinic.id === clinicId);
  };

  // Loading state
  if (isLoading && !isSearchMode) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Main render
  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header Area */}
      <div className="flex-shrink-0 px-5 space-y-4">
        {/* Search bar with location button */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for vet clinics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={requestLocation}
            disabled={isGettingLocation || !!userLocation}
            title={userLocation ? "Location enabled" : "Enable location for better results"}
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className={`w-4 h-4 ${userLocation ? 'text-primary' : ''}`} />
            )}
          </Button>
        </div>

        {/* Filter controls */}
        {isSearchMode && searchResults.length > 0 && (
          <div>
            <SearchFilters
              sortBy={sortBy}
              onSortChange={setSortBy}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              hasLocation={searchResults.some(r => typeof r.distance === 'number')}
            />
          </div>
        )}
      </div>

      {/* Scrollable Results Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
        <div className="space-y-6 pt-4">
          {/* Search Results Section */}
          {isSearchMode && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Search Results ({searchResults.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Search
                </Button>
              </div>

              {searchResults.length > 0 && filteredAndSortedResults.length > 0 && (
                <div className="space-y-3">
                  {filteredAndSortedResults.map((clinic) => (
                    <SearchResultCard
                      key={clinic.id}
                      name={clinic.name}
                      address={clinic.address}
                      phone={clinic.phone}
                      website={clinic.website}
                      rating={clinic.rating}
                      userRatingsTotal={clinic.user_ratings_total}
                      distance={clinic.distance}
                      source={clinic.source || 'database'}
                      onAdd={() => handleAddClinic(clinic)}
                      isAlreadyAdded={isClinicAlreadyAdded(clinic.id)}
                    />
                  ))}
                </div>
              )}

              {searchResults.length > 0 && filteredAndSortedResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No results match your filters.</p>
                  <p className="text-sm mt-1">Try adjusting the minimum rating or sort options.</p>
                </div>
              )}

              {/* Divider before saved clinics */}
              {dogVetClinics.length > 0 && (
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-sm font-medium mb-3">Your Saved Vet Clinics</h3>
                </div>
              )}
            </>
          )}

          {/* Your Saved Vet Clinics Section */}
          {!isSearchMode && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Saved Vet Clinics</h3>

              {dogVetClinics.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No vet clinics saved yet. Search above to find and add clinics.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dogVetClinics.map((dvc) => (
                    <ServiceCard
                      key={dvc.id}
                      name={dvc.vet_clinic.name}
                      address={dvc.vet_clinic.address}
                      phone={dvc.vet_clinic.phone}
                      website={dvc.vet_clinic.website}
                      rating={dvc.vet_clinic.rating}
                      userRatingsTotal={dvc.vet_clinic.user_ratings_total}
                      isPreferred={dvc.is_primary}
                      onSetPreferred={() => handleSetPreferred(dvc.id)}
                      onRemove={() => handleRemove(dvc.id, dvc.vet_clinic.name)}
                      linkedDogs={[currentDog].filter(Boolean)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Show saved clinics in search mode too */}
          {isSearchMode && dogVetClinics.length > 0 && (
            <div className="space-y-3">
              {dogVetClinics.map((dvc) => (
                <ServiceCard
                  key={dvc.id}
                  name={dvc.vet_clinic.name}
                  address={dvc.vet_clinic.address}
                  phone={dvc.vet_clinic.phone}
                  website={dvc.vet_clinic.website}
                  rating={dvc.vet_clinic.rating}
                  userRatingsTotal={dvc.vet_clinic.user_ratings_total}
                  isPreferred={dvc.is_primary}
                  onSetPreferred={() => handleSetPreferred(dvc.id)}
                  onRemove={() => handleRemove(dvc.id, dvc.vet_clinic.name)}
                  linkedDogs={[currentDog].filter(Boolean)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddServiceToDogsModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        service={{
          name: selectedClinic?.name || '',
          address: selectedClinic?.address,
          rating: selectedClinic?.rating,
          serviceType: 'vet',
        }}
        dogs={dogs}
        onConfirm={handleConfirmAddClinic}
      />
    </div>
  );
}

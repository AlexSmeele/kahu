import { useState } from 'react';
import { Stethoscope, Search, MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceCard } from './ServiceCard';
import { SearchResultCard } from './SearchResultCard';
import { AddServiceDrawer } from './AddServiceDrawer';
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
  const [selectedToAdd, setSelectedToAdd] = useState<VetClinic | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const currentDog = dogs.find(d => d.id === dogId);

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

  // Search handling
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const results = await searchVetClinics(
        searchQuery,
        userLocation?.latitude,
        userLocation?.longitude
      );
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term or location.",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not search for vet clinics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchMode(false);
  };

  // Add clinic
  const handleAddClinic = async (clinic: VetClinic, data: { isPreferred: boolean; notes: string }) => {
    try {
      await addVetClinic(dogId, clinic, data.isPreferred, data.notes);
      toast({
        title: "Vet clinic added",
        description: `${clinic.name} has been added to ${currentDog?.name}'s profile.`,
      });
      setSelectedToAdd(null);
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
    <div className="space-y-4">
      {/* Helpful intro text when no saved clinics AND not searching */}
      {dogVetClinics.length === 0 && !isSearchMode && (
        <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
          <Stethoscope className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Search below to find vet clinics for {currentDog?.name}
          </p>
        </div>
      )}

      {/* Search bar - ALWAYS visible */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for vet clinics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
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
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
      </div>

      {/* Search results section */}
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

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((clinic) => (
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
                  onAdd={() => setSelectedToAdd(clinic)}
                  isAlreadyAdded={isClinicAlreadyAdded(clinic.id)}
                />
              ))}
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

      {/* Saved vet clinics section */}
      {(!isSearchMode || (isSearchMode && dogVetClinics.length > 0)) && (
        <>
          {!isSearchMode && dogVetClinics.length > 0 && (
            <h3 className="text-sm font-medium">Your Saved Vet Clinics</h3>
          )}
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
              />
            ))}
          </div>
        </>
      )}

      {/* Add confirmation drawer */}
      {selectedToAdd && (
        <AddServiceDrawer
          isOpen={!!selectedToAdd}
          onClose={() => setSelectedToAdd(null)}
          serviceName={selectedToAdd.name}
          serviceType="vet"
          dogName={currentDog?.name || ''}
          onConfirm={(data) => handleAddClinic(selectedToAdd, data)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { Scissors, Search, MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ServiceCard } from './ServiceCard';
import { SearchResultCard } from './SearchResultCard';
import { AddServiceDrawer } from './AddServiceDrawer';
import { EditGroomerModal } from './EditGroomerModal';
import { useGroomers, type DogGroomer, type Groomer } from '@/hooks/useGroomers';
import { useDogs } from '@/hooks/useDogs';
import { useToast } from '@/hooks/use-toast';

interface GroomersSectionProps {
  dogId: string;
}

export function GroomersSection({ dogId }: GroomersSectionProps) {
  const { dogGroomers, isLoading, updateGroomerRelationship, removeGroomer, addGroomer, searchGroomers } = useGroomers(dogId);
  const { dogs } = useDogs();
  const { toast } = useToast();
  
  const [editingGroomer, setEditingGroomer] = useState<DogGroomer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Groomer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Groomer | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const currentDog = dogs.find(d => d.id === dogId);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const results = await searchGroomers(
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
        description: "Could not search for groomers. Please try again.",
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

  const handleAddGroomer = async (groomer: Groomer, data: { isPreferred: boolean; notes: string }) => {
    try {
      await addGroomer(dogId, groomer, data.isPreferred, data.notes);
      toast({
        title: "Groomer added",
        description: `${groomer.name} has been added to ${currentDog?.name}'s profile.`,
      });
      setSelectedToAdd(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add groomer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSetPreferred = async (relationshipId: string) => {
    try {
      await updateGroomerRelationship(relationshipId, { is_preferred: true });
      toast({
        title: "Preferred groomer updated",
        description: "Your preferred groomer has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferred groomer.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (relationshipId: string, groomerName: string) => {
    try {
      await removeGroomer(relationshipId);
      toast({
        title: "Groomer removed",
        description: `${groomerName} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove groomer.",
        variant: "destructive",
      });
    }
  };

  const isGroomerAlreadyAdded = (groomerId: string) => {
    return dogGroomers.some(dg => dg.groomer.id === groomerId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show helpful text when no saved groomers AND not searching */}
      {dogGroomers.length === 0 && !isSearchMode && (
        <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
          <Scissors className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Search below to find trusted groomers for {currentDog?.name}
          </p>
        </div>
      )}

      {/* Search bar - ALWAYS visible */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for groomers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button
          variant={userLocation ? "secondary" : "outline"}
          size="icon"
          onClick={requestLocation}
          disabled={isGettingLocation}
          title={userLocation ? "Location enabled" : "Enable location"}
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className={`w-4 h-4 ${userLocation ? 'text-primary' : ''}`} />
          )}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isSearchMode && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
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
              {searchResults.map((groomer) => (
                <SearchResultCard
                  key={groomer.id}
                  name={groomer.name}
                  businessName={groomer.business_name}
                  address={groomer.address}
                  phone={groomer.phone}
                  website={groomer.website}
                  rating={groomer.rating}
                  userRatingsTotal={groomer.user_ratings_total}
                  distance={groomer.distance}
                  source={groomer.source || 'database'}
                  services={groomer.services}
                  specialties={groomer.specialties}
                  onAdd={() => setSelectedToAdd(groomer)}
                  isAlreadyAdded={isGroomerAlreadyAdded(groomer.id)}
                />
              ))}
            </div>
          )}

          {dogGroomers.length > 0 && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Your Saved Groomers
              </h3>
            </div>
          )}
        </>
      )}

      {(!isSearchMode || (isSearchMode && dogGroomers.length > 0)) && (
        <>
          {!isSearchMode && dogGroomers.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground">
              Your Saved Groomers
            </h3>
          )}
          <div className="space-y-3">
            {dogGroomers.map((dg) => (
              <ServiceCard
                key={dg.id}
                name={dg.groomer.name}
                businessName={dg.groomer.business_name}
                address={dg.groomer.address}
                phone={dg.groomer.phone}
                website={dg.groomer.website}
                rating={dg.groomer.rating}
                userRatingsTotal={dg.groomer.user_ratings_total}
                isPreferred={dg.is_preferred}
                specialties={dg.groomer.specialties}
                services={dg.groomer.services}
                onSetPreferred={() => handleSetPreferred(dg.id)}
                onEdit={() => setEditingGroomer(dg)}
                onRemove={() => handleRemove(dg.id, dg.groomer.name)}
              />
            ))}
          </div>
        </>
      )}

      {editingGroomer && (
        <EditGroomerModal
          isOpen={!!editingGroomer}
          onClose={() => setEditingGroomer(null)}
          dogGroomer={editingGroomer}
          dogName={currentDog?.name || ''}
        />
      )}

      {selectedToAdd && (
        <AddServiceDrawer
          isOpen={!!selectedToAdd}
          onClose={() => setSelectedToAdd(null)}
          serviceName={selectedToAdd.name}
          serviceType="groomer"
          dogName={currentDog?.name || ''}
          onConfirm={(data) => handleAddGroomer(selectedToAdd, data)}
        />
      )}
    </div>
  );
}

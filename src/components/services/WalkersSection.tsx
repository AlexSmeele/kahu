import { useState, useEffect, useMemo } from 'react';
import { Footprints, Search, MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ServiceCard } from './ServiceCard';
import { SearchResultCard } from './SearchResultCard';
import { SearchFilters, type SortOption, type MinRatingOption } from './SearchFilters';
import { EditWalkerModal } from './EditWalkerModal';
import { useDogWalkers, type DogWalker, type Walker } from '@/hooks/useDogWalkers';
import { useDogs } from '@/hooks/useDogs';
import { useToast } from '@/hooks/use-toast';

interface WalkersSectionProps {
  dogId: string;
}

export function WalkersSection({ dogId }: WalkersSectionProps) {
  const { dogWalkers, isLoading, updateWalkerRelationship, removeWalker, addWalker, searchWalkers } = useDogWalkers(dogId);
  const { dogs } = useDogs();
  const { toast } = useToast();
  
  const [editingWalker, setEditingWalker] = useState<DogWalker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Walker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [minRating, setMinRating] = useState<MinRatingOption>('all');

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
        const results = await searchWalkers(
          searchQuery,
          userLocation?.latitude,
          userLocation?.longitude
        );
        setSearchResults(results);
        
        // Default to distance sort if distances are available, otherwise rating
        const hasDistances = results.some(w => typeof w.distance === 'number');
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

  const handleAddWalker = async (walker: Walker) => {
    try {
      // Auto-set first walker as preferred
      const isFirstWalker = dogWalkers.length === 0;
      
      await addWalker(dogId, walker, isFirstWalker, '');
      
      toast({
        title: "Dog walker added",
        description: isFirstWalker
          ? `${walker.name} has been added as ${currentDog?.name}'s preferred walker.`
          : `${walker.name} has been added to ${currentDog?.name}'s profile.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add dog walker. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetPreferred = async (relationshipId: string) => {
    try {
      await updateWalkerRelationship(relationshipId, { is_preferred: true });
      toast({
        title: "Preferred walker updated",
        description: "Your preferred dog walker has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferred dog walker.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (relationshipId: string, walkerName: string) => {
    try {
      await removeWalker(relationshipId);
      toast({
        title: "Dog walker removed",
        description: `${walkerName} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove dog walker.",
        variant: "destructive",
      });
    }
  };

  const isWalkerAlreadyAdded = (walkerId: string) => {
    return dogWalkers.some(dw => dw.walker.id === walkerId);
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

      {/* Search bar - ALWAYS visible */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for dog walkers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
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
      </div>

      {/* Filter controls */}
      {isSearchMode && searchResults.length > 0 && (
        <div className="mb-4">
          <SearchFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            hasLocation={searchResults.some(r => typeof r.distance === 'number')}
          />
            </div>
          )}

          {searchResults.length > 0 && filteredAndSortedResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No results match your filters.</p>
              <p className="text-sm mt-1">Try adjusting the minimum rating or sort options.</p>
            </div>
          )}

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

          {searchResults.length > 0 && filteredAndSortedResults.length > 0 && (
            <div className="space-y-3">
              {filteredAndSortedResults.map((walker) => (
                <SearchResultCard
                  key={walker.id}
                  name={walker.name}
                  businessName={walker.business_name}
                  phone={walker.phone}
                  website={walker.website}
                  rating={walker.rating}
                  userRatingsTotal={walker.user_ratings_total}
                  distance={walker.distance}
                  source={walker.source || 'database'}
                  services={walker.services}
                  serviceArea={walker.service_area}
                  onAdd={() => handleAddWalker(walker)}
                  isAlreadyAdded={isWalkerAlreadyAdded(walker.id)}
                />
              ))}
            </div>
          )}

          {dogWalkers.length > 0 && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Your Saved Dog Walkers
              </h3>
            </div>
          )}
        </>
      )}

      {(!isSearchMode || (isSearchMode && dogWalkers.length > 0)) && (
        <>
          {!isSearchMode && dogWalkers.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground">
              Your Saved Dog Walkers
            </h3>
          )}
          <div className="space-y-3">
            {dogWalkers.map((dw) => (
              <ServiceCard
                key={dw.id}
                name={dw.walker.name}
                businessName={dw.walker.business_name}
                phone={dw.walker.phone}
                website={dw.walker.website}
                rating={dw.walker.rating}
                userRatingsTotal={dw.walker.user_ratings_total}
                isPreferred={dw.is_preferred}
                services={dw.walker.services}
                onSetPreferred={() => handleSetPreferred(dw.id)}
                onEdit={() => setEditingWalker(dw)}
                onRemove={() => handleRemove(dw.id, dw.walker.name)}
              />
            ))}
          </div>
        </>
      )}

      {editingWalker && (
        <EditWalkerModal
          isOpen={!!editingWalker}
          onClose={() => setEditingWalker(null)}
          dogWalker={editingWalker}
          dogName={currentDog?.name || ''}
        />
      )}
    </div>
  );
}

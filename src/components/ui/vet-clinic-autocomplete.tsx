import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  osm_place_id?: string;
  services?: string[];
  verified: boolean;
}

interface VetClinicAutocompleteProps {
  value?: VetClinic | null;
  onChange: (clinic: VetClinic | null) => void;
  placeholder?: string;
  className?: string;
}

export function VetClinicAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search for a veterinary clinic...",
  className 
}: VetClinicAutocompleteProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState<VetClinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationUsed, setLocationUsed] = useState(false);
  const [manualClinic, setManualClinic] = useState<Partial<VetClinic>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Search for clinics
  const searchClinics = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLocationUsed(false);
    
    try {
      // Get user's location for better results (optional)
      let latitude, longitude;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
              timeout: 5000, 
              enableHighAccuracy: false 
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          setLocationUsed(true);
        } catch (e) {
          console.log('Geolocation not available, searching without location');
          setLocationUsed(false);
        }
      }

      const { data, error: searchError } = await supabase.functions.invoke('search-vet-clinics', {
        body: { 
          query: searchQuery,
          latitude,
          longitude
        }
      });

      if (searchError) {
        setError('Search failed. Please try again.');
        console.error('Search error:', searchError);
        return;
      }

      setResults(data?.clinics || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching clinics:', error);
      setError('Search failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (newQuery: string) => {
    setQuery(newQuery);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchClinics(newQuery);
    }, 300);
  };

  // Select a clinic from results
  const handleSelectClinic = (clinic: VetClinic) => {
    setQuery(clinic.name);
    setShowResults(false);
    setShowManualEntry(false);
    onChange(clinic);
  };

  // Handle manual clinic entry
  const handleManualSubmit = () => {
    if (!manualClinic.name || !manualClinic.address) {
      return;
    }

    const clinic: VetClinic = {
      id: `manual_${Date.now()}`,
      name: manualClinic.name,
      address: manualClinic.address,
      phone: manualClinic.phone || undefined,
      email: manualClinic.email || undefined,
      website: manualClinic.website || undefined,
      verified: false,
      services: []
    };

    setQuery(clinic.name);
    setShowResults(false);
    setShowManualEntry(false);
    onChange(clinic);
    
    // Reset manual form
    setManualClinic({
      name: '',
      address: '',
      phone: '',
      email: '',
      website: ''
    });
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto bg-background border shadow-lg">
          <div className="p-2">
            {locationUsed && (
              <div className="px-2 py-1 mb-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded">
                <MapPin className="inline h-3 w-3 mr-1" />
                Showing results near your location
              </div>
            )}
            {results.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => handleSelectClinic(clinic)}
                className="w-full text-left p-3 hover:bg-accent rounded-md transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{clinic.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{clinic.address}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {clinic.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{clinic.phone}</span>
                        </div>
                      )}
                      {clinic.website && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>Website</span>
                        </div>
                      )}
                      {clinic.verified && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No results message and manual entry option */}
      {showResults && results.length === 0 && !isLoading && !error && query.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 bg-background border shadow-lg">
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No veterinary clinics found for "{query}"
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {locationUsed 
                ? "We searched in your area using your location." 
                : "Enable location permissions for better local results."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowManualEntry(true);
                setShowResults(false);
                setManualClinic({ ...manualClinic, name: query });
              }}
            >
              Add clinic manually
            </Button>
          </div>
        </Card>
      )}

      {/* Error message */}
      {showResults && error && !isLoading && (
        <Card className="absolute z-50 w-full mt-1 bg-background border shadow-lg">
          <div className="p-4 text-center">
            <p className="text-sm text-destructive mb-3">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => searchClinics(query)}
            >
              Try again
            </Button>
          </div>
        </Card>
      )}

      {/* Manual Entry Form */}
      <Collapsible open={showManualEntry} onOpenChange={setShowManualEntry}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 justify-between"
            type="button"
          >
            Add clinic manually
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-name">Clinic Name *</Label>
                <Input
                  id="manual-name"
                  value={manualClinic.name || ''}
                  onChange={(e) => setManualClinic({ ...manualClinic, name: e.target.value })}
                  placeholder="Enter clinic name"
                />
              </div>
              <div>
                <Label htmlFor="manual-address">Address *</Label>
                <Input
                  id="manual-address"
                  value={manualClinic.address || ''}
                  onChange={(e) => setManualClinic({ ...manualClinic, address: e.target.value })}
                  placeholder="Enter full address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-phone">Phone</Label>
                  <Input
                    id="manual-phone"
                    value={manualClinic.phone || ''}
                    onChange={(e) => setManualClinic({ ...manualClinic, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-email">Email</Label>
                  <Input
                    id="manual-email"
                    type="email"
                    value={manualClinic.email || ''}
                    onChange={(e) => setManualClinic({ ...manualClinic, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="manual-website">Website</Label>
                <Input
                  id="manual-website"
                  value={manualClinic.website || ''}
                  onChange={(e) => setManualClinic({ ...manualClinic, website: e.target.value })}
                  placeholder="Website URL"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualClinic.name || !manualClinic.address}
                  size="sm"
                >
                  Add Clinic
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowManualEntry(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
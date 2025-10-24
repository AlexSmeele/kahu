import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllBreeds } from '@/hooks/useBreedInfo';
import { supabase } from '@/integrations/supabase/client';

// Fallback breed names for when API data is not available
const LOCAL_BREED_NAMES: string[] = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog', 'Poodle',
  'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Siberian Husky',
  'Mixed Breed', 'Chihuahua', 'Shih Tzu', 'Boston Terrier', 'Pomeranian',
  'Australian Shepherd', 'Border Collie', 'Cocker Spaniel', 'Boxer', 'French Bulldog'
];

interface BreedAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBreedIdChange?: (breedId: string | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function BreedAutocomplete({ 
  value, 
  onChange, 
  onBreedIdChange,
  placeholder = "e.g., Golden Retriever, Mixed", 
  className,
  required = false 
}: BreedAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [showCustomOption, setShowCustomOption] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allBreeds = [], isLoading: isLoadingBreeds, error: breedsError } = useAllBreeds();
  const availableBreeds = useMemo(() => {
    // Always prefer database breeds if available
    if (allBreeds && allBreeds.length > 0) {
      console.log(`Loaded ${allBreeds.length} breeds from database`);
      return allBreeds;
    }
    // Fallback to local breeds only if loading failed
    if (breedsError) {
      console.warn('Failed to load breeds from database, using fallback list:', breedsError);
    }
    return LOCAL_BREED_NAMES;
  }, [allBreeds, breedsError]);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter breeds based on input
  useEffect(() => {
    if (availableBreeds.length > 0) {
      if (inputValue.trim()) {
        const filtered = availableBreeds.filter((breed: string) =>
          breed.toLowerCase().includes(inputValue.toLowerCase())
        ).slice(0, 20); // Show top 20 matches
        setFilteredBreeds(filtered);
        const exactMatch = availableBreeds.some((breed: string) => 
          breed.toLowerCase() === inputValue.toLowerCase()
        );
        setShowCustomOption(!exactMatch && inputValue.length > 2);
      } else {
        // Show top suggestions when empty
        setFilteredBreeds(availableBreeds.slice(0, 20));
        setShowCustomOption(false);
      }
    } else {
      setFilteredBreeds([]);
      setShowCustomOption(false);
    }
  }, [inputValue, availableBreeds]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    if (newValue.trim()) {
      setOpen(true);
    }
  };

  const handleBreedSelect = async (breed: string) => {
    setInputValue(breed);
    onChange(breed);
    setOpen(false);
    
    // Find breed ID for the selected breed (fallback to null if not available)
    if (onBreedIdChange) {
      try {
        const { data, error } = await supabase
          .from('dog_breeds')
          .select('id')
          .ilike('breed', breed)
          .maybeSingle();
        if (error) throw error;
        onBreedIdChange(data?.id || null);
      } catch (e) {
        onBreedIdChange(null);
      }
    }
  };

  const handleCustomBreed = async () => {
    setLoading(true);
    try {
      // If not authenticated, fallback to local selection without saving
      const { data: sessionData } = await supabase.auth.getSession();
      const isAuthed = Boolean(sessionData?.session);

      if (!isAuthed) {
        onChange(inputValue.trim());
        if (onBreedIdChange) onBreedIdChange(null);
        setOpen(false);
        return;
      }

      // Insert custom breed into database when authenticated
      const { data, error } = await supabase
        .from('dog_breeds')
        .insert({ breed: inputValue.trim() })
        .select('id, breed')
        .single();

      if (error) throw error;

      onChange(data.breed);
      if (onBreedIdChange) {
        onBreedIdChange(data.id);
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving custom breed:', error);
      // Graceful fallback
      onChange(inputValue.trim());
      if (onBreedIdChange) onBreedIdChange(null);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow selection clicks
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="pr-8"
        required={required}
      />
      
      {open && (filteredBreeds.length > 0 || showCustomOption) && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          <ScrollArea className="max-h-60">
            <div className="p-1">
              {isLoadingBreeds && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading breeds from database...
                </div>
              )}
              {filteredBreeds.map((breed) => (
                <div
                  key={breed}
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                  onClick={() => handleBreedSelect(breed)}
                >
                  {breed}
                </div>
              ))}
              
              {!isLoadingBreeds && filteredBreeds.length > 0 && availableBreeds.length > filteredBreeds.length && (
                <div className="px-2 py-1 text-xs text-muted-foreground text-center border-t">
                  Showing {filteredBreeds.length} of {availableBreeds.length} breeds
                </div>
              )}
              
              {showCustomOption && (
                <div
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm border-t flex items-center gap-2"
                  onClick={handleCustomBreed}
                >
                  <Plus className="w-3 h-3" />
                  {loading ? 'Saving...' : `Save "${inputValue}" as custom breed`}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

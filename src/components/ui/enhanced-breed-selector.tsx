import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useAllBreeds } from '@/hooks/useBreedInfo';
import { useCustomBreeds, useCreateCustomBreed } from '@/hooks/useCustomBreeds';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X } from 'lucide-react';

interface EnhancedBreedSelectorProps {
  value?: string;
  onBreedSelect: (breedId: string, isCustom: boolean, breedName: string) => void;
  placeholder?: string;
  className?: string;
  defaultTab?: 'standard' | 'custom' | 'create';
}

interface ParentBreed {
  id: string;
  name: string;
  percentage: number;
}

export function EnhancedBreedSelector({ 
  value, 
  onBreedSelect, 
  placeholder = "Select or create a breed...",
  className,
  defaultTab = 'standard'
}: EnhancedBreedSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(defaultTab);
  
  // Custom breed creation state
  const [customBreedName, setCustomBreedName] = useState('');
  const [customBreedDescription, setCustomBreedDescription] = useState('');
  const [parentBreeds, setParentBreeds] = useState<ParentBreed[]>([]);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [breedOptions, setBreedOptions] = useState<Array<{ id: string; name: string }>>([]);

  const { data: standardBreeds = [], isLoading: loadingStandard } = useAllBreeds();
  const { data: customBreeds = [], isLoading: loadingCustom } = useCustomBreeds();
  const createCustomBreed = useCreateCustomBreed();

  // Fetch breed IDs for the dropdown
  React.useEffect(() => {
    const fetchBreedIds = async () => {
      const { data } = await supabase
        .from('dog_breeds')
        .select('id, breed')
        .order('breed');
      
      if (data) {
        setBreedOptions(data.map(b => ({ id: b.id, name: b.breed })));
      }
    };
    fetchBreedIds();
  }, []);

  const filteredStandardBreeds = standardBreeds.filter(breed =>
    breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomBreeds = customBreeds.filter(breed =>
    breed.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStandardBreedSelect = async (breedName: string) => {
    // Get breed ID
    const { data } = await supabase
      .from('dog_breeds')
      .select('id')
      .eq('breed', breedName)
      .single();
    
    if (data) {
      onBreedSelect(data.id, false, breedName);
      setIsOpen(false);
    }
  };

  const handleCustomBreedSelect = (customBreed: any) => {
    onBreedSelect(customBreed.id, true, customBreed.name);
    setIsOpen(false);
  };

  const addParentBreed = async () => {
    if (!selectedParentId || parentBreeds.length >= 3) return;

    const { data } = await supabase
      .from('dog_breeds')
      .select('breed')
      .eq('id', selectedParentId)
      .single();

    if (data && !parentBreeds.some(p => p.id === selectedParentId)) {
      const newParent: ParentBreed = {
        id: selectedParentId,
        name: data.breed,
        percentage: parentBreeds.length === 0 ? 100 : 50,
      };
      
      setParentBreeds([...parentBreeds, newParent]);
      setSelectedParentId('');
      
      // Adjust percentages to total 100%
      if (parentBreeds.length === 0) {
        // First parent gets 100%
      } else if (parentBreeds.length === 1) {
        // Split 50/50
        setParentBreeds(prev => [
          { ...prev[0], percentage: 50 },
          { ...newParent, percentage: 50 }
        ]);
      } else {
        // Three breeds, split evenly
        const evenSplit = Math.floor(100 / (parentBreeds.length + 1));
        setParentBreeds(prev => [
          ...prev.map(p => ({ ...p, percentage: evenSplit })),
          { ...newParent, percentage: 100 - (evenSplit * parentBreeds.length) }
        ]);
      }
    }
  };

  const removeParentBreed = (indexToRemove: number) => {
    const newParents = parentBreeds.filter((_, index) => index !== indexToRemove);
    setParentBreeds(newParents);
    
    // Redistribute percentages
    if (newParents.length === 1) {
      setParentBreeds([{ ...newParents[0], percentage: 100 }]);
    } else if (newParents.length === 2) {
      setParentBreeds([
        { ...newParents[0], percentage: 50 },
        { ...newParents[1], percentage: 50 }
      ]);
    }
  };

  const updateParentPercentage = (index: number, percentage: number) => {
    const newParents = [...parentBreeds];
    newParents[index].percentage = percentage;
    
    // Auto-adjust other percentages
    const remaining = 100 - percentage;
    const otherCount = newParents.length - 1;
    
    if (otherCount > 0) {
      const perOther = Math.floor(remaining / otherCount);
      const remainder = remaining % otherCount;
      
      newParents.forEach((parent, i) => {
        if (i !== index) {
          parent.percentage = perOther + (i < remainder ? 1 : 0);
        }
      });
    }
    
    setParentBreeds(newParents);
  };

  const handleCreateCustomBreed = async () => {
    if (!customBreedName.trim()) return;

    const breedData = {
      name: customBreedName,
      description: customBreedDescription || null,
      notes: null,
      parent_breed_1_id: parentBreeds[0]?.id || null,
      parent_breed_1_percentage: parentBreeds[0]?.percentage || null,
      parent_breed_2_id: parentBreeds[1]?.id || null,
      parent_breed_2_percentage: parentBreeds[1]?.percentage || null,
      parent_breed_3_id: parentBreeds[2]?.id || null,
      parent_breed_3_percentage: parentBreeds[2]?.percentage || null,
      exercise_needs_override: null,
      weight_male_adult_min_override: null,
      weight_male_adult_max_override: null,
      weight_female_adult_min_override: null,
      weight_female_adult_max_override: null,
      temperament_override: null,
      grooming_needs_override: null,
      health_notes_override: null,
    };

    createCustomBreed.mutate(breedData, {
      onSuccess: (newBreed) => {
        onBreedSelect(newBreed.id, true, newBreed.name);
        setIsOpen(false);
        setCustomBreedName('');
        setCustomBreedDescription('');
        setParentBreeds([]);
      },
    });
  };

  const getCurrentBreedName = () => {
    if (!value) return placeholder;
    
    // Try to find in standard breeds first
    const standardBreed = standardBreeds.find(breed => {
      // This is a simplified check - in a real implementation, you'd want to match by ID
      return breed.toLowerCase() === value.toLowerCase();
    });
    
    if (standardBreed) return standardBreed;
    
    // Try to find in custom breeds
    const customBreed = customBreeds.find(breed => breed.id === value);
    if (customBreed) return customBreed.name;
    
    return placeholder;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) {
        setSelectedTab(defaultTab);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`justify-start ${className}`}>
          {getCurrentBreedName()}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedTab === 'create' ? 'Create Custom/Mixed Breed' : 'Select or Create Breed'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {selectedTab !== 'create' && (
            <Input
              placeholder="Search breeds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'standard' | 'custom' | 'create')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Standard Breeds</TabsTrigger>
              <TabsTrigger value="custom">My Custom Breeds</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-2">
              <div className="max-h-60 overflow-y-auto space-y-1">
                {loadingStandard ? (
                  <div>Loading breeds...</div>
                ) : (
                  filteredStandardBreeds.map((breed) => (
                    <Button
                      key={breed}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleStandardBreedSelect(breed)}
                    >
                      {breed}
                    </Button>
                  ))
                )}
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedTab('create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom/Mixed Breed
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-2">
              <div className="max-h-60 overflow-y-auto space-y-1">
                {loadingCustom ? (
                  <div>Loading custom breeds...</div>
                ) : filteredCustomBreeds.length === 0 ? (
                  <div className="text-muted-foreground text-center py-4">
                    No custom breeds yet
                  </div>
                ) : (
                  filteredCustomBreeds.map((breed) => (
                    <Button
                      key={breed.id}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleCustomBreedSelect(breed)}
                    >
                      <div>
                        <div className="font-medium">{breed.name}</div>
                        {breed.description && (
                          <div className="text-sm text-muted-foreground">
                            {breed.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))
                )}
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedTab('create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Custom Breed
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {selectedTab === 'create' && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="breed-name">Breed Name *</Label>
                <Input
                  id="breed-name"
                  value={customBreedName}
                  onChange={(e) => setCustomBreedName(e.target.value)}
                  placeholder="e.g., Golden Retriever Mix"
                />
              </div>
              
              <div>
                <Label htmlFor="breed-description">Description</Label>
                <Textarea
                  id="breed-description"
                  value={customBreedDescription}
                  onChange={(e) => setCustomBreedDescription(e.target.value)}
                  placeholder="Optional description of your custom breed"
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Parent Breeds (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add up to 3 parent breeds for mixed breeds to get better recommendations
                </p>
                
                <div className="space-y-2">
                  {parentBreeds.map((parent, index) => (
                    <div key={parent.id} className="flex items-center gap-2 p-2 border rounded">
                      <Badge variant="secondary">{parent.name}</Badge>
                      <div className="flex-1">
                        <Slider
                          value={[parent.percentage]}
                          onValueChange={([value]) => updateParentPercentage(index, value)}
                          max={100}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {parent.percentage}%
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParentBreed(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {parentBreeds.length < 3 && (
                    <div className="flex gap-2">
                      <select
                        value={selectedParentId}
                        onChange={(e) => setSelectedParentId(e.target.value)}
                        className="flex-1 p-2 border rounded bg-background"
                      >
                        <option value="">Select parent breed...</option>
                        {breedOptions.map((breed) => (
                          <option key={breed.id} value={breed.id}>
                            {breed.name}
                          </option>
                        ))}
                      </select>
                      <Button onClick={addParentBreed} disabled={!selectedParentId}>
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCustomBreed}
                  disabled={!customBreedName.trim() || createCustomBreed.isPending}
                  className="flex-1"
                >
                  {createCustomBreed.isPending ? 'Creating...' : 'Create Breed'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTab('standard')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
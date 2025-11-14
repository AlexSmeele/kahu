import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useDogWalkers, type DogWalker } from '@/hooks/useDogWalkers';
import { useToast } from '@/hooks/use-toast';

interface AddWalkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  dogName: string;
}

export function AddWalkerModal({ isOpen, onClose, dogId, dogName }: AddWalkerModalProps) {
  const { addWalker, searchWalkers } = useDogWalkers(dogId);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DogWalker[]>([]);
  const [selectedWalker, setSelectedWalker] = useState<DogWalker | null>(null);
  const [isPreferred, setIsPreferred] = useState(false);
  const [relationshipNotes, setRelationshipNotes] = useState('');
  const [preferredDays, setPreferredDays] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchWalkers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not search for dog walkers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddWalker = async () => {
    if (!selectedWalker) return;

    setIsAdding(true);
    try {
      await addWalker(dogId, selectedWalker, isPreferred, relationshipNotes);
      toast({
        title: "Dog walker added",
        description: `${selectedWalker.name} has been added to ${dogName}'s profile.`,
      });
      onClose();
      // Reset state
      setSearchQuery('');
      setSearchResults([]);
      setSelectedWalker(null);
      setIsPreferred(false);
      setRelationshipNotes('');
      setPreferredDays('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add dog walker. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add dog walker for {dogName}</DialogTitle>
          <DialogDescription>
            Search for a dog walking service to add to {dogName}'s profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search for dog walkers</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter walker name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedWalker && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <Label>Search results</Label>
              {searchResults.map((walker) => (
                <Card 
                  key={walker.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedWalker(walker)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium">{walker.name}</p>
                    {walker.service_area && (
                      <p className="text-sm text-muted-foreground">Service area: {walker.service_area}</p>
                    )}
                    {walker.rating && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ⭐ {walker.rating.toFixed(1)} ({walker.user_ratings_total} reviews)
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selected Walker Details */}
          {selectedWalker && (
            <div className="space-y-4">
              <Card className="border-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{selectedWalker.name}</p>
                      {selectedWalker.service_area && (
                        <p className="text-sm text-muted-foreground">
                          Service area: {selectedWalker.service_area}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWalker(null)}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preferred"
                  checked={isPreferred}
                  onCheckedChange={(checked) => setIsPreferred(checked as boolean)}
                />
                <Label htmlFor="preferred" className="cursor-pointer">
                  Set as preferred dog walker
                </Label>
              </div>

              {isPreferred && (
                <div className="space-y-2">
                  <Label htmlFor="preferredDays">Preferred walking days (optional)</Label>
                  <Input
                    id="preferredDays"
                    placeholder="e.g., Monday, Wednesday, Friday"
                    value={preferredDays}
                    onChange={(e) => setPreferredDays(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or preferences..."
                  value={relationshipNotes}
                  onChange={(e) => setRelationshipNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddWalker} disabled={isAdding}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isAdding ? 'Adding...' : 'Add walker'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

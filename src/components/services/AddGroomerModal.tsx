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
import { useGroomers, type Groomer } from '@/hooks/useGroomers';
import { useToast } from '@/hooks/use-toast';

interface AddGroomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  dogName: string;
}

export function AddGroomerModal({ isOpen, onClose, dogId, dogName }: AddGroomerModalProps) {
  const { addGroomer, searchGroomers } = useGroomers(dogId);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Groomer[]>([]);
  const [selectedGroomer, setSelectedGroomer] = useState<Groomer | null>(null);
  const [isPreferred, setIsPreferred] = useState(false);
  const [relationshipNotes, setRelationshipNotes] = useState('');
  const [preferredGroomerName, setPreferredGroomerName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchGroomers(searchQuery);
      setSearchResults(results);
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

  const handleAddGroomer = async () => {
    if (!selectedGroomer) return;

    setIsAdding(true);
    try {
      await addGroomer(dogId, selectedGroomer, isPreferred, relationshipNotes);
      toast({
        title: "Groomer added",
        description: `${selectedGroomer.name} has been added to ${dogName}'s profile.`,
      });
      onClose();
      // Reset state
      setSearchQuery('');
      setSearchResults([]);
      setSelectedGroomer(null);
      setIsPreferred(false);
      setRelationshipNotes('');
      setPreferredGroomerName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add groomer. Please try again.",
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
          <DialogTitle>Add groomer for {dogName}</DialogTitle>
          <DialogDescription>
            Search for a grooming service or salon to add to {dogName}'s profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search for groomers</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter groomer name or location..."
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
          {searchResults.length > 0 && !selectedGroomer && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <Label>Search results</Label>
              {searchResults.map((groomer) => (
                <Card 
                  key={groomer.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedGroomer(groomer)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium">{groomer.name}</p>
                    <p className="text-sm text-muted-foreground">{groomer.address}</p>
                    {groomer.rating && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ⭐ {groomer.rating.toFixed(1)} ({groomer.user_ratings_total} reviews)
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selected Groomer Details */}
          {selectedGroomer && (
            <div className="space-y-4">
              <Card className="border-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{selectedGroomer.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedGroomer.address}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedGroomer(null)}
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
                  Set as preferred groomer
                </Label>
              </div>

              {isPreferred && (
                <div className="space-y-2">
                  <Label htmlFor="preferredGroomerName">Preferred groomer's name (optional)</Label>
                  <Input
                    id="preferredGroomerName"
                    placeholder="e.g., Sarah Smith"
                    value={preferredGroomerName}
                    onChange={(e) => setPreferredGroomerName(e.target.value)}
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
                <Button variant="primary" onClick={handleAddGroomer} disabled={isAdding}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isAdding ? 'Adding...' : 'Add groomer'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

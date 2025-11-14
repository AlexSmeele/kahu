import { useState } from 'react';
import { Footprints, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ServiceCard } from './ServiceCard';
import { AddWalkerModal } from './AddWalkerModal';
import { EditWalkerModal } from './EditWalkerModal';
import { useDogWalkers, type DogDogWalker } from '@/hooks/useDogWalkers';
import { useDogs } from '@/hooks/useDogs';
import { useToast } from '@/hooks/use-toast';

interface WalkersSectionProps {
  dogId: string;
}

export function WalkersSection({ dogId }: WalkersSectionProps) {
  const { dogWalkers, isLoading, updateWalkerRelationship, removeWalker } = useDogWalkers(dogId);
  const { dogs } = useDogs();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWalker, setEditingWalker] = useState<DogDogWalker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDog = dogs.find(d => d.id === dogId);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (dogWalkers.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Footprints className="w-8 h-8" />}
          title="No dog walkers yet"
          description={`Find reliable dog walkers to keep ${currentDog?.name} active and happy when you're busy.`}
          action={{
            label: "Find walkers",
            onClick: () => setIsAddModalOpen(true),
          }}
        />
        <AddWalkerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          dogId={dogId}
          dogName={currentDog?.name || ''}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for dog walkers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

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

      <AddWalkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        dogId={dogId}
        dogName={currentDog?.name || ''}
      />

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

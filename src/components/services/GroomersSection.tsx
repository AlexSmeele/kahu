import { useState } from 'react';
import { Scissors, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ServiceCard } from './ServiceCard';
import { AddGroomerModal } from './AddGroomerModal';
import { EditGroomerModal } from './EditGroomerModal';
import { useGroomers, type DogGroomer } from '@/hooks/useGroomers';
import { useDogs } from '@/hooks/useDogs';
import { useToast } from '@/hooks/use-toast';

interface GroomersSectionProps {
  dogId: string;
}

export function GroomersSection({ dogId }: GroomersSectionProps) {
  const { dogGroomers, isLoading, updateGroomerRelationship, removeGroomer } = useGroomers(dogId);
  const { dogs } = useDogs();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGroomer, setEditingGroomer] = useState<DogGroomer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDog = dogs.find(d => d.id === dogId);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (dogGroomers.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Scissors className="w-8 h-8" />}
          title="No groomers yet"
          description={`Find trusted groomers for ${currentDog?.name}'s coat care and hygiene needs.`}
          action={{
            label: "Find groomers",
            onClick: () => setIsAddModalOpen(true),
          }}
        />
        <AddGroomerModal
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
            placeholder="Search for groomers..."
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

      <AddGroomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        dogId={dogId}
        dogName={currentDog?.name || ''}
      />

      {editingGroomer && (
        <EditGroomerModal
          isOpen={!!editingGroomer}
          onClose={() => setEditingGroomer(null)}
          dogGroomer={editingGroomer}
          dogName={currentDog?.name || ''}
        />
      )}
    </div>
  );
}

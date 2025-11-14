import { useState } from 'react';
import { Stethoscope, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ServiceCard } from './ServiceCard';
import { VetClinicsModal } from '@/components/health/VetClinicsModal';
import { useVetClinics } from '@/hooks/useVetClinics';
import { useDogs } from '@/hooks/useDogs';
import { useToast } from '@/hooks/use-toast';

interface VetClinicsSectionProps {
  dogId: string;
}

export function VetClinicsSection({ dogId }: VetClinicsSectionProps) {
  const { dogVetClinics, isLoading, updateClinicRelationship, removeVetClinic } = useVetClinics(dogId);
  const { dogs } = useDogs();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentDog = dogs.find(d => d.id === dogId);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (dogVetClinics.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Stethoscope className="w-8 h-8" />}
          title="No vet clinics yet"
          description={`Add ${currentDog?.name}'s vet clinic so Kahu can help you stay on top of health appointments and records.`}
          action={{
            label: "Add clinic",
            onClick: () => setIsModalOpen(true),
          }}
        />
        {currentDog && (
          <VetClinicsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            dogId={dogId}
            dogName={currentDog.name}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
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

      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsModalOpen(true)}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add another clinic
      </Button>

      {currentDog && (
        <VetClinicsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          dogId={dogId}
          dogName={currentDog.name}
        />
      )}
    </div>
  );
}

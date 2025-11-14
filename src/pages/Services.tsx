import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Scissors, Footprints } from 'lucide-react';
import { PageHeader } from '@/components/headers/PageHeader';
import { DogDropdown } from '@/components/dogs/DogDropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VetClinicsSection } from '@/components/services/VetClinicsSection';
import { GroomersSection } from '@/components/services/GroomersSection';
import { WalkersSection } from '@/components/services/WalkersSection';
import { useDogs } from '@/hooks/useDogs';

export default function Services() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [selectedDogId, setSelectedDogId] = useState(dogs[0]?.id || '');

  if (!dogs.length) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Third-party services" onBack={() => navigate('/')} />
        <div className="p-5">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Please add a dog to your profile before managing services.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Third-party services" onBack={() => navigate('/')} />
      
      <div className="p-5 space-y-4">
        {/* Dog Selector */}
        {dogs.length > 1 && (
          <div className="mb-4">
            <DogDropdown
              selectedDogId={selectedDogId}
              onDogChange={setSelectedDogId}
              variant="inline"
            />
          </div>
        )}

        {/* Service Tabs */}
        <Tabs defaultValue="vets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="vets" className="gap-2">
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Vet Clinics</span>
              <span className="sm:hidden">Vets</span>
            </TabsTrigger>
            <TabsTrigger value="groomers" className="gap-2">
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Groomers</span>
              <span className="sm:hidden">Groom</span>
            </TabsTrigger>
            <TabsTrigger value="walkers" className="gap-2">
              <Footprints className="w-4 h-4" />
              <span className="hidden sm:inline">Dog Walkers</span>
              <span className="sm:hidden">Walk</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vets" className="mt-0">
            {selectedDogId && <VetClinicsSection dogId={selectedDogId} />}
          </TabsContent>

          <TabsContent value="groomers" className="mt-0">
            {selectedDogId && <GroomersSection dogId={selectedDogId} />}
          </TabsContent>

          <TabsContent value="walkers" className="mt-0">
            {selectedDogId && <WalkersSection dogId={selectedDogId} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

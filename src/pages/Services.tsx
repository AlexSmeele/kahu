import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Scissors, Footprints, List, MapIcon } from 'lucide-react';
import { PageHeader } from '@/components/headers/PageHeader';
import { DogDropdown } from '@/components/dogs/DogDropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { VetClinicsSection } from '@/components/services/VetClinicsSection';
import { GroomersSection } from '@/components/services/GroomersSection';
import { WalkersSection } from '@/components/services/WalkersSection';
import { ServicesMapView } from '@/components/services/ServicesMapView';
import { useDogs } from '@/hooks/useDogs';

export default function Services() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [selectedDogId, setSelectedDogId] = useState(dogs[0]?.id || '');
  const [view, setView] = useState<'list' | 'map'>('list');

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
        {/* Dog Selector and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          {dogs.length > 1 && (
            <DogDropdown
              selectedDogId={selectedDogId}
              onDogChange={setSelectedDogId}
              variant="inline"
            />
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={view === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('map')}
            >
              <MapIcon className="w-4 h-4 mr-1" />
              Map
            </Button>
          </div>
        </div>

        {/* Conditional rendering based on view */}
        {view === 'map' ? (
          selectedDogId && <ServicesMapView dogId={selectedDogId} />
        ) : (
          /* Service Tabs */
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
        )}
      </div>
    </div>
  );
}

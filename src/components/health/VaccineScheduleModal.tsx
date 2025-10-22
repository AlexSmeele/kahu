import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Shield, Heart, MapPin, Plus, Clock } from "lucide-react";
import { useVaccines } from "@/hooks/useVaccines";
import { AddVaccinationModal } from "./AddVaccinationModal";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VaccineScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  dogName: string;
  dogBirthday?: Date;
}

export function VaccineScheduleModal({
  isOpen,
  onClose,
  dogId,
  dogName,
  dogBirthday,
}: VaccineScheduleModalProps) {
  const [isAddVaccinationOpen, setIsAddVaccinationOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<string>('');
  
  const {
    vaccines,
    vaccinationRecords,
    getCoreVaccines,
    getLifestyleVaccines,
    getRegionalVaccines,
    getInjectableTherapies,
    getVaccinationStatus,
    refetch
  } = useVaccines(dogId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up_to_date': return 'bg-success text-success-foreground';
      case 'due_soon': return 'bg-warning text-warning-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      case 'not_given': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'up_to_date': return 'Up to date';
      case 'due_soon': return 'Due soon';
      case 'overdue': return 'Overdue';
      case 'not_given': return 'Not given';
      default: return 'Unknown';
    }
  };

  const getLatestRecord = (vaccineId: string) => {
    return vaccinationRecords.find(r => r.vaccine_id === vaccineId);
  };

  const handleVaccineClick = (vaccineId: string) => {
    setSelectedVaccine(vaccineId);
    setIsAddVaccinationOpen(true);
  };

  const VaccineCard = ({ vaccine }: { vaccine: any }) => {
    const status = getVaccinationStatus(vaccine.id);
    const latestRecord = getLatestRecord(vaccine.id);

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleVaccineClick(vaccine.id)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{vaccine.name}</CardTitle>
            <Badge className={`text-xs ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </Badge>
          </div>
          <CardDescription className="text-xs">{vaccine.protects_against}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {latestRecord && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Last: {formatDistanceToNow(new Date(latestRecord.administered_date), { addSuffix: true })}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{vaccine.schedule_info}</p>
            {vaccine.notes && (
              <p className="text-xs text-muted-foreground font-medium">{vaccine.notes}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[min(95vw,800px)] max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Vaccination Schedule - {dogName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Manage vaccinations and injectable therapies
            </p>
          </DialogHeader>

          <Tabs defaultValue="core" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="core" className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Core
              </TabsTrigger>
              <TabsTrigger value="lifestyle" className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Lifestyle
              </TabsTrigger>
              <TabsTrigger value="regional" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Regional
              </TabsTrigger>
              <TabsTrigger value="therapies" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Therapies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="core" className="flex-1 flex flex-col overflow-hidden mt-4 data-[state=active]:flex data-[state=inactive]:hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                  <h3 className="font-semibold">Core Vaccines</h3>
                  <p className="text-sm text-muted-foreground">Essential vaccines recommended for all dogs</p>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 gap-4 pr-4">
                  {getCoreVaccines().map((vaccine) => (
                    <VaccineCard key={vaccine.id} vaccine={vaccine} />
                  ))}
                </div>
                {getCoreVaccines().length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No core vaccines found</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="lifestyle" className="flex-1 flex flex-col overflow-hidden mt-4 data-[state=active]:flex data-[state=inactive]:hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                  <h3 className="font-semibold">Lifestyle Vaccines</h3>
                  <p className="text-sm text-muted-foreground">Vaccines based on your dog's activities and environment</p>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 gap-4 pr-4">
                  {getLifestyleVaccines().map((vaccine) => (
                    <VaccineCard key={vaccine.id} vaccine={vaccine} />
                  ))}
                </div>
                {getLifestyleVaccines().length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No lifestyle vaccines found</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="regional" className="flex-1 flex flex-col overflow-hidden mt-4 data-[state=active]:flex data-[state=inactive]:hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                  <h3 className="font-semibold">Regional Vaccines</h3>
                  <p className="text-sm text-muted-foreground">Location-specific vaccines for your area</p>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 gap-4 pr-4">
                  {getRegionalVaccines().map((vaccine) => (
                    <VaccineCard key={vaccine.id} vaccine={vaccine} />
                  ))}
                </div>
                {getRegionalVaccines().length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No regional vaccines found</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="therapies" className="flex-1 flex flex-col overflow-hidden mt-4 data-[state=active]:flex data-[state=inactive]:hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                  <h3 className="font-semibold">Injectable Therapies</h3>
                  <p className="text-sm text-muted-foreground">Non-vaccine injectable treatments</p>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 gap-4 pr-4">
                  {getInjectableTherapies().map((vaccine) => (
                    <VaccineCard key={vaccine.id} vaccine={vaccine} />
                  ))}
                </div>
                {getInjectableTherapies().length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No injectable therapies found</p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AddVaccinationModal
        isOpen={isAddVaccinationOpen}
        onClose={() => {
          setIsAddVaccinationOpen(false);
          setSelectedVaccine('');
          refetch();
        }}
        dogId={dogId}
        vaccineId={selectedVaccine}
        vaccines={vaccines}
      />
    </>
  );
}
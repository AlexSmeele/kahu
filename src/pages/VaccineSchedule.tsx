import { ArrowLeft, Calendar, Syringe, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useDogs, calculateAge } from '@/hooks/useDogs';
import { useVaccines } from '@/hooks/useVaccines';
import { calculateAgeInWeeks } from '@/lib/utils';

export default function VaccineSchedule() {
  const navigate = useNavigate();
  const { dogId } = useParams();
  const { dogs } = useDogs();
  const currentDog = dogs.find(d => d.id === dogId) || dogs[0];
  
  const { 
    vaccines, 
    vaccinationRecords,
    getCoreVaccines,
    getLifestyleVaccines,
    getRegionalVaccines,
    getInjectableTherapies,
    getVaccinationStatus 
  } = useVaccines(currentDog?.id || '');

  if (!currentDog) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
        <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Vaccine Schedule</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">No dog found. Please add a dog first.</p>
        </div>
      </div>
    );
  }

  const dogAgeWeeks = currentDog.birthday 
    ? calculateAgeInWeeks(currentDog.birthday)
    : null;
  const dogAge = currentDog.birthday ? calculateAge(currentDog.birthday) : 'Unknown age';

  const coreVaccines = getCoreVaccines();
  const lifestyleVaccines = getLifestyleVaccines();
  const regionalVaccines = getRegionalVaccines();
  const injectableTherapies = getInjectableTherapies();

  const isVaccineRelevant = (vaccine: any) => {
    if (!dogAgeWeeks) return true; // Show all if age unknown
    return dogAgeWeeks >= (vaccine.puppy_start_weeks || 0);
  };

  const VaccineCard = ({ vaccine }: { vaccine: any }) => {
    const status = getVaccinationStatus(vaccine.id);
    const isRelevant = isVaccineRelevant(vaccine);
    const records = vaccinationRecords.filter(r => r.vaccine_id === vaccine.id);
    
    let statusColor = 'bg-muted text-muted-foreground';
    let statusIcon = <AlertCircle className="w-4 h-4" />;
    let statusText = 'Not Started';

    if (status === 'up_to_date') {
      statusColor = 'bg-green-500/10 text-green-700 dark:text-green-400';
      statusIcon = <CheckCircle2 className="w-4 h-4" />;
      statusText = 'Up to Date';
    } else if (status === 'due_soon') {
      statusColor = 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      statusIcon = <Calendar className="w-4 h-4" />;
      statusText = 'Due Soon';
    } else if (status === 'overdue') {
      statusColor = 'bg-red-500/10 text-red-700 dark:text-red-400';
      statusIcon = <AlertCircle className="w-4 h-4" />;
      statusText = 'Overdue';
    }

    return (
      <Card className={`p-4 ${!isRelevant ? 'opacity-50' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Syringe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">{vaccine.name}</h3>
              <p className="text-xs text-muted-foreground">
                {vaccine.vaccine_type === 'core' && 'Essential for all dogs'}
                {vaccine.vaccine_type === 'lifestyle' && 'Lifestyle-dependent'}
                {vaccine.vaccine_type === 'regional' && 'Regional risk'}
                {vaccine.vaccine_type === 'injectable_therapy' && 'Injectable therapy'}
              </p>
            </div>
          </div>
          <Badge className={statusColor}>
            <span className="flex items-center gap-1">
              {statusIcon}
              <span className="text-xs">{statusText}</span>
            </span>
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs font-medium mb-1">Protects Against:</p>
            <p className="text-foreground">{vaccine.protects_against}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs font-medium mb-1">Schedule:</p>
            <p className="text-foreground">{vaccine.schedule_info}</p>
          </div>

          {!isRelevant && dogAgeWeeks && (
            <Alert className="bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Recommended starting at {vaccine.puppy_start_weeks} weeks. 
                {currentDog.name} is currently {Math.floor(dogAgeWeeks)} weeks old.
              </AlertDescription>
            </Alert>
          )}

          {vaccine.lifestyle_factors && vaccine.lifestyle_factors.length > 0 && (
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Lifestyle Factors:</p>
              <div className="flex flex-wrap gap-1">
                {vaccine.lifestyle_factors.map((factor: string) => (
                  <Badge key={factor} variant="outline" className="text-xs">
                    {factor.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {records.length > 0 && (
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Last Administered:</p>
              <p className="text-foreground">
                {new Date(records[0].administered_date).toLocaleDateString()}
              </p>
              {records[0].due_date && (
                <p className="text-xs text-muted-foreground">
                  Next due: {new Date(records[0].due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {vaccine.notes && (
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">Notes:</p>
              <p className="text-xs text-muted-foreground">{vaccine.notes}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      {/* Header */}
      <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Vaccine Schedule</h1>
            <p className="text-xs text-muted-foreground">
              {currentDog.name} • {dogAge}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Overview Alert */}
          <Alert>
            <Syringe className="h-4 w-4" />
            <AlertDescription>
              Vaccination schedule based on {currentDog.name}'s age{dogAgeWeeks && ` (${Math.floor(dogAgeWeeks)} weeks)`}. 
              Consult your veterinarian for personalized recommendations.
            </AlertDescription>
          </Alert>

          {/* Core Vaccines */}
          {coreVaccines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Core Vaccines</h2>
                  <p className="text-xs text-muted-foreground">Essential for all dogs</p>
                </div>
              </div>
              <div className="space-y-3">
                {coreVaccines.map(vaccine => (
                  <VaccineCard key={vaccine.id} vaccine={vaccine} />
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Lifestyle Vaccines */}
          {lifestyleVaccines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Lifestyle Vaccines</h2>
                  <p className="text-xs text-muted-foreground">Based on activities and exposure</p>
                </div>
              </div>
              <div className="space-y-3">
                {lifestyleVaccines.map(vaccine => (
                  <VaccineCard key={vaccine.id} vaccine={vaccine} />
                ))}
              </div>
            </div>
          )}

          {lifestyleVaccines.length > 0 && regionalVaccines.length > 0 && <Separator />}

          {/* Regional Vaccines */}
          {regionalVaccines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Regional Vaccines</h2>
                  <p className="text-xs text-muted-foreground">Location-specific protection</p>
                </div>
              </div>
              <div className="space-y-3">
                {regionalVaccines.map(vaccine => (
                  <VaccineCard key={vaccine.id} vaccine={vaccine} />
                ))}
              </div>
            </div>
          )}

          {injectableTherapies.length > 0 && <Separator />}

          {/* Injectable Therapies */}
          {injectableTherapies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Syringe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Injectable Therapies</h2>
                  <p className="text-xs text-muted-foreground">Preventive and treatment options</p>
                </div>
              </div>
              <div className="space-y-3">
                {injectableTherapies.map(vaccine => (
                  <VaccineCard key={vaccine.id} vaccine={vaccine} />
                ))}
              </div>
            </div>
          )}

          {/* Bottom spacing for safe area */}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}

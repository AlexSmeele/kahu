import { ArrowLeft, Briefcase, MapPin, Phone, Star, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Services() {
  const navigate = useNavigate();

  const mockServices = {
    vets: [
      {
        id: 1,
        name: "City Veterinary Clinic",
        address: "123 Main St, City Center",
        phone: "(555) 123-4567",
        rating: 4.8,
        visits: 12,
        lastVisit: "2024-10-15",
        specialty: "General Care",
      },
      {
        id: 2,
        name: "Emergency Pet Hospital",
        address: "456 Oak Ave, Downtown",
        phone: "(555) 987-6543",
        rating: 4.9,
        visits: 3,
        lastVisit: "2024-08-22",
        specialty: "Emergency Care",
      },
    ],
    groomers: [
      {
        id: 1,
        name: "Pampered Paws Grooming",
        address: "789 Elm St, West Side",
        phone: "(555) 234-5678",
        rating: 4.7,
        visits: 8,
        lastVisit: "2024-11-01",
        services: ["Full Groom", "Nail Trim", "Bath"],
      },
      {
        id: 2,
        name: "Happy Tails Spa",
        address: "321 Pine Rd, East End",
        phone: "(555) 345-6789",
        rating: 4.6,
        visits: 5,
        lastVisit: "2024-09-15",
        services: ["Mobile Grooming", "Spa Treatment"],
      },
    ],
    walkers: [
      {
        id: 1,
        name: "Sarah's Dog Walking",
        phone: "(555) 456-7890",
        rating: 5.0,
        walks: 45,
        lastWalk: "2024-11-02",
        availability: "Mon-Fri, 12pm-4pm",
      },
      {
        id: 2,
        name: "Active Paws Walking Service",
        phone: "(555) 567-8901",
        rating: 4.8,
        walks: 23,
        lastWalk: "2024-10-28",
        availability: "Weekends, All Day",
      },
    ],
    trainers: [
      {
        id: 1,
        name: "Professional K9 Training",
        address: "555 Training Lane, Suburb",
        phone: "(555) 678-9012",
        rating: 4.9,
        sessions: 15,
        lastSession: "2024-10-20",
        specialty: "Obedience & Behavior",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-y-auto safe-top">
      <div className="sticky top-0 z-10 bg-background border-b safe-top">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Pet Services</h1>
        </div>
      </div>

      <div className="container py-6">
        <Tabs defaultValue="vets" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vets">Vets</TabsTrigger>
            <TabsTrigger value="groomers">Groomers</TabsTrigger>
            <TabsTrigger value="walkers">Walkers</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
          </TabsList>

          <TabsContent value="vets" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {mockServices.vets.length} saved veterinarians
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Vet
              </Button>
            </div>
            {mockServices.vets.map((vet) => (
              <Card key={vet.id} className="p-5 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{vet.name}</h3>
                    <Badge variant="secondary" className="mb-2">{vet.specialty}</Badge>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {vet.address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {vet.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{vet.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                  <span>{vet.visits} visits</span>
                  <span>•</span>
                  <span>Last visit: {new Date(vet.lastVisit).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="w-3 h-3 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="groomers" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {mockServices.groomers.length} saved groomers
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Groomer
              </Button>
            </div>
            {mockServices.groomers.map((groomer) => (
              <Card key={groomer.id} className="p-5 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{groomer.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {groomer.address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <Phone className="w-3 h-3" />
                      {groomer.phone}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {groomer.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{groomer.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                  <span>{groomer.visits} visits</span>
                  <span>•</span>
                  <span>Last visit: {new Date(groomer.lastVisit).toLocaleDateString()}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Book Appointment
                </Button>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="walkers" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {mockServices.walkers.length} saved walkers
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Walker
              </Button>
            </div>
            {mockServices.walkers.map((walker) => (
              <Card key={walker.id} className="p-5 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{walker.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <Phone className="w-3 h-3" />
                      {walker.phone}
                    </p>
                    <Badge variant="secondary">{walker.availability}</Badge>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{walker.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                  <span>{walker.walks} walks</span>
                  <span>•</span>
                  <span>Last walk: {new Date(walker.lastWalk).toLocaleDateString()}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Phone className="w-3 h-3 mr-2" />
                  Contact
                </Button>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="trainers" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {mockServices.trainers.length} saved trainer
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Trainer
              </Button>
            </div>
            {mockServices.trainers.map((trainer) => (
              <Card key={trainer.id} className="p-5 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{trainer.name}</h3>
                    <Badge variant="secondary" className="mb-2">{trainer.specialty}</Badge>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {trainer.address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {trainer.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{trainer.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                  <span>{trainer.sessions} sessions</span>
                  <span>•</span>
                  <span>Last: {new Date(trainer.lastSession).toLocaleDateString()}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Schedule Session
                </Button>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

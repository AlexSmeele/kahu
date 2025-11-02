import { ArrowLeft, Music, Volume2, Play, Pause, Book, Heart, Wind, Droplets } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Relaxation() {
  const navigate = useNavigate();
  const [playingSound, setPlayingSound] = useState<number | null>(null);

  const calmingSounds = [
    {
      id: 1,
      name: "Rain & Thunder",
      duration: "30 min",
      icon: Droplets,
      description: "Gentle rain with distant thunder",
    },
    {
      id: 2,
      name: "Ocean Waves",
      duration: "45 min",
      icon: Wind,
      description: "Peaceful waves on the shore",
    },
    {
      id: 3,
      name: "Forest Ambience",
      duration: "60 min",
      icon: Wind,
      description: "Birds chirping and rustling leaves",
    },
    {
      id: 4,
      name: "Classical Music",
      duration: "40 min",
      icon: Music,
      description: "Soft classical melodies for dogs",
    },
  ];

  const techniques = [
    {
      id: 1,
      title: "Deep Pressure Therapy",
      description: "Apply gentle, firm pressure along your dog's body. This mimics the calming effect of being held and can reduce anxiety.",
      duration: "5-10 minutes",
      difficulty: "Easy",
    },
    {
      id: 2,
      title: "Slow Belly Rubs",
      description: "Gently rub your dog's belly in slow, circular motions. This can help lower their heart rate and promote relaxation.",
      duration: "10-15 minutes",
      difficulty: "Easy",
    },
    {
      id: 3,
      title: "Ear Massage",
      description: "Massage the base of your dog's ears with gentle circular motions. This releases endorphins and promotes calmness.",
      duration: "5 minutes",
      difficulty: "Easy",
    },
    {
      id: 4,
      title: "Guided Breathing Exercise",
      description: "Sit with your dog and breathe slowly and deeply. Dogs often sync their breathing with their owners, promoting relaxation.",
      duration: "5-10 minutes",
      difficulty: "Medium",
    },
    {
      id: 5,
      title: "Scent Relaxation",
      description: "Use calming scents like lavender or chamomile (dog-safe) in the room. Aromatherapy can help reduce anxiety.",
      duration: "30+ minutes",
      difficulty: "Easy",
    },
    {
      id: 6,
      title: "Progressive Muscle Relaxation",
      description: "Gently stretch and massage different muscle groups, starting from the neck and moving down the body.",
      duration: "15-20 minutes",
      difficulty: "Medium",
    },
  ];

  const toggleSound = (id: number) => {
    if (playingSound === id) {
      setPlayingSound(null);
    } else {
      setPlayingSound(id);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Relaxation</h1>
        </div>
      </div>

      <div className="container py-6">
        <Tabs defaultValue="sounds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sounds">Calming Sounds</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
          </TabsList>

          <TabsContent value="sounds" className="space-y-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">About Calming Sounds</h3>
                  <p className="text-sm text-muted-foreground">
                    These sounds are designed to help soothe anxious dogs. Play at a low volume and observe your dog's reaction.
                  </p>
                </div>
              </div>
            </Card>

            {calmingSounds.map((sound) => {
              const Icon = sound.icon;
              const isPlaying = playingSound === sound.id;
              
              return (
                <Card key={sound.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{sound.name}</h3>
                          <p className="text-sm text-muted-foreground">{sound.description}</p>
                        </div>
                        <Badge variant="secondary">{sound.duration}</Badge>
                      </div>
                      <Button
                        variant={isPlaying ? "default" : "outline"}
                        size="sm"
                        className="mt-3"
                        onClick={() => toggleSound(sound.id)}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Playing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play Sound
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="techniques" className="space-y-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Relaxation Techniques</h3>
                  <p className="text-sm text-muted-foreground">
                    Try these proven methods to help calm and relax your dog during stressful situations.
                  </p>
                </div>
              </div>
            </Card>

            {techniques.map((technique) => (
              <Card key={technique.id} className="p-5 hover:bg-accent transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Book className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{technique.title}</h3>
                      <Badge variant="outline">{technique.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {technique.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {technique.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

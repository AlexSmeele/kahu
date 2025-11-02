import { ArrowLeft, Users, MapPin, Calendar, MessageCircle, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import dogMax from '@/assets/dog-max.jpg';
import dogBella from '@/assets/dog-bella.jpg';
import dogCharlie from '@/assets/dog-charlie.jpg';
import dogLuna from '@/assets/dog-luna.jpg';

export default function Social() {
  const navigate = useNavigate();

  const mockFriends = [
    { name: "Max", breed: "Golden Retriever", owner: "Sarah", avatar: dogMax, distance: "0.5 km away" },
    { name: "Bella", breed: "French Bulldog", owner: "Mike", avatar: dogBella, distance: "1.2 km away" },
    { name: "Charlie", breed: "Labrador", owner: "Emma", avatar: dogCharlie, distance: "2.1 km away" },
    { name: "Luna", breed: "Beagle", owner: "Alex", avatar: dogLuna, distance: "1.8 km away" },
  ];

  const mockGroups = [
    { name: "Morning Walkers", members: 12, nextWalk: "Tomorrow 7:00 AM", location: "Central Park" },
    { name: "Small Dog Playgroup", members: 8, nextWalk: "Today 5:00 PM", location: "Dog Park West" },
  ];

  const mockEvents = [
    { title: "Dog Training Workshop", date: "Dec 15", location: "Community Center", attendees: 24 },
    { title: "Charity Dog Walk", date: "Dec 20", location: "Riverside Trail", attendees: 45 },
  ];

  return (
    <div className="content-frame bg-background safe-top">
      <div className="sticky top-0 z-10 bg-background border-b safe-top">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Kahu Social</h1>
        </div>
      </div>

      <div className="container py-6 pb-24 space-y-6">
        {/* Find Friends Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Find Friends</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Connect with pet parents in your area
          </p>
          <div className="grid grid-cols-2 gap-3">
            {mockFriends.map((friend, idx) => (
              <Card key={idx} className="overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all">
                <div className="relative aspect-square">
                  <img 
                    src={friend.avatar} 
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-lg mb-0.5 truncate">{friend.name}</h3>
                        <p className="text-white/90 text-xs mb-1 truncate">{friend.breed}</p>
                        <p className="text-white/80 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {friend.distance}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-white/90 hover:bg-white text-primary flex-shrink-0"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Walking Groups Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Walking Groups</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Join organized walks with other pet owners
          </p>
          <div className="space-y-3">
            {mockGroups.map((group, idx) => (
              <Card key={idx} className="p-4 hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{group.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.members} members
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {group.nextWalk}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {group.location}
                    </p>
                  </div>
                  <Button size="sm">Join</Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Events Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Community Events</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Discover and join local pet events
          </p>
          <div className="space-y-3">
            {mockEvents.map((event, idx) => (
              <Card key={idx} className="p-4 hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {event.date}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.attendees} people interested
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Interested</Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Messages Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Chat with other pet parents
          </p>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start connecting with other pet owners to begin chatting
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

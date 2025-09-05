import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDogs, calculateAge } from "@/hooks/useDogs";

interface DogSwitcherProps {
  selectedDogId?: string;
  onDogChange: (dogId: string) => void;
  showAddButton?: boolean;
  onAddDog?: () => void;
}

export function DogSwitcher({ selectedDogId, onDogChange, showAddButton = false, onAddDog }: DogSwitcherProps) {
  const { dogs, loading } = useDogs();

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-muted rounded-full"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">No dogs found</span>
        {showAddButton && onAddDog && (
          <Button size="sm" variant="outline" onClick={onAddDog}>
            <Plus className="w-3 h-3 mr-1" />
            Add Dog
          </Button>
        )}
      </div>
    );
  }

  const selectedDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];

  return (
    <div className="w-full">
      <Tabs value={selectedDog?.id} onValueChange={onDogChange} className="w-full">
        <TabsList className="w-full h-16 p-1 grid" style={{ gridTemplateColumns: `repeat(${dogs.length + (showAddButton ? 1 : 0)}, 1fr)` }}>
          {dogs.map((dog) => (
            <TabsTrigger 
              key={dog.id} 
              value={dog.id} 
              className="flex-1 relative p-1 h-full data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:ring-offset-1 rounded-md overflow-hidden"
            >
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <Avatar className="w-full h-full rounded-sm">
                  <AvatarImage src={dog.avatar_url} className="rounded-sm" />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-sm">
                    {dog.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                  <div className="font-medium text-white text-xs text-center truncate drop-shadow-sm">
                    {dog.name}
                  </div>
                </div>
              </div>
            </TabsTrigger>
          ))}
          
          {showAddButton && onAddDog && (
            <div className="flex-1 flex items-center justify-center p-1 h-full">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onAddDog} 
                className="w-full h-full flex flex-col gap-1 text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Dog
              </Button>
            </div>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
}
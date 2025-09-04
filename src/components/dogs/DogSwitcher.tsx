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
        <TabsList className="w-full h-auto p-1 grid" style={{ gridTemplateColumns: `repeat(${dogs.length + (showAddButton ? 1 : 0)}, 1fr)` }}>
          {dogs.map((dog) => (
            <TabsTrigger 
              key={dog.id} 
              value={dog.id} 
              className="flex-1 flex flex-col items-center gap-1 p-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={dog.avatar_url} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {dog.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-medium text-sm truncate">{dog.name}</div>
                {dog.breed && (
                  <div className="text-xs text-muted-foreground truncate">{dog.breed}</div>
                )}
              </div>
            </TabsTrigger>
          ))}
          
          {showAddButton && onAddDog && (
            <div className="flex-1 flex items-center justify-center p-3">
              <Button size="sm" variant="outline" onClick={onAddDog} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Dog
              </Button>
            </div>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
}
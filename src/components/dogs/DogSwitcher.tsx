import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="flex items-center gap-2">
      <Select value={selectedDog?.id} onValueChange={onDogChange}>
        <SelectTrigger className="w-auto min-w-[140px] bg-background/50">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={selectedDog?.avatar_url} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {selectedDog?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{selectedDog?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {dogs.map((dog) => (
            <SelectItem key={dog.id} value={dog.id}>
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={dog.avatar_url} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {dog.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{dog.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {dog.breed && `${dog.breed} • `}
                    {dog.birthday && `${calculateAge(dog.birthday)} years`}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showAddButton && onAddDog && (
        <Button size="sm" variant="outline" onClick={onAddDog}>
          <Plus className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
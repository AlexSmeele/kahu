import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDogs } from "@/hooks/useDogs";

interface DogDropdownProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function DogDropdown({ selectedDogId, onDogChange }: DogDropdownProps) {
  const { dogs } = useDogs();
  const selectedDog = dogs.find(d => d.id === selectedDogId);

  if (!selectedDog) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="absolute top-3 left-3 z-[100] flex items-center gap-2 h-auto py-1.5 px-3 bg-background border-2 shadow-lg hover:bg-accent"
        >
          <Avatar className="w-10 h-10 border-2 border-border shadow-sm">
            <AvatarImage src={selectedDog.avatar_url} alt={selectedDog.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {selectedDog.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{selectedDog.name}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 z-[100] bg-background border-2 shadow-xl">
        {dogs.map((dog) => (
          <DropdownMenuItem
            key={dog.id}
            onClick={() => onDogChange(dog.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={dog.avatar_url} alt={dog.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {dog.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1">{dog.name}</span>
            {dog.id === selectedDogId && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

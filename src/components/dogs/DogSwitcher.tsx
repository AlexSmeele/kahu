import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useDogs, calculateAge } from "@/hooks/useDogs";
import { cn } from "@/lib/utils";

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

  // Hide switcher if there's only one dog (unless showing add button)
  if (dogs.length === 1 && !showAddButton) {
    return null;
  }

  const selectedDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const totalItems = dogs.length + (showAddButton ? 1 : 0);

  // Use carousel if more than 3 dogs, otherwise use tabs
  if (totalItems > 3) {
    return (
      <div className="w-full">
        <Carousel
          opts={{
            loop: true,
            skipSnaps: false,
            dragFree: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {dogs.map((dog) => (
              <CarouselItem key={dog.id} className="pl-2 basis-1/3">
                <div 
                  onClick={() => onDogChange(dog.id)}
                  className={cn(
                    "relative h-32 rounded-md overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105",
                    selectedDog?.id === dog.id 
                      ? "ring-2 ring-primary ring-offset-2" 
                      : "hover:ring-1 hover:ring-primary/50"
                  )}
                >
                  <Avatar className="w-full h-full rounded-md">
                    <AvatarImage src={dog.avatar_url} className="rounded-md" />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-md">
                      {dog.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <div className="font-medium text-white text-xs text-center truncate drop-shadow-sm">
                      {dog.name}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
            
            {showAddButton && onAddDog && (
              <CarouselItem className="pl-2 basis-1/3">
                <div className="h-32 flex items-center justify-center">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onAddDog} 
                    className="w-full h-full flex flex-col gap-2 text-xs border-dashed"
                  >
                    <Plus className="w-6 h-6" />
                    Add Dog
                  </Button>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="-left-4 h-8 w-8" />
          <CarouselNext className="-right-4 h-8 w-8" />
        </Carousel>
      </div>
    );
  }

  // Original tabs implementation for 3 or fewer dogs
  return (
    <div className="w-full">
      <Tabs value={selectedDog?.id} onValueChange={onDogChange} className="w-full">
        <TabsList className="w-full h-32 p-1 grid" style={{ gridTemplateColumns: `repeat(${totalItems}, 1fr)` }}>
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
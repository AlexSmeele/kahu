import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import dog breeds data - we'll parse the CSV data inline for simplicity
const DOG_BREEDS = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akita', 'Alaskan Malamute', 'American Bulldog', 'American Cocker Spaniel', 'American Eskimo Dog', 'American Foxhound', 'American Hairless Terrier', 'American Leopard Hound', 'American Pit Bull Terrier', 'American Staffordshire Terrier', 'American Water Spaniel', 'Anatolian Shepherd Dog', 'Appenzeller Sennenhund', 'Australian Cattle Dog', 'Australian Kelpie', 'Australian Shepherd', 'Australian Terrier', 'Azawakh', 'Barbet', 'Basenji', 'Basset Artesien Normand', 'Basset Bleu de Gascogne', 'Basset Fauve de Bretagne', 'Basset Hound', 'Bavarian Mountain Scent Hound', 'Beagle', 'Bearded Collie', 'Beauceron', 'Bedlington Terrier', 'Belgian Laekenois', 'Belgian Malinois', 'Belgian Sheepdog', 'Belgian Tervuren', 'Bergamasco Sheepdog', 'Bernese Mountain Dog', 'Bichon Frise', 'Black Russian Terrier', 'Black and Tan Coonhound', 'Bloodhound', 'Bluetick Coonhound', 'Boerboel', 'Bolognese', 'Border Collie', 'Border Terrier', 'Borzoi', 'Boston Terrier', 'Bouvier des Flandres', 'Boxer', 'Boykin Spaniel', 'Bracco Italiano', 'Braque Francais', 'Braque Saint-Germain', 'Braque du Bourbonnais', 'Briard', 'Briquet Griffon Vendéen', 'Brittany Spaniel', 'Broholmer', 'Brussels Griffon', 'Bull Terrier', 'Bulldog', 'Bullmastiff', 'Cairn Terrier', 'Canaan Dog', 'Cane Corso', 'Cardigan Welsh Corgi', 'Carolina Dog', 'Catahoula Leopard Dog', 'Caucasian Shepherd Dog', 'Cavalier King Charles Spaniel', 'Central Asian Shepherd Dog', 'Cesky Terrier', 'Chesapeake Bay Retriever', 'Chihuahua', 'Chinese Crested Dog', 'Chinese Shar-Pei', 'Chinook', 'Chow Chow', 'Cirneco dell\'Etna', 'Clumber Spaniel', 'Cockapoo', 'Collie', 'Coton de Tulear', 'Curly-Coated Retriever', 'Cão Fila de São Miguel', 'Dachshund', 'Dalmatian', 'Dandie Dinmont Terrier', 'Danish-Swedish Farmdog', 'Doberman Pinscher', 'Dogo Argentino', 'Dogo Canario', 'Dogue de Bordeaux', 'Drentsche Patrijshond', 'Dutch Shepherd', 'English Bulldog', 'English Cocker Spaniel', 'English Foxhound', 'English Setter', 'English Springer Spaniel', 'English Toy Spaniel', 'Entlebucher Mountain Dog', 'Estrela Mountain Dog', 'Eurasier', 'Field Spaniel', 'Finnish Lapphund', 'Finnish Spitz', 'Flat-Coated Retriever', 'Fox Terrier', 'French Bulldog', 'German Pinscher', 'German Shepherd Dog', 'German Shorthaired Pointer', 'German Wirehaired Pointer', 'Giant Schnauzer', 'Glen of Imaal Terrier', 'Golden Retriever', 'Gordon Setter', 'Grand Bleu de Gascogne', 'Grand Griffon Vendéen', 'Great Dane', 'Great Pyrenees', 'Greater Swiss Mountain Dog', 'Greyhound', 'Harrier', 'Havanese', 'Hokkaido', 'Hungarian Puli', 'Hungarian Vizsla', 'Ibizan Hound', 'Icelandic Sheepdog', 'Irish Red and White Setter', 'Irish Setter', 'Irish Terrier', 'Irish Water Spaniel', 'Irish Wolfhound', 'Italian Greyhound', 'Japanese Chin', 'Japanese Spitz', 'Kangal Shepherd Dog', 'Karelian Bear Dog', 'Keeshond', 'Kerry Blue Terrier', 'King Charles Spaniel', 'Kishu Ken', 'Komondor', 'Kooikerhondje', 'Kromfohrländer', 'Kuvasz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Lakeland Terrier', 'Lancashire Heeler', 'Leonberger', 'Lhasa Apso', 'Lowchen', 'Maltese', 'Manchester Terrier', 'Maremma Sheepdog', 'Mastiff', 'Miniature American Shepherd', 'Miniature Bull Terrier', 'Miniature Pinscher', 'Miniature Schnauzer', 'Mudi', 'Neapolitan Mastiff', 'Newfoundland', 'Norfolk Terrier', 'Norwegian Buhund', 'Norwegian Elkhound', 'Norwegian Lundehund', 'Norwich Terrier', 'Nova Scotia Duck Tolling Retriever', 'Old English Sheepdog', 'Otterhound', 'Papillon', 'Parson Russell Terrier', 'Pekingese', 'Pembroke Welsh Corgi', 'Perro de Presa Canario', 'Peruvian Inca Orchid', 'Petit Basset Griffon Vendéen', 'Pharaoh Hound', 'Plott Hound', 'Pointer', 'Polish Lowland Sheepdog', 'Pomeranian', 'Poodle', 'Portuguese Podengo', 'Portuguese Podengo Pequeno', 'Portuguese Water Dog', 'Presa Canario', 'Pug', 'Puli', 'Pumi', 'Pyrenean Mastiff', 'Pyrenean Shepherd', 'Rat Terrier', 'Redbone Coonhound', 'Rhodesian Ridgeback', 'Rottweiler', 'Russian Toy', 'Russian Tsvetnaya Bolonka', 'Saint Bernard', 'Saluki', 'Samoyed', 'Sarplaninac', 'Schipperke', 'Scottish Deerhound', 'Scottish Terrier', 'Sealyham Terrier', 'Segugio Italiano', 'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Shikoku', 'Siberian Husky', 'Silky Terrier', 'Skye Terrier', 'Sloughi', 'Slovak Cuvac', 'Slovakian Wirehaired Pointer', 'Small Münsterländer', 'Soft-Coated Wheaten Terrier', 'Spanish Mastiff', 'Spanish Water Dog', 'Spinone Italiano', 'Stabyhoun', 'Staffordshire Bull Terrier', 'Standard Schnauzer', 'Sussex Spaniel', 'Swedish Lapphund', 'Swedish Vallhund', 'Taiwan Dog', 'Telomian', 'Thai Ridgeback', 'Tibetan Kyi Apso', 'Tibetan Mastiff', 'Tibetan Spaniel', 'Tibetan Terrier', 'Tornjak', 'Tosa Inu', 'Toy Fox Terrier', 'Transylvanian Hound', 'Treeing Tennessee Brindle', 'Treeing Walker Coonhound', 'Vizsla', 'Volpino Italiano', 'Weimaraner', 'Welsh Springer Spaniel', 'Welsh Terrier', 'West Highland White Terrier', 'Westphalian Dachsbracke', 'Whippet', 'Wire Fox Terrier', 'Wirehaired Pointing Griffon', 'Wirehaired Vizsla', 'Xoloitzcuintli', 'Yakutian Laika', 'Yorkshire Terrier'
];

interface BreedAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function BreedAutocomplete({ value, onChange, placeholder = "e.g., Golden Retriever, Mixed", className }: BreedAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [showCustomOption, setShowCustomOption] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter breeds based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = DOG_BREEDS.filter(breed =>
        breed.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions for performance
      
      setFilteredBreeds(filtered);
      
      // Show custom option if input doesn't exactly match any breed
      const exactMatch = DOG_BREEDS.some(breed => 
        breed.toLowerCase() === inputValue.toLowerCase()
      );
      setShowCustomOption(!exactMatch && inputValue.length > 2);
    } else {
      setFilteredBreeds([]);
      setShowCustomOption(false);
    }
  }, [inputValue]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    if (newValue.trim()) {
      setOpen(true);
    }
  };

  const handleBreedSelect = (breed: string) => {
    setInputValue(breed);
    onChange(breed);
    setOpen(false);
  };

  const handleCustomBreed = () => {
    // Keep current input value as custom breed
    onChange(inputValue);
    setOpen(false);
  };

  const handleInputFocus = () => {
    if (inputValue.trim()) {
      setOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow selection clicks
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="pr-8"
      />
      
      {open && (filteredBreeds.length > 0 || showCustomOption) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          <ScrollArea className="max-h-60">
            <div className="p-1">
              {filteredBreeds.map((breed) => (
                <div
                  key={breed}
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                  onClick={() => handleBreedSelect(breed)}
                >
                  {breed}
                </div>
              ))}
              
              {showCustomOption && (
                <div
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm border-t flex items-center gap-2"
                  onClick={handleCustomBreed}
                >
                  <Plus className="w-3 h-3" />
                  Save "{inputValue}" as custom breed
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

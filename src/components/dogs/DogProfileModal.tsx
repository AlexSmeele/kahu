import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Dog, useDogs, calculateAge } from "@/hooks/useDogs";
import { useToast } from "@/hooks/use-toast";

interface DogProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog?: Dog | null;
  mode: 'add' | 'edit';
}

export function DogProfileModal({ isOpen, onClose, dog, mode }: DogProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birthday: null as Date | null,
    weight: '',
    gender: '' as 'male' | 'female' | '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addDog, updateDog } = useDogs();
  const { toast } = useToast();

  useEffect(() => {
    if (dog && mode === 'edit') {
      setFormData({
        name: dog.name,
        breed: dog.breed || '',
        birthday: dog.birthday ? new Date(dog.birthday) : null,
        weight: dog.weight?.toString() || '',
        gender: dog.gender || '',
      });
      setPhotoPreview(dog.avatar_url || null);
    } else {
      setFormData({
        name: '',
        breed: '',
        birthday: null,
        weight: '',
        gender: '',
      });
      setPhotoPreview(null);
    }
    setPhoto(null);
  }, [dog, mode, isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your dog\'s name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const dogData = {
      name: formData.name,
      breed: formData.breed || undefined,
      birthday: formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      gender: formData.gender || undefined,
    };

    try {
      if (mode === 'edit' && dog) {
        await updateDog(dog.id, dogData);
        toast({
          title: 'Profile updated!',
          description: `${formData.name}'s profile has been updated`,
        });
      } else {
        await addDog(dogData, photo || undefined);
        toast({
          title: 'Dog added!',
          description: `${formData.name} has been added to your pack`,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? `Edit ${dog?.name}'s Profile` : 'Add New Dog'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
            {photoPreview ? (
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={photoPreview}
                  alt="Dog preview"
                  className="w-full h-full rounded-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                  onClick={removePhoto}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto border-2 border-dashed border-border rounded-full flex items-center justify-center">
                <Button type="button" variant="ghost" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your dog's name"
              required
            />
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
              placeholder="e.g., Golden Retriever, Mixed"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value: 'male' | 'female') => 
                setFormData(prev => ({ ...prev, gender: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Birthday */}
            <div className="space-y-2">
              <Label>Birthday</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.birthday && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthday ? format(formData.birthday, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.birthday || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, birthday: date || null }))}
                    disabled={(date) => date > new Date() || date < new Date("1999-01-01")}
                    defaultMonth={formData.birthday || undefined}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    showOutsideDays={false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="25"
                min="0"
                max="200"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : mode === 'edit' ? 'Update' : 'Add Dog'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
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
import { ImageCropper, CropData } from "@/components/ui/image-cropper";

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
  const [showCropper, setShowCropper] = useState(false);
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, scale: 1 });
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
        setShowCropper(true);
        setCropData({ x: 0, y: 0, scale: 1 }); // Reset crop data for new image
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setShowCropper(false);
    setCropData({ x: 0, y: 0, scale: 1 });
  };

  const createCroppedImage = async (file: File, cropData: CropData): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const outputSize = 400;
        canvas.width = outputSize;
        canvas.height = outputSize;

        ctx.clearRect(0, 0, outputSize, outputSize);
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
        ctx.clip();

        // Match the preview container size (ImageCropper uses 128px container)
        const previewSize = 128;
        const scale = outputSize / previewSize;

        // Apply transformations
        const scaledX = cropData.x * scale;
        const scaledY = cropData.y * scale;
        
        // Calculate image size to fit the preview container initially
        const containerRatio = Math.min(previewSize / img.width, previewSize / img.height);
        const baseWidth = img.width * containerRatio;
        const baseHeight = img.height * containerRatio;
        
        // Apply crop scale and output scale
        const finalWidth = baseWidth * cropData.scale * scale;
        const finalHeight = baseHeight * cropData.scale * scale;
        
        // Center the image
        const centerX = outputSize / 2;
        const centerY = outputSize / 2;
        
        ctx.drawImage(
          img,
          centerX - finalWidth / 2 + scaledX,
          centerY - finalHeight / 2 + scaledY,
          finalWidth,
          finalHeight
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create cropped image'));
            }
          },
          'image/jpeg',
          0.95
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
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
      let finalPhoto: File | undefined = undefined;
      
      if (photo) {
        // Create cropped version if crop data exists
        const fileToUpload = cropData.scale !== 1 || cropData.x !== 0 || cropData.y !== 0
          ? await createCroppedImage(photo, cropData)
          : photo;

        // Convert blob to file if needed
        finalPhoto = fileToUpload instanceof Blob && !(fileToUpload instanceof File)
          ? new File([fileToUpload], photo.name, { type: 'image/jpeg' })
          : fileToUpload as File;
      }

      if (mode === 'edit' && dog) {
        await updateDog(dog.id, dogData, finalPhoto);
        toast({
          title: 'Profile updated!',
          description: `${formData.name}'s profile has been updated`,
        });
      } else {
        await addDog(dogData, finalPhoto);
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
              <>
                {showCropper ? (
                  <div className="space-y-4">
                    <ImageCropper
                      src={photoPreview}
                      onCropChange={setCropData}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCropData({ x: 0, y: 0, scale: 1 })}
                        className="flex-1"
                      >
                        Reset
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCropper(false)}
                        className="flex-1"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-border">
                        <img
                          src={photoPreview}
                          alt="Dog preview"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale})`,
                            transformOrigin: 'center center',
                          }}
                        />
                      </div>
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
                    {/* Always show Adjust Crop if there's any photo */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCropper(true)}
                      className="w-full"
                    >
                      Adjust Crop
                    </Button>
                  </div>
                )}
              </>
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
                  <div className="flex items-center justify-between p-2 border-b">
                    <Select
                      value={formData.birthday ? formData.birthday.getMonth().toString() : ""}
                      onValueChange={(value) => {
                        const currentDate = formData.birthday || new Date();
                        const newDate = new Date(currentDate);
                        newDate.setMonth(parseInt(value));
                        setFormData(prev => ({ ...prev, birthday: newDate }));
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {format(new Date(2000, i, 1), "MMMM")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={formData.birthday ? formData.birthday.getFullYear().toString() : ""}
                      onValueChange={(value) => {
                        const currentDate = formData.birthday || new Date();
                        const newDate = new Date(currentDate);
                        newDate.setFullYear(parseInt(value));
                        setFormData(prev => ({ ...prev, birthday: newDate }));
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 25 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <Calendar
                    mode="single"
                    selected={formData.birthday || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, birthday: date || null }))}
                    disabled={(date) => date > new Date() || date < new Date("1999-01-01")}
                    month={formData.birthday || undefined}
                    onMonthChange={(date) => {
                      if (!formData.birthday) {
                        setFormData(prev => ({ ...prev, birthday: date }));
                      }
                    }}
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
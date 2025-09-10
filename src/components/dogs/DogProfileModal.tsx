import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { EditPhotoModal, CropData } from '@/components/modals/EditPhotoModal';
import { useDogs } from '@/hooks/useDogs';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

interface DogProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog?: any;
  mode: 'add' | 'edit';
}

export function DogProfileModal({ isOpen, onClose, dog, mode }: DogProfileModalProps) {
  const { addDog, updateDog, updateDogPhoto, getDogOriginalImageData } = useDogs();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    gender: '' as 'male' | 'female' | '',
    birthday: '',
    weight: '',
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<{
    url: string;
    cropData?: CropData;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize form data based on mode
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && dog) {
        setFormData({
          name: dog.name,
          breed: dog.breed || '',
          gender: dog.gender || '',
          birthday: dog.birthday || '',
          weight: dog.weight ? dog.weight.toString() : '',
        });
        
        // Load current image data
        if (dog.avatar_url) {
          loadCurrentImageData(dog.avatar_url);
        } else {
          setCurrentImageData(null);
        }
      } else {
        setFormData({
          name: '',
          breed: '',
          gender: '',
          birthday: '',
          weight: '',
        });
        setCurrentImageData(null);
      }
    }
  }, [isOpen, mode, dog]);

  const loadCurrentImageData = async (avatarUrl: string) => {
    const originalData = await getDogOriginalImageData(avatarUrl);
    if (originalData) {
      setCurrentImageData({
        url: originalData.originalUrl,
        cropData: originalData.cropData
      });
    } else {
      // Fallback to current avatar if no original data
      setCurrentImageData({ url: avatarUrl });
    }
  };

  const handlePhotoSave = async (originalFile: File, croppedBlob: Blob, cropData: CropData) => {
    if (mode === 'edit' && dog) {
      // Update existing dog photo
      const result = await updateDogPhoto(dog.id, originalFile, croppedBlob, cropData);
      if (result) {
        // Update current image data for future edits
        const originalData = await getDogOriginalImageData(result.avatar_url!);
        if (originalData) {
          setCurrentImageData({
            url: originalData.originalUrl,
            cropData: originalData.cropData
          });
        }
      }
    } else {
      // For new dogs, we'll handle photo in the submit function
      // Store the photo data temporarily
      setCurrentImageData({
        url: URL.createObjectURL(originalFile),
        cropData: cropData
      });
      
      // Store for later use in handleSubmit
      (window as any).tempDogPhoto = { originalFile, croppedBlob, cropData };
    }
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

    try {
      const dogData = {
        name: formData.name.trim(),
        breed: formData.breed.trim() || undefined,
        gender: formData.gender || undefined,
        birthday: formData.birthday || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      };

      if (mode === 'add') {
        const newDog = await addDog(dogData);
        
        // Handle photo upload for new dogs
        if (newDog && (window as any).tempDogPhoto) {
          const { originalFile, croppedBlob, cropData } = (window as any).tempDogPhoto;
          await updateDogPhoto(newDog.id, originalFile, croppedBlob, cropData);
          delete (window as any).tempDogPhoto;
        }
      } else if (mode === 'edit' && dog) {
        await updateDog(dog.id, dogData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving dog:', error);
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'edit' ? `Edit ${dog?.name}'s Profile` : 'Add New Dog'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Photo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={dog?.avatar_url || currentImageData?.url || ''} />
                  <AvatarFallback>
                    {formData.name.charAt(0)?.toUpperCase() || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPhotoModal(true)}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Edit Photo
                  </Button>
                </div>
              </div>
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
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
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

      {/* Edit Photo Modal */}
      <EditPhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSave={handlePhotoSave}
        currentImageUrl={currentImageData?.url}
        currentCropData={currentImageData?.cropData}
        title={`Edit ${formData.name || 'Dog'} Photo`}
      />
    </>
  );
}
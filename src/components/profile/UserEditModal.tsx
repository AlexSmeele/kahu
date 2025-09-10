import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { EditPhotoModal } from '@/components/modals/EditPhotoModal';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserEditModal({ isOpen, onClose }: UserEditModalProps) {
  const { profile, updateProfile, uploadAvatar, getOriginalImageData } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<{
    url: string;
    cropData?: { x: number; y: number; scale: number };
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when modal opens or profile changes
  useEffect(() => {
    if (isOpen && profile && user) {
      const displayName = profile.display_name || '';
      const nameParts = displayName.split(' ');
      
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        city: user.user_metadata?.city || '',
        state: user.user_metadata?.state || '',
        zipCode: user.user_metadata?.zip_code || '',
        country: user.user_metadata?.country || '',
      });
      
      // Load current image data
      if (profile.avatar_url) {
        loadCurrentImageData(profile.avatar_url);
      } else {
        setCurrentImageData(null);
      }
    }
  }, [isOpen, profile, user]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentImageData(null);
      setErrors({});
    }
  }, [isOpen]);

  const loadCurrentImageData = async (avatarUrl: string) => {
    const originalData = await getOriginalImageData(avatarUrl);
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

  const handlePhotoSave = async (originalFile: File, croppedBlob: Blob, cropData: { x: number; y: number; scale: number }) => {
    try {
      const result = await uploadAvatar(originalFile, croppedBlob, cropData);
      
      if (result.error) {
        toast({
          title: 'Error uploading photo',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // Update current image data for future edits
      if (result.originalPath) {
        setCurrentImageData({
          url: result.originalPath,
          cropData: result.cropData
        });
      }
      
      toast({
        title: 'Photo updated',
        description: 'Your profile photo has been updated successfully',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error uploading photo',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.address && !formData.city) {
      newErrors.city = 'City is required when address is provided';
    }
    if (formData.address && !formData.country) {
      newErrors.country = 'Country is required when address is provided';
    }
    if (formData.zipCode && !/^[A-Za-z0-9\s-]{3,10}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid postal code';
    }
    
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateAddress();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: 'Validation errors',
        description: 'Please fix the errors before saving.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const displayName = formData.firstName && formData.lastName 
      ? `${formData.firstName} ${formData.lastName}`.trim()
      : formData.firstName || user?.email?.split('@')[0] || '';

    const { error } = await updateProfile({
      display_name: displayName,
    });

    if (error) {
      toast({
        title: 'Save failed',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved successfully.',
      });
      onClose();
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Profile Photo Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Profile Photo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
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

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Address Information */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && (
                  <p className="text-xs text-destructive mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="12345"
                  className={errors.zipCode ? 'border-destructive' : ''}
                />
                {errors.zipCode && (
                  <p className="text-xs text-destructive mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Country"
                className={errors.country ? 'border-destructive' : ''}
              />
              {errors.country && (
                <p className="text-xs text-destructive mt-1">{errors.country}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSave} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Photo Modal */}
      <EditPhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSave={handlePhotoSave}
        currentImageUrl={currentImageData?.url}
        currentCropData={currentImageData?.cropData}
        title="Edit Profile Photo"
      />
    </>
  );
}
import { useState, useRef, useEffect } from "react";
import { User, Save, Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropper, CropData } from "@/components/ui/image-cropper";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserEditModal({ isOpen, onClose }: UserEditModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, scale: 1 });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when profile loads or modal opens
  useEffect(() => {
    if (profile && isOpen) {
      setFormData(prev => ({
        ...prev,
        displayName: profile.display_name || '',
        firstName: profile.display_name?.split(' ')[0] || '',
        lastName: profile.display_name?.split(' ').slice(1).join(' ') || '',
      }));
      setPhotoPreview(profile.avatar_url || null);
    }
    // Reset photo states when modal opens/closes
    if (!isOpen) {
      setPhoto(null);
      setShowCropper(false);
      setCropData({ x: 0, y: 0, scale: 1 });
      if (!profile?.avatar_url) {
        setPhotoPreview(null);
      }
    }
  }, [profile, isOpen]);

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.address && !formData.city) {
      newErrors.city = 'City is required when address is provided';
    }
    if (formData.address && !formData.country) {
      newErrors.country = 'Country is required when address is provided';
    }
    if (formData.postalCode && !/^[A-Za-z0-9\s-]{3,10}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid postal code';
    }
    
    return newErrors;
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
      setShowCropper(true);
      setCropData({ x: 0, y: 0, scale: 1 }); // Reset crop data for new image
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(profile?.avatar_url || null);
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

  const handleAdjustCrop = () => {
    if (photoPreview) {
      // If we have an existing photo but no file object, we need to fetch it
      if (!photo && profile?.avatar_url) {
        // For existing photos, start with fresh crop settings
        setCropData({ x: 0, y: 0, scale: 1 });
        setShowCropper(true);
      } else if (photo) {
        // For new uploads, use existing crop data
        setShowCropper(true);
      }
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo) {
      // If no new photo but we're in cropper mode, we need to handle existing photo re-cropping
      if (showCropper && photoPreview && profile?.avatar_url) {
        // For existing photos, we can't re-crop without the original file
        // Just close the cropper for now
        setShowCropper(false);
        toast({
          title: "Re-cropping existing photos",
          description: "Please upload a new photo to use the cropping feature.",
          variant: "default",
        });
        return;
      }
      return;
    }

    setUploading(true);
    try {
      // Create cropped version if crop data exists
      const fileToUpload = cropData.scale !== 1 || cropData.x !== 0 || cropData.y !== 0
        ? await createCroppedImage(photo, cropData)
        : photo;

      // Convert blob to file if needed
      const finalFile = fileToUpload instanceof Blob && !(fileToUpload instanceof File)
        ? new File([fileToUpload], photo.name, { type: 'image/jpeg' })
        : fileToUpload as File;

      const { error } = await uploadAvatar(finalFile);
      
      if (error) {
        toast({
          title: "Upload failed",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Photo updated",
          description: "Your profile photo has been updated successfully.",
        });
        setPhoto(null);
        setShowCropper(false);
        setCropData({ x: 0, y: 0, scale: 1 });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateAddress();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Validation errors",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    const displayName = formData.firstName && formData.lastName 
      ? `${formData.firstName} ${formData.lastName}`.trim()
      : formData.displayName || formData.firstName || user?.email?.split('@')[0] || '';

    const { error } = await updateProfile({
      display_name: displayName,
    });

    if (error) {
      toast({
        title: "Save failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Picture */}
          <div className="space-y-3">
            <Label>Profile Photo</Label>
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
                        onClick={() => {
                          if (photo) {
                            handlePhotoUpload();
                          } else {
                            // For existing photos, close cropper and show message
                            setShowCropper(false);
                            toast({
                              title: "Note",
                              description: "To crop existing photos, please upload a new version.",
                            });
                          }
                        }}
                        disabled={uploading}
                        className="flex-1"
                      >
                        {uploading ? "Uploading..." : photo ? "Save" : "Done"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-border">
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                            style={photo ? {
                              transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale})`,
                              transformOrigin: 'center center',
                            } : undefined}
                          />
                        </div>
                        {photo && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                            onClick={removePhoto}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex-1"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Change Photo
                          </Button>
                          {/* Always show Adjust Crop if there's any photo (new or existing) */}
                          {photoPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAdjustCrop}
                              className="flex-1"
                            >
                              Adjust Crop
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-border rounded-full flex items-center justify-center">
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
                <div>
                  <p className="text-sm font-medium">Add profile photo</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            )}
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
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="12345"
                className={errors.postalCode ? 'border-destructive' : ''}
              />
              {errors.postalCode && (
                <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
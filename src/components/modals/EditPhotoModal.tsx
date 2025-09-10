import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ImageCropper, CropData } from "@/components/ui/image-cropper";
import { Upload, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalFile: File, croppedBlob: Blob, cropData: CropData) => Promise<void>;
  currentImageUrl?: string;
  currentCropData?: CropData;
  title: string;
}

export function EditPhotoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentImageUrl, 
  currentCropData,
  title 
}: EditPhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, scale: 1 });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (currentImageUrl && currentCropData) {
        setPreviewUrl(currentImageUrl);
        setCropData(currentCropData);
      } else {
        setPreviewUrl(currentImageUrl || null);
        setCropData({ x: 0, y: 0, scale: 1 });
      }
      setSelectedFile(null);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setCropData({ x: 0, y: 0, scale: 1 });
    }
  }, [isOpen, currentImageUrl, currentCropData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Reset crop data for new image
    setCropData({ x: 0, y: 0, scale: 1 });
  };

  const createCroppedImage = useCallback((file: File, cropData: CropData): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size to desired output size (256x256 for profile photos)
        const outputSize = 256;
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Calculate the crop area in the original image
        const containerSize = 128; // Size of the crop circle in the UI
        const imageAspect = img.width / img.height;
        
        // Calculate how the image is displayed in the container
        let displayWidth, displayHeight, offsetX = 0, offsetY = 0;
        
        if (imageAspect > 1) {
          // Image is wider than tall
          displayHeight = containerSize;
          displayWidth = containerSize * imageAspect;
          offsetX = (displayWidth - containerSize) / 2;
        } else {
          // Image is taller than wide
          displayWidth = containerSize;
          displayHeight = containerSize / imageAspect;
          offsetY = (displayHeight - containerSize) / 2;
        }

        // Apply scale
        displayWidth *= cropData.scale;
        displayHeight *= cropData.scale;
        offsetX = (displayWidth - containerSize) / 2;
        offsetY = (displayHeight - containerSize) / 2;

        // Calculate source coordinates
        const scaleX = img.width / displayWidth;
        const scaleY = img.height / displayHeight;
        
        const sourceX = Math.max(0, (offsetX - cropData.x) * scaleX);
        const sourceY = Math.max(0, (offsetY - cropData.y) * scaleY);
        const sourceWidth = Math.min(img.width - sourceX, containerSize * scaleX);
        const sourceHeight = Math.min(img.height - sourceY, containerSize * scaleY);

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the cropped image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, outputSize, outputSize
        );

        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleSave = async () => {
    if (!previewUrl) return;

    setLoading(true);
    try {
      let fileToUse: File;
      
      if (selectedFile) {
        // New file uploaded
        fileToUse = selectedFile;
      } else if (currentImageUrl) {
        // Using existing image, need to fetch it as a file
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        fileToUse = new File([blob], 'existing-image.jpg', { type: 'image/jpeg' });
      } else {
        throw new Error('No image available');
      }

      const croppedBlob = await createCroppedImage(fileToUse, cropData);
      await onSave(fileToUse, croppedBlob, cropData);
      
      onClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      toast({
        title: 'Error saving photo',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCropData({ x: 0, y: 0, scale: 1 });
  };

  const imageStyle = {
    transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale})`,
    transformOrigin: 'center center',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          {!previewUrl && (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Photo
              </Button>
            </div>
          )}

          {/* Photo Editor */}
          {previewUrl && (
            <div className="space-y-4">
              {/* Preview with Crop Overlay */}
              <div className="relative w-64 h-64 mx-auto">
                <div 
                  className="w-full h-full relative overflow-hidden bg-muted rounded-lg cursor-move"
                  onMouseDown={(e) => {
                    const startX = e.clientX - cropData.x;
                    const startY = e.clientY - cropData.y;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      setCropData(prev => ({
                        ...prev,
                        x: e.clientX - startX,
                        y: e.clientY - startY,
                      }));
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const startX = touch.clientX - cropData.x;
                    const startY = touch.clientY - cropData.y;
                    
                    const handleTouchMove = (e: TouchEvent) => {
                      const touch = e.touches[0];
                      setCropData(prev => ({
                        ...prev,
                        x: touch.clientX - startX,
                        y: touch.clientY - startY,
                      }));
                    };
                    
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                >
                  {/* Background Image with Opacity */}
                  <img
                    src={previewUrl}
                    alt="Edit preview"
                    className="w-full h-full object-cover select-none pointer-events-none opacity-50"
                    style={imageStyle}
                    draggable={false}
                  />
                  
                  {/* Crop Circle Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-32 h-32">
                      {/* Full opacity image within circle */}
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary bg-background">
                        <img
                          src={previewUrl}
                          alt="Crop preview"
                          className="w-full h-full object-cover select-none pointer-events-none"
                          style={imageStyle}
                          draggable={false}
                        />
                      </div>
                      {/* Circle border */}
                      <div className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Zoom Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Zoom</span>
                  <div className="flex items-center gap-1">
                    <ZoomOut className="w-3 h-3" />
                    <ZoomIn className="w-3 h-3" />
                  </div>
                </div>
                <Slider
                  value={[cropData.scale]}
                  onValueChange={(value) => setCropData(prev => ({ ...prev, scale: value[0] }))}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  Change Photo
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!previewUrl || loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          {/* Instructions */}
          <p className="text-xs text-muted-foreground text-center">
            Drag to reposition • Use slider to zoom • Only the area within the circle will be saved
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
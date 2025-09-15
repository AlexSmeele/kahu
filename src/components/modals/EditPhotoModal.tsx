import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Constants to ensure preview and save math match exactly
const CONTAINER_SIZE = 256; // Preview container size (w-64 h-64)
const CROP_SIZE = 128;  // Square crop size (w-32 h-32)

export interface CropData {
  x: number;
  y: number;
  scale: number;
}

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

        // Use same output size as crop size for 1:1 mapping
        canvas.width = CROP_SIZE;
        canvas.height = CROP_SIZE;

        const imageAspect = img.width / img.height;
        
        // Calculate how the image is displayed in the preview container (object-fit: cover)
        let displayWidth, displayHeight, offsetX = 0, offsetY = 0;
        
        if (imageAspect > 1) {
          // Image is wider than tall - height fills container, width overflows
          displayHeight = CONTAINER_SIZE;
          displayWidth = CONTAINER_SIZE * imageAspect;
          offsetX = (displayWidth - CONTAINER_SIZE) / 2;
        } else {
          // Image is taller than wide - width fills container, height overflows  
          displayWidth = CONTAINER_SIZE;
          displayHeight = CONTAINER_SIZE / imageAspect;
          offsetY = (displayHeight - CONTAINER_SIZE) / 2;
        }

        // Apply user's scale transformation
        displayWidth *= cropData.scale;
        displayHeight *= cropData.scale;
        
        // Recalculate offsets after scaling (scale from center)
        offsetX = (displayWidth - CONTAINER_SIZE) / 2;
        offsetY = (displayHeight - CONTAINER_SIZE) / 2;

        // Calculate the crop area center in the container
        const cropCenterX = CONTAINER_SIZE / 2;
        const cropCenterY = CONTAINER_SIZE / 2;
        
        // Calculate source coordinates in the original image for a centered square crop
        const squareOffsetX = (CONTAINER_SIZE - CROP_SIZE) / 2;
        const squareOffsetY = (CONTAINER_SIZE - CROP_SIZE) / 2;
        
        const scaleX = img.width / displayWidth;
        const scaleY = img.height / displayHeight;
        
        const sourceX = Math.max(0, (offsetX - cropData.x + squareOffsetX) * scaleX);
        const sourceY = Math.max(0, (offsetY - cropData.y + squareOffsetY) * scaleY);
        const sourceWidth = Math.min(img.width - sourceX, CROP_SIZE * scaleX);
        const sourceHeight = Math.min(img.height - sourceY, CROP_SIZE * scaleY);

        // Draw the cropped image (square)
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, CROP_SIZE, CROP_SIZE
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
                  {/* Single Image */}
                  <img
                    src={previewUrl}
                    alt="Edit preview"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={imageStyle}
                    draggable={false}
                  />
                  
                  {/* Crop Square Overlay - shows square area */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="relative w-32 h-32"
                      style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}
                    >
                      <div className="absolute inset-0 border-2 border-primary" />
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
            Drag to reposition • Use slider to zoom • Only the area within the square will be saved
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
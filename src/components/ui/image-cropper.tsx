import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageCropperProps {
  src: string;
  onCropChange?: (cropData: CropData) => void;
  className?: string;
}

export interface CropData {
  x: number;
  y: number;
  scale: number;
}

export function ImageCropper({ src, onCropChange, className = "" }: ImageCropperProps) {
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleCropChange = useCallback((newCropData: CropData) => {
    setCropData(newCropData);
    onCropChange?.(newCropData);
  }, [onCropChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropData.x,
      y: e.clientY - cropData.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    handleCropChange({
      ...cropData,
      x: newX,
      y: newY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - cropData.x,
      y: touch.clientY - cropData.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    handleCropChange({
      ...cropData,
      x: newX,
      y: newY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (scale: number[]) => {
    handleCropChange({
      ...cropData,
      scale: scale[0],
    });
  };

  const handleReset = () => {
    handleCropChange({ x: 0, y: 0, scale: 1 });
  };

  const imageStyle = {
    transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale})`,
    transformOrigin: 'center center',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Circular Crop Preview */}
      <div className="relative w-32 h-32 mx-auto">
        <div 
          ref={containerRef}
          className="w-full h-full rounded-full overflow-hidden border-2 border-border bg-secondary cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            ref={imageRef}
            src={src}
            alt="Crop preview"
            className="w-full h-full object-cover select-none pointer-events-none"
            style={imageStyle}
            draggable={false}
          />
        </div>
        
        {/* Crop Guide Overlay */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/50 pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Zoom Slider */}
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
            onValueChange={handleScaleChange}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Reset Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center">
        Drag to reposition • Use slider to zoom
      </p>
    </div>
  );
}
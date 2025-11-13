import { RotateCw, Eye, EyeOff, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDevicePreview } from './DevicePreviewProvider';
import { DEVICE_PRESETS } from './DevicePresets';

export function DeviceToolbar() {
  const { 
    selectedDeviceId, 
    zoom, 
    orientation, 
    frameVisible,
    setSelectedDevice, 
    setZoom, 
    toggleOrientation,
    toggleFrameVisible
  } = useDevicePreview();
  
  const selectedPreset = DEVICE_PRESETS.find(p => p.id === selectedDeviceId);
  
  const zoomValue = zoom === 1 ? '1' : zoom.toFixed(2);
  
  return (
    <div 
      className="preview-toolbar" 
      role="toolbar" 
      aria-label="Device preview controls"
      data-preview-ui="true"
    >
      <Select value={selectedDeviceId} onValueChange={setSelectedDevice}>
        <SelectTrigger className="w-[220px]" aria-label="Select device">
          <SelectValue>
            {selectedPreset?.name}
            {selectedPreset && selectedPreset.width > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                {selectedPreset.width}×{selectedPreset.height}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DEVICE_PRESETS.map(preset => (
            <SelectItem key={preset.id} value={preset.id}>
              <span className="flex items-center gap-2">
                {preset.name}
                {preset.width > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {preset.width}×{preset.height}
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={zoomValue} onValueChange={(val) => setZoom(val === 'fit' ? 'fit' : parseFloat(val))}>
        <SelectTrigger className="w-[110px]" aria-label="Zoom level">
          <SelectValue>
            {zoom === 1 ? '100%' : `${Math.round(zoom * 100)}%`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fit">Fit</SelectItem>
          <SelectItem value="1">100%</SelectItem>
          <SelectItem value="0.9">90%</SelectItem>
          <SelectItem value="0.8">80%</SelectItem>
          <SelectItem value="0.75">75%</SelectItem>
          <SelectItem value="0.5">50%</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        onClick={toggleOrientation}
        aria-label={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
        title="Toggle orientation"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={toggleFrameVisible}
        aria-label={frameVisible ? 'Hide frame' : 'Show frame'}
        title="Toggle device frame"
      >
        {frameVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        aria-label="Take screenshot"
        title="Screenshot (Coming soon)"
        disabled
      >
        <Camera className="h-4 w-4" />
      </Button>
    </div>
  );
}

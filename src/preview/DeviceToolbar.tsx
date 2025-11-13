import { Eye, EyeOff, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { useDevicePreview } from './DevicePreviewProvider';
import { DEVICE_PRESETS } from './DevicePresets';

export function DeviceToolbar() {
  const { 
    selectedDeviceId, 
    zoom, 
    frameVisible,
    setSelectedDevice, 
    setZoom, 
    toggleFrameVisible
  } = useDevicePreview();
  
  const selectedPreset = DEVICE_PRESETS.find(p => p.id === selectedDeviceId);
  
  const zoomValue = zoom === 1 ? '1' : zoom.toFixed(2);
  
  // Group devices by manufacturer
  const groupedDevices = DEVICE_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.manufacturer]) {
      acc[preset.manufacturer] = [];
    }
    acc[preset.manufacturer].push(preset);
    return acc;
  }, {} as Record<string, typeof DEVICE_PRESETS>);
  
  return (
    <div 
      className="preview-toolbar" 
      role="toolbar" 
      aria-label="Device preview controls"
      data-preview-ui="true"
    >
      <Select value={selectedDeviceId} onValueChange={setSelectedDevice}>
        <SelectTrigger className="w-[280px]" aria-label="Select device">
          <SelectValue>
            {selectedPreset?.name}
            {selectedPreset && selectedPreset.screenSize !== 'Variable' && (
              <span className="text-xs text-muted-foreground ml-2">
                {selectedPreset.screenSize}, {selectedPreset.year}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          portalContainer={typeof document !== 'undefined' ? document.body : null}
          className="z-[10050]"
        >
          {Object.entries(groupedDevices).map(([manufacturer, devices]) => (
            <SelectGroup key={manufacturer}>
              <SelectLabel>{manufacturer}</SelectLabel>
              {devices.map(preset => (
                <SelectItem key={preset.id} value={preset.id}>
                  <span className="flex items-center gap-2">
                    {preset.name}
                    {preset.screenSize !== 'Variable' && (
                      <span className="text-xs text-muted-foreground">
                        {preset.screenSize}, {preset.year}
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={zoomValue} onValueChange={(val) => setZoom(val === 'fit' ? 'fit' : parseFloat(val))}>
        <SelectTrigger className="w-[110px]" aria-label="Zoom level">
          <SelectValue>
            {zoom === 1 ? '100%' : `${Math.round(zoom * 100)}%`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          portalContainer={typeof document !== 'undefined' ? document.body : null}
          className="z-[10050]"
        >
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

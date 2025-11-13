import { ReactNode } from 'react';
import { useDevicePreview } from './DevicePreviewProvider';
import { DeviceFrame } from './DeviceFrame';
import { DeviceToolbar } from './DeviceToolbar';
import { usePreviewShortcuts } from './usePreviewShortcuts';
import { DEVICE_PRESETS } from './DevicePresets';

interface ResponsiveShellProps {
  children: ReactNode;
}

export function ResponsiveShell({ children }: ResponsiveShellProps) {
  const { 
    selectedDeviceId, 
    zoom, 
    orientation, 
    frameVisible,
    isDesktop,
    isMobileDevice 
  } = useDevicePreview();
  
  usePreviewShortcuts();
  
  if (isMobileDevice) {
    return (
      <div className="mobile-shell">
        {children}
      </div>
    );
  }
  
  const selectedPreset = DEVICE_PRESETS.find(p => p.id === selectedDeviceId) || DEVICE_PRESETS[0];
  
  return (
    <div className="desktop-preview-shell">
      <div className="preview-background" />
      
      <DeviceToolbar />
      
      <div className="preview-content">
        {frameVisible ? (
          <DeviceFrame 
            preset={selectedPreset} 
            zoom={zoom} 
            orientation={orientation}
          >
            {children}
          </DeviceFrame>
        ) : (
          <div 
            className="frameless-container"
            style={{
              width: selectedPreset.width > 0 ? `${selectedPreset.width}px` : '100%',
              height: selectedPreset.height > 0 ? `${selectedPreset.height}px` : '100%',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

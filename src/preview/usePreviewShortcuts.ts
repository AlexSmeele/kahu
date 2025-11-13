import { useEffect } from 'react';
import { useDevicePreview } from './DevicePreviewProvider';

export function usePreviewShortcuts() {
  const { toggleFrameVisible, isDesktop } = useDevicePreview();
  
  useEffect(() => {
    if (!isDesktop) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleFrameVisible();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, toggleFrameVisible]);
}

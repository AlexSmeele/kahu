import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { DEFAULT_DEVICE_ID, DEVICE_PRESETS } from './DevicePresets';

interface DevicePreviewState {
  selectedDeviceId: string;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  frameVisible: boolean;
  isDesktop: boolean;
  isMobileDevice: boolean;
}

interface DevicePreviewContextValue extends DevicePreviewState {
  setSelectedDevice: (deviceId: string) => void;
  setZoom: (zoom: number | 'fit') => void;
  toggleOrientation: () => void;
  toggleFrameVisible: () => void;
}

const DevicePreviewContext = createContext<DevicePreviewContextValue | undefined>(undefined);

const STORAGE_KEY = 'kahu.preview.v1';

function detectMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Force full-screen on production mobile domain
  if (window.location.hostname === 'kahu.lovable.app') {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) return true;
  }
  
  // Check 1: User agent
  const userAgent = navigator.userAgent || '';
  const hasMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
  
  // Check 2: Pointer type (coarse = touch)
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  
  // Check 3: Screen width
  const hasNarrowScreen = window.screen.width <= 480;
  
  // Check 4: Touch support
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Combine heuristics
  return hasMobileUA || (hasTouchSupport && (hasCoarsePointer || hasNarrowScreen));
}

function calculateFitZoom(deviceWidth: number, deviceHeight: number): number {
  if (typeof window === 'undefined') return 1;
  
  // Toolbar is now on the right side (304px: 240px width + 24px offset + 40px padding)
  const toolbarWidth = 304;
  const topPadding = 80;
  const sidePadding = 80;
  
  const availableWidth = window.innerWidth - toolbarWidth - sidePadding;
  const availableHeight = window.innerHeight - topPadding;
  
  const widthScale = availableWidth / deviceWidth;
  const heightScale = availableHeight / deviceHeight;
  
  return Math.min(widthScale, heightScale, 1);
}

export function DevicePreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DevicePreviewState>(() => {
    const isMobileDevice = detectMobileDevice();
    const isDesktop = !isMobileDevice;
    
    if (typeof window !== 'undefined' && !isMobileDevice) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            isDesktop,
            isMobileDevice,
            frameVisible: true
          };
        }
      } catch (e) {
        console.warn('Failed to restore preview state:', e);
      }
    }
    
    return {
      selectedDeviceId: DEFAULT_DEVICE_ID,
      zoom: 1,
      orientation: 'portrait' as const,
      frameVisible: !isMobileDevice,
      isDesktop,
      isMobileDevice
    };
  });
  
  useEffect(() => {
    if (state.isDesktop && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          selectedDeviceId: state.selectedDeviceId,
          zoom: state.zoom,
          orientation: state.orientation
        }));
      } catch (e) {
        console.warn('Failed to persist preview state:', e);
      }
    }
  }, [state.selectedDeviceId, state.zoom, state.orientation, state.isDesktop]);
  
  const value = useMemo<DevicePreviewContextValue>(() => ({
    ...state,
    setSelectedDevice: (deviceId: string) => {
      setState(prev => ({ ...prev, selectedDeviceId: deviceId }));
    },
    setZoom: (zoom: number | 'fit') => {
      if (zoom === 'fit') {
        const preset = DEVICE_PRESETS.find(p => p.id === state.selectedDeviceId);
        if (preset && preset.width > 0) {
          const isLandscape = state.orientation === 'landscape';
          const width = isLandscape ? preset.height : preset.width;
          const height = isLandscape ? preset.width : preset.height;
          const fitZoom = calculateFitZoom(width, height);
          setState(prev => ({ ...prev, zoom: fitZoom }));
        }
      } else {
        setState(prev => ({ ...prev, zoom }));
      }
    },
    toggleOrientation: () => {
      setState(prev => ({
        ...prev,
        orientation: prev.orientation === 'portrait' ? 'landscape' : 'portrait'
      }));
    },
    toggleFrameVisible: () => {
      setState(prev => ({ ...prev, frameVisible: !prev.frameVisible }));
    }
  }), [state]);
  
  return (
    <DevicePreviewContext.Provider value={value}>
      {children}
    </DevicePreviewContext.Provider>
  );
}

export function useDevicePreview() {
  const context = useContext(DevicePreviewContext);
  if (!context) {
    throw new Error('useDevicePreview must be used within DevicePreviewProvider');
  }
  return context;
}

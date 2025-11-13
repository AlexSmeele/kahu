import { ReactNode } from 'react';
import type { DevicePreset } from './DevicePresets';

interface DeviceFrameProps {
  preset: DevicePreset;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  children: ReactNode;
}

export function DeviceFrame({ preset, zoom, orientation, children }: DeviceFrameProps) {
  const isLandscape = orientation === 'landscape';
  const width = isLandscape ? preset.height : preset.width;
  const height = isLandscape ? preset.width : preset.height;
  
  return (
    <div 
      className="device-frame-container"
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'center center'
      }}
    >
      <svg 
        className="device-bezel" 
        width={width + 8} 
        height={height + 8}
        viewBox={`0 0 ${width + 8} ${height + 8}`}
        style={{
          position: 'absolute',
          top: -4,
          left: -4,
          pointerEvents: 'none'
        }}
      >
        <defs>
          <filter id="device-shadow">
            <feDropShadow dx="0" dy="8" stdDeviation="16" floodOpacity="0.15"/>
          </filter>
        </defs>
        
        <rect 
          x="4" 
          y="4"
          width={width} 
          height={height} 
          rx={preset.cornerRadius} 
          ry={preset.cornerRadius}
          fill="#1a1a1a"
          filter="url(#device-shadow)"
        />
      </svg>
      
      {preset.notch === 'dynamic-island' && (
        <div 
          className="device-notch dynamic-island"
          style={{
            position: 'absolute',
            top: 11,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 126,
            height: 37,
            borderRadius: 19,
            background: '#1a1a1a',
            zIndex: 100
          }}
        />
      )}
      
      {preset.notch === 'standard' && (
        <div 
          className="device-notch standard"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 180,
            height: 30,
            borderRadius: '0 0 15px 15px',
            background: '#1a1a1a',
            zIndex: 100
          }}
        />
      )}
      
      {preset.notch === 'hole-punch' && (
        <div 
          className="device-notch hole-punch"
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#1a1a1a',
            zIndex: 100
          }}
        />
      )}
      
      <div 
        className="device-viewport"
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${preset.cornerRadius}px`,
          overflow: 'hidden',
          background: 'white'
        }}
      >
        {children}
      </div>
    </div>
  );
}

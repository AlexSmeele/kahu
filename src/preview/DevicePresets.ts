export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  cornerRadius: number;
  notch: 'none' | 'standard' | 'dynamic-island' | 'hole-punch';
  statusBarHeight: number;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    cornerRadius: 46,
    notch: 'dynamic-island',
    statusBarHeight: 54
  },
  {
    id: 'iphone-14-plus',
    name: 'iPhone 14/15 Plus',
    width: 428,
    height: 926,
    cornerRadius: 47,
    notch: 'standard',
    statusBarHeight: 54
  },
  {
    id: 'iphone-se-3',
    name: 'iPhone SE (3rd Gen)',
    width: 375,
    height: 667,
    cornerRadius: 8,
    notch: 'none',
    statusBarHeight: 20
  },
  {
    id: 'pixel-8-pro',
    name: 'Pixel 8 Pro',
    width: 412,
    height: 915,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 24
  },
  {
    id: 'galaxy-s24',
    name: 'Galaxy S24',
    width: 360,
    height: 780,
    cornerRadius: 38,
    notch: 'hole-punch',
    statusBarHeight: 24
  },
  {
    id: 'responsive',
    name: 'Responsive (Fit Container)',
    width: 430,
    height: 932,
    cornerRadius: 0,
    notch: 'none',
    statusBarHeight: 0
  }
];

export const DEFAULT_DEVICE_ID = 'iphone-15-pro';

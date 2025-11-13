export interface DevicePreset {
  id: string;
  name: string;
  manufacturer: string;
  width: number;
  height: number;
  cornerRadius: number;
  notch: 'none' | 'standard' | 'dynamic-island' | 'hole-punch';
  statusBarHeight: number;
  year: number;
  screenSize: string;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  // Apple iPhone
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    manufacturer: 'Apple iPhone',
    width: 440,
    height: 956,
    cornerRadius: 55,
    notch: 'dynamic-island',
    statusBarHeight: 59,
    year: 2024,
    screenSize: '6.9"'
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    manufacturer: 'Apple iPhone',
    width: 402,
    height: 874,
    cornerRadius: 55,
    notch: 'dynamic-island',
    statusBarHeight: 59,
    year: 2024,
    screenSize: '6.3"'
  },
  {
    id: 'iphone-16-plus',
    name: 'iPhone 16 Plus',
    manufacturer: 'Apple iPhone',
    width: 430,
    height: 932,
    cornerRadius: 47,
    notch: 'dynamic-island',
    statusBarHeight: 59,
    year: 2024,
    screenSize: '6.7"'
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    manufacturer: 'Apple iPhone',
    width: 393,
    height: 852,
    cornerRadius: 47,
    notch: 'dynamic-island',
    statusBarHeight: 59,
    year: 2024,
    screenSize: '6.1"'
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    manufacturer: 'Apple iPhone',
    width: 430,
    height: 932,
    cornerRadius: 55,
    notch: 'dynamic-island',
    statusBarHeight: 59,
    year: 2023,
    screenSize: '6.7"'
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    manufacturer: 'Apple iPhone',
    width: 393,
    height: 852,
    cornerRadius: 46,
    notch: 'dynamic-island',
    statusBarHeight: 54,
    year: 2023,
    screenSize: '6.1"'
  },
  {
    id: 'iphone-15-plus',
    name: 'iPhone 15 Plus',
    manufacturer: 'Apple iPhone',
    width: 428,
    height: 926,
    cornerRadius: 47,
    notch: 'standard',
    statusBarHeight: 54,
    year: 2023,
    screenSize: '6.7"'
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    manufacturer: 'Apple iPhone',
    width: 393,
    height: 852,
    cornerRadius: 47,
    notch: 'dynamic-island',
    statusBarHeight: 54,
    year: 2023,
    screenSize: '6.1"'
  },
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    manufacturer: 'Apple iPhone',
    width: 430,
    height: 932,
    cornerRadius: 55,
    notch: 'dynamic-island',
    statusBarHeight: 59,
    year: 2022,
    screenSize: '6.7"'
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    manufacturer: 'Apple iPhone',
    width: 393,
    height: 852,
    cornerRadius: 55,
    notch: 'dynamic-island',
    statusBarHeight: 59,
    year: 2022,
    screenSize: '6.1"'
  },
  {
    id: 'iphone-14-plus',
    name: 'iPhone 14 Plus',
    manufacturer: 'Apple iPhone',
    width: 428,
    height: 926,
    cornerRadius: 47,
    notch: 'standard',
    statusBarHeight: 47,
    year: 2022,
    screenSize: '6.7"'
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    manufacturer: 'Apple iPhone',
    width: 390,
    height: 844,
    cornerRadius: 47,
    notch: 'standard',
    statusBarHeight: 47,
    year: 2022,
    screenSize: '6.1"'
  },
  {
    id: 'iphone-13-pro-max',
    name: 'iPhone 13 Pro Max',
    manufacturer: 'Apple iPhone',
    width: 428,
    height: 926,
    cornerRadius: 47,
    notch: 'standard',
    statusBarHeight: 47,
    year: 2021,
    screenSize: '6.7"'
  },
  {
    id: 'iphone-13-pro',
    name: 'iPhone 13 Pro',
    manufacturer: 'Apple iPhone',
    width: 390,
    height: 844,
    cornerRadius: 47,
    notch: 'standard',
    statusBarHeight: 47,
    year: 2021,
    screenSize: '6.1"'
  },
  {
    id: 'iphone-13',
    name: 'iPhone 13',
    manufacturer: 'Apple iPhone',
    width: 390,
    height: 844,
    cornerRadius: 47,
    notch: 'standard',
    statusBarHeight: 47,
    year: 2021,
    screenSize: '6.1"'
  },
  {
    id: 'iphone-13-mini',
    name: 'iPhone 13 mini',
    manufacturer: 'Apple iPhone',
    width: 375,
    height: 812,
    cornerRadius: 39,
    notch: 'standard',
    statusBarHeight: 44,
    year: 2021,
    screenSize: '5.4"'
  },
  {
    id: 'iphone-se-3',
    name: 'iPhone SE (3rd Gen)',
    manufacturer: 'Apple iPhone',
    width: 375,
    height: 667,
    cornerRadius: 8,
    notch: 'none',
    statusBarHeight: 20,
    year: 2022,
    screenSize: '4.7"'
  },
  
  // Samsung Galaxy
  {
    id: 'galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra',
    manufacturer: 'Samsung Galaxy',
    width: 412,
    height: 915,
    cornerRadius: 42,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2024,
    screenSize: '6.8"'
  },
  {
    id: 'galaxy-s24-plus',
    name: 'Galaxy S24+',
    manufacturer: 'Samsung Galaxy',
    width: 384,
    height: 854,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2024,
    screenSize: '6.7"'
  },
  {
    id: 'galaxy-s24',
    name: 'Galaxy S24',
    manufacturer: 'Samsung Galaxy',
    width: 360,
    height: 780,
    cornerRadius: 38,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2024,
    screenSize: '6.2"'
  },
  {
    id: 'galaxy-s23-ultra',
    name: 'Galaxy S23 Ultra',
    manufacturer: 'Samsung Galaxy',
    width: 412,
    height: 915,
    cornerRadius: 42,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2023,
    screenSize: '6.8"'
  },
  {
    id: 'galaxy-s23-plus',
    name: 'Galaxy S23+',
    manufacturer: 'Samsung Galaxy',
    width: 384,
    height: 854,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2023,
    screenSize: '6.6"'
  },
  {
    id: 'galaxy-s23',
    name: 'Galaxy S23',
    manufacturer: 'Samsung Galaxy',
    width: 360,
    height: 780,
    cornerRadius: 38,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2023,
    screenSize: '6.1"'
  },
  {
    id: 'galaxy-s22-ultra',
    name: 'Galaxy S22 Ultra',
    manufacturer: 'Samsung Galaxy',
    width: 412,
    height: 915,
    cornerRadius: 42,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2022,
    screenSize: '6.8"'
  },
  {
    id: 'galaxy-s22',
    name: 'Galaxy S22',
    manufacturer: 'Samsung Galaxy',
    width: 360,
    height: 780,
    cornerRadius: 38,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2022,
    screenSize: '6.1"'
  },
  {
    id: 'galaxy-s21',
    name: 'Galaxy S21',
    manufacturer: 'Samsung Galaxy',
    width: 360,
    height: 800,
    cornerRadius: 38,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2021,
    screenSize: '6.2"'
  },
  {
    id: 'galaxy-a54',
    name: 'Galaxy A54',
    manufacturer: 'Samsung Galaxy',
    width: 412,
    height: 915,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 28,
    year: 2023,
    screenSize: '6.4"'
  },
  
  // Google Pixel
  {
    id: 'pixel-9-pro-xl',
    name: 'Pixel 9 Pro XL',
    manufacturer: 'Google Pixel',
    width: 412,
    height: 918,
    cornerRadius: 42,
    notch: 'hole-punch',
    statusBarHeight: 28,
    year: 2024,
    screenSize: '6.8"'
  },
  {
    id: 'pixel-9-pro',
    name: 'Pixel 9 Pro',
    manufacturer: 'Google Pixel',
    width: 384,
    height: 856,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 26,
    year: 2024,
    screenSize: '6.3"'
  },
  {
    id: 'pixel-9',
    name: 'Pixel 9',
    manufacturer: 'Google Pixel',
    width: 384,
    height: 856,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 26,
    year: 2024,
    screenSize: '6.3"'
  },
  {
    id: 'pixel-8-pro',
    name: 'Pixel 8 Pro',
    manufacturer: 'Google Pixel',
    width: 412,
    height: 915,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2023,
    screenSize: '6.7"'
  },
  {
    id: 'pixel-8',
    name: 'Pixel 8',
    manufacturer: 'Google Pixel',
    width: 412,
    height: 915,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2023,
    screenSize: '6.2"'
  },
  {
    id: 'pixel-7-pro',
    name: 'Pixel 7 Pro',
    manufacturer: 'Google Pixel',
    width: 412,
    height: 892,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2022,
    screenSize: '6.7"'
  },
  {
    id: 'pixel-7',
    name: 'Pixel 7',
    manufacturer: 'Google Pixel',
    width: 412,
    height: 915,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2022,
    screenSize: '6.3"'
  },
  {
    id: 'pixel-6-pro',
    name: 'Pixel 6 Pro',
    manufacturer: 'Google Pixel',
    width: 412,
    height: 892,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2021,
    screenSize: '6.7"'
  },
  {
    id: 'pixel-6',
    name: 'Pixel 6',
    manufacturer: 'Google Pixel',
    width: 412,
    height: 915,
    cornerRadius: 40,
    notch: 'hole-punch',
    statusBarHeight: 24,
    year: 2021,
    screenSize: '6.4"'
  },
  
  // OnePlus
  {
    id: 'oneplus-12',
    name: 'OnePlus 12',
    manufacturer: 'OnePlus',
    width: 450,
    height: 1008,
    cornerRadius: 44,
    notch: 'hole-punch',
    statusBarHeight: 32,
    year: 2024,
    screenSize: '6.82"'
  },
  {
    id: 'oneplus-11',
    name: 'OnePlus 11',
    manufacturer: 'OnePlus',
    width: 450,
    height: 1008,
    cornerRadius: 44,
    notch: 'hole-punch',
    statusBarHeight: 32,
    year: 2023,
    screenSize: '6.7"'
  },
  {
    id: 'oneplus-10-pro',
    name: 'OnePlus 10 Pro',
    manufacturer: 'OnePlus',
    width: 440,
    height: 986,
    cornerRadius: 42,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2022,
    screenSize: '6.7"'
  },
  {
    id: 'oneplus-9-pro',
    name: 'OnePlus 9 Pro',
    manufacturer: 'OnePlus',
    width: 440,
    height: 986,
    cornerRadius: 42,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2021,
    screenSize: '6.7"'
  },
  
  // Xiaomi
  {
    id: 'xiaomi-14-ultra',
    name: 'Xiaomi 14 Ultra',
    manufacturer: 'Xiaomi',
    width: 440,
    height: 986,
    cornerRadius: 44,
    notch: 'hole-punch',
    statusBarHeight: 32,
    year: 2024,
    screenSize: '6.73"'
  },
  {
    id: 'xiaomi-14-pro',
    name: 'Xiaomi 14 Pro',
    manufacturer: 'Xiaomi',
    width: 440,
    height: 986,
    cornerRadius: 44,
    notch: 'hole-punch',
    statusBarHeight: 32,
    year: 2024,
    screenSize: '6.73"'
  },
  {
    id: 'xiaomi-13-pro',
    name: 'Xiaomi 13 Pro',
    manufacturer: 'Xiaomi',
    width: 440,
    height: 986,
    cornerRadius: 44,
    notch: 'hole-punch',
    statusBarHeight: 32,
    year: 2023,
    screenSize: '6.73"'
  },
  {
    id: 'xiaomi-12-pro',
    name: 'Xiaomi 12 Pro',
    manufacturer: 'Xiaomi',
    width: 440,
    height: 986,
    cornerRadius: 42,
    notch: 'hole-punch',
    statusBarHeight: 30,
    year: 2022,
    screenSize: '6.73"'
  },
  
  // Responsive
  {
    id: 'responsive',
    name: 'Responsive (Fit Container)',
    manufacturer: 'Other',
    width: 430,
    height: 932,
    cornerRadius: 0,
    notch: 'none',
    statusBarHeight: 0,
    year: 2024,
    screenSize: 'Variable'
  }
];

export const DEFAULT_DEVICE_ID = 'iphone-15-pro';

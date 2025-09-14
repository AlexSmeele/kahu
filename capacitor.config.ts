import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.03b5970f0cb84fe891e1b815afb7e268',
  appName: 'kahu-dog-trainer',
  webDir: 'dist',
  server: {
    url: 'https://03b5970f-0cb8-4fe8-91e1-b815afb7e268.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#faf8f5',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
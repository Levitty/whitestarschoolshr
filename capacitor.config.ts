import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whitestar.schoolshr',
  appName: 'Whitestar Schools HR',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;


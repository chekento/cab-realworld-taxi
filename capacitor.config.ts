import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cloud.kosch.cab',
  appName: 'CAB — The Real World Taxi',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
};

export default config;

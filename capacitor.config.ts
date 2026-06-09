import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.horrorscifi.chronochills',
  appName: 'Chronochills',
  webDir: 'dist',
  server: {
    url: 'https://chronochills.com',
    cleartext: false,
    androidScheme: 'https',
  },
};

export default config;

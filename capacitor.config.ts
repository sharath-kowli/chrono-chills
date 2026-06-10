import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.horrorscifi.chronochills',
  appName: 'Chronochills',
  webDir: 'dist',
  server: {
    url: 'https://chronochills.com',
    cleartext: false,
    androidScheme: 'https',
    // Keep OAuth flow inside the webview so the user returns to the app
    // after Google sign-in (instead of being kicked to the system browser).
    allowNavigation: [
      'chronochills.com',
      '*.chronochills.com',
      'oauth.lovable.app',
      '*.lovable.app',
      'accounts.google.com',
      '*.google.com',
      '*.googleusercontent.com',
      'appleid.apple.com',
    ],
  },
};

export default config;

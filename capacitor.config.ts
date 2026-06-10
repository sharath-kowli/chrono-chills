import type { CapacitorConfig } from '@capacitor/cli';

// Use a real Chrome user agent so Google's OAuth screen does not reject the
// in-app webview with "disallowed_useragent" / 403.
const CHROME_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

const config: CapacitorConfig = {
  appId: 'com.horrorscifi.chronochills',
  appName: 'Chronochills',
  webDir: 'dist',
  // Spoof a normal Chrome UA on both platforms (Google blocks WebView OAuth).
  overrideUserAgent: CHROME_UA,
  android: {
    overrideUserAgent: CHROME_UA,
  },
  ios: {
    overrideUserAgent: CHROME_UA,
  },
  server: {
    url: 'https://chronochills.com',
    cleartext: false,
    androidScheme: 'https',
    // Keep the entire OAuth round trip inside the webview so the user lands
    // back on chronochills.com (the app) after Google sign-in instead of being
    // kicked out to an external browser that can't return to the app.
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


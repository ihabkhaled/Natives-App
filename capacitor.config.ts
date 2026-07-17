import type { CapacitorConfig } from '@capacitor/cli';

import { APP_IDENTITY } from './src/shared/config/app-identity.constants';

/**
 * Native shell configuration.
 * - webDir must match the Vite build output.
 * - androidScheme stays https; cleartext traffic is forbidden.
 * - No server.url may ever be committed: a development live-reload URL
 *   would ship a remote-loading production app. See rules/26.
 * - Keyboard, status bar, and splash behavior are centralized here and in
 *   src/platform startup owners.
 */
const config: CapacitorConfig = {
  appId: APP_IDENTITY.appId,
  appName: APP_IDENTITY.appName,
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      overlaysWebView: false,
    },
  },
};

export default config;

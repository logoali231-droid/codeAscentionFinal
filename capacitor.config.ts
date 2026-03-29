import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.codeascent.app',
  appName: 'Code Ascent',
  webDir: 'public',
  server: {
    url: 'http://10.0.2.2:9002', // Local development IP for Android Emulator pointing to your local Next.js dev server.
    cleartext: true
  }
};

export default config;

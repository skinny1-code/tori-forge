import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rawagon.toriforge',
  appName: 'Tori Forge',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#040508',
      overlaysWebView: false,
    },
  },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.zanzar',
  appName: 'zanzar',
  webDir: 'dist',
  server: {
    url: 'https://server-zanzar.onrender.com',
  },
};

export default config;

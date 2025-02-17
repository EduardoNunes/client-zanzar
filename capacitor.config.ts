import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    Camera: {
      webUseInput: true, // Isso força o uso do input file no PWA
    },
  },
  appId: 'com.example.zanzar',
  appName: 'zanzar',
  webDir: 'dist',
  server: {
    url: 'https://zanzar.netlify.app', 
    cleartext: true, // Se você estiver usando HTTP durante o desenvolvimento local, isso pode ser necessário
  }
};

export default config;

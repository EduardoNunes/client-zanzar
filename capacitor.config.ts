import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.zanzar",
  appName: "Zanzar",
  webDir: "dist",
  plugins: {
    Camera: {
      webUseInput: true,
    },
    StatusBar: {
      overlaysWebView: false,
    },
  },
  server: {
    androidScheme: "https",
    // ❌ Remover "url" em produção
    // url: "https://zanzar.netlify.app",
    cleartext: true,
  },
};

export default config;

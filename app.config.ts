// app.config.ts
import "dotenv/config";
import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Seasonthon Team90",
  slug: "seasonthon-team90",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "goorm90",
  userInterfaceStyle: "automatic",

  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.goormthon.team90",
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.goormthon.team90",
    versionCode: 1,
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: ["expo-router"],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    router: {},
    eas: {
      projectId: "59dd1ee6-ecbe-48db-81b1-40318898958b",
    },
    APP_ENV: process.env.APP_ENV,
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    KAKAO_NATIVE_KEY: process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY,
  },

  runtimeVersion: { policy: "appVersion" },

  updates: {
    url: "https://u.expo.dev/59dd1ee6-ecbe-48db-81b1-40318898958b",
  },
});

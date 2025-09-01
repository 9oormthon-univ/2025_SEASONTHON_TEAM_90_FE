import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Seasonthon Team90",
  slug: "seasonthon-team90",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "goorm90",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  splash: {
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
      projectId: "95853990-fe91-469b-a0b0-d2570d5e6378",
    },
    // 환경변수(.env) → 코드에서 process.env로 접근
    APP_ENV: process.env.APP_ENV,
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    KAKAO_NATIVE_KEY: process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY,
  },

  runtimeVersion: {
    policy: "appVersion",
  },

  updates: {
    url: "https://u.expo.dev/95853990-fe91-469b-a0b0-d2570d5e6378",
  },
});

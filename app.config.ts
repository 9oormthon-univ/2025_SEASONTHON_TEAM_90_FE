// app.config.ts
import "dotenv/config";
import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Seasonthon Team90",
  slug: "seasonthon-team90",
  version: "1.0.0",
  orientation: "portrait",

  // 🔑 AuthSession 딥링크 스킴 (Redirect URI: goorm90://redirect)
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

  plugins: [
    "expo-router",
    // (선택) 네이티브 빌드 속성 제어가 필요할 때만 사용
    // ["expo-build-properties", { android: { kotlinVersion: "1.9.24" } }],
  ],

  experiments: { typedRoutes: true },

  extra: {
    router: {},
    eas: { projectId: "59dd1ee6-ecbe-48db-81b1-40318898958b" },

    // -------- 앱 환경 / API --------
    APP_ENV: process.env.APP_ENV,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,

    // -------- OAuth 공통 --------
    // AuthSession.makeRedirectUri({ scheme: "goorm90" }) -> "goorm90://redirect"
    redirectScheme: "goorm90",
    kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI,

    // -------- 각 공급자 키 --------
    // ⚠️ 클라이언트에 공개되는 값은 EXPO_PUBLIC_* 로만 두세요. (client secret은 클라에 두면 안됨)
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID, // e.g. xxx.apps.googleusercontent.com
    kakaoRestApiKey: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY, // 카카오 REST API 키
    naverClientId: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID, // 네이버 Client ID
    // ❗ 네이버 Client Secret은 클라이언트에 두지 않는 것이 안전합니다(백엔드에서 교환 권장).
    // 필요 시 테스트용으로만 노출:
    naverClientSecret: process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET,

    // (이전 네이티브 SDK 키는 AuthSession에선 미사용)
    // KAKAO_NATIVE_KEY: process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY,
  },

  runtimeVersion: { policy: "appVersion" },
  updates: { url: "https://u.expo.dev/59dd1ee6-ecbe-48db-81b1-40318898958b" },
});

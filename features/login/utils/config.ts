import Constants from "expo-constants";

export const BASE_URL =
  (Constants.expoConfig?.extra as any)?.API_BASE_URL || "http://localhost:8080";

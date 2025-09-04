import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PowerChocolate: require("@/assets/fonts/PowerChocolate.otf"),
    NanumPen: require("@/assets/fonts/NanumPen.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 온보딩 플로우 */}
      <Stack.Screen name="onboarding/splash" />
      <Stack.Screen name="onboarding/login" />
      <Stack.Screen name="onboarding/purpose-select" />

      {/* 로그인 이후 메인 탭 */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

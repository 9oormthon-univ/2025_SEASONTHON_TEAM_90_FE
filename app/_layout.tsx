import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import '../global.css' // 스타일

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PowerChocolate: require("@/assets/fonts/PowerChocolate.otf"),
    NanumPen: require("@/assets/fonts/NanumPen.ttf"),
  }); //폰트

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => { });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
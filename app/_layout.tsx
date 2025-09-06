// app/_layout.tsx
import "react-native-gesture-handler";
import "react-native-reanimated";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PowerChocolate: require("@/assets/fonts/PowerChocolate.otf"),
    NanumPen: require("@/assets/fonts/NanumPen.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* ✅ 전역으로 AuthProvider로 감싸기 */}
        <AuthProvider>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </BottomSheetModalProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

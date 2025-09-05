import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// 🔒 Firebase 관련 (주석 처리)
// import messaging from "@react-native-firebase/messaging";
// import DeviceInfo from "react-native-device-info";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();
const API_BASE = "http://10.0.2.2:8080";
const accessToken = "YOUR_JWT_ACCESS_TOKEN";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PowerChocolate: require("@/assets/fonts/PowerChocolate.otf"),
    NanumPen: require("@/assets/fonts/NanumPen.ttf"),
  });

  // 🔒 Firebase 관련 (주석 처리)
  // const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // 🔒 Firebase 관련 (주석 처리)
  /*
  useEffect(() => {
    (async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) return;

        const token = await messaging().getToken();
        const deviceId = await DeviceInfo.getUniqueId();
        setFcmToken(token);

        await fetch(`${API_BASE}/api/notifications/tokens`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, deviceId }),
        });
      } catch (err) {
        console.error("FCM 초기화 에러:", err);
      }
    })();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("📩 포그라운드 알림:", remoteMessage);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      if (fcmToken) {
        fetch(`${API_BASE}/api/notifications/tokens/${fcmToken}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    };
  }, [fcmToken]);
  */

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="../onboarding/login" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

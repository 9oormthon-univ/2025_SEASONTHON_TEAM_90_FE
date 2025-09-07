import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function MyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 기본 MyPage */}
      <Stack.Screen name="index" />
      {/* 알림 설정 */}
      <Stack.Screen name="notificationSettings" />
    </Stack>
  );
}

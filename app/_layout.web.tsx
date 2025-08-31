import { Stack } from "expo-router";
// 웹 전용 테스터
export default function RootLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
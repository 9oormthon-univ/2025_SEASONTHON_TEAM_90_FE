// app/(tabs)/_layout.tsx - 로그인 탭 숨기기(선택)
import { Tabs } from 'expo-router';
import 'global.css'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}

import React from 'react';
import { Tabs, Link } from 'expo-router';
import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// 로컬 팔레트(Colors 파일 의존 제거)
const PALETTE = {
    light: {
        text: '#11181C',
        background: '#ffffff',
        tint: '#0a7ea4',
        tabIconDefault: '#687076',
        tabIconSelected: '#0a7ea4',
    },
    dark: {
        text: '#ECEDEE',
        background: '#000000',
        tint: '#5bd0ff',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: '#5bd0ff',
    },
} as const;

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabsLayout() {
    const scheme = useColorScheme(); // 'light' | 'dark'
    const theme = (scheme ?? 'light') as keyof typeof PALETTE;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: PALETTE[theme].tabIconSelected,
                headerShown: useClientOnlyValue(false, true),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Calendar',
                    tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
                    headerRight: () => (
                        <Link href="/modal" asChild>
                            <Pressable accessibilityRole="button">
                                {({ pressed }) => (
                                    <FontAwesome
                                        name="info-circle"
                                        size={22}
                                        color={PALETTE[theme].text}
                                        style={{ marginRight: 12, opacity: pressed ? 0.5 : 1 }}
                                    />
                                )}
                            </Pressable>
                        </Link>
                    ),
                }}
            />
            <Tabs.Screen
                name="two"
                options={{
                    title: 'Second',
                    tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
                }}
            />
        </Tabs>
    );
}

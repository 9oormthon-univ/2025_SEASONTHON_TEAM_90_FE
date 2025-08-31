// 기본 내보내기 포함한 네비게이션 루트

import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CalendarDemoPage from '@/features/calendar/pages/CalendarDemoPage'; 

// 네비게이션 파라미터 타입
export type RootStackParamList = {
    MainTabs: undefined;
};

export type MainTabParamList = {
    CalendarDemo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 탭 화면
const MainTabs: React.FC = () => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
            name="CalendarDemo"
            component={CalendarDemoPage}
            options={{
                tabBarLabel: '캘린더',
                // [optional] 아이콘은 이후 UI 단계에서 교체
                tabBarIcon: () => <Text>📅</Text>,
            }}
        />
    </Tab.Navigator>
);

// 루트 스택
const RootNavigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigation; // [added] 기본 내보내기

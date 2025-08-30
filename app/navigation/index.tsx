// React Navigation 기본 스택 + 탭 구성 (Calendar 탭 포함)
// - 다른 탭/페이지는 이후 단계에서 추가


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { CalendarPage } from '@/features/calendar';


// 타입
export type RootStackParamList = {
    MainTabs: undefined;
    // Record, Routine, Settings 등은 이후 확장
};


export type MainTabParamList = {
    Calendar: undefined;
    // Home, Dashboard 등 필요 시 확장
};


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();


const CalendarTabScreen = () => {
    return <CalendarPage />;
};


const MainTabs = () => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
            name="Calendar"
            component={CalendarTabScreen}
            options={{
                tabBarLabel: '캘린더',
                // 아이콘은 UI 단계에서 지정
                tabBarIcon: () => <Text>📅</Text>,
            }}
        />
    </Tab.Navigator>
);


const RootNavigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};


export default RootNavigation;
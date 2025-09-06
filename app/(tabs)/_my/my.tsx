import React from 'react';
import { ScrollView, View } from 'react-native';
import ProfileCard from '@/features/mypage/components/ProfileCard';
import StatsCard from '@/features/mypage/components/StatsCard';
import BadgeList from '@/features/mypage/components/BadgeList';
import SettingsItem from '@/features/mypage/components/SettingsItem';
import MyPageHeader from '@/features/mypage/components/MyPageHeader';

const MyPageScreen = () => {
    const handleLogout = () => {
        // ✅ 로그아웃 로직 (예: 토큰 삭제, 로그인 화면 이동 등)
        console.log('로그아웃 실행!');
    };

    return (
        <ScrollView className="flex-1 bg-[#F2EFE6]">
            {/* Header */}
            <MyPageHeader onPressLogout={handleLogout} />

            {/* Profile */}
            <ProfileCard />

            {/* Stats + Badge 묶음 */}
            <View className="mx-4 mt-6 rounded-2xl bg-[#F7F7F7] shadow p-6">
                <StatsCard />
                {/* 사이 띄우기 */}
                <View className="h-6" /> 
                <BadgeList />
            </View>

            {/* Settings */}
            <View className="mt-4">
                <SettingsItem
                    title="알림 설정"
                    onPress={() => console.log('알림 설정')}
                />
            </View>
        </ScrollView>
    );
};

export default MyPageScreen;

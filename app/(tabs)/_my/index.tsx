import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import ProfileCard from '@/features/mypage/components/ProfileCard';
import StatsCard from '@/features/mypage/components/StatsCard';
import BadgeList from '@/features/mypage/components/BadgeList';
import SettingsItem from '@/features/mypage/components/SettingsItem';
import MyPageHeader from '@/features/mypage/components/MyPageHeader';
import { useRouter } from 'expo-router';

const MyPageScreen = () => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const router = useRouter();

  return (
    <>
      <ScrollView
        className="flex-1 bg-[#F2EFE6]"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        {/* Header */}
        <MyPageHeader onPressLogout={() => setLogoutModalVisible(true)} />

        {/* Profile */}
        <ProfileCard />

        {/* Stats + Badge */}
        <View className="mx-4 mt-6 rounded-2xl bg-[#F7F7F7] shadow p-6">
          <StatsCard />
          <View className="h-6" />
          <BadgeList />
        </View>

        {/* Settings */}
        <View className="mt-4 mb-8">
          <SettingsItem
            title="알림 설정"
            onPress={() => router.push('/(tabs)/_my/notificationSettings')}
          />
        </View>

        {/* 회원 탈퇴 버튼 */}
        <TouchableOpacity onPress={() => setDeleteModalVisible(true)} className="mt-40">
          <Text className="text-sm text-center text-gray-500 underline">
            회원 탈퇴
          </Text>
        </TouchableOpacity>
      </ScrollView>

    </>
  );
};

export default MyPageScreen;

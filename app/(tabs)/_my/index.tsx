import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import ProfileCard from '@/features/mypage/components/ProfileCard';
import StatsCard from '@/features/mypage/components/StatsCard';
import BadgeList from '@/features/mypage/components/BadgeList';
import SettingsItem from '@/features/mypage/components/SettingsItem';
import MyPageHeader from '@/features/mypage/components/MyPageHeader';
import LogoutModal from '@/features/mypage/components/LogoutModal';
import DeleteAccountModal from '@/features/mypage/components/DeleteAccountModal'; // ✅ 추가
import { useSessionStore } from '@/features/auth/store/session.store';
import { useRouter } from 'expo-router';
import client from '@/shared/api/client';

const MyPageScreen = () => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { clear } = useSessionStore();
  const router = useRouter();

  // 로그아웃
  const handleLogout = async () => {
    try {
      await client.post('/api/auth/logout');
      clear();
      router.replace('/onboarding/login');
    } catch (err: any) {
      console.error('❌ 로그아웃 실패:', err.response?.data ?? err);
      Alert.alert('로그아웃 실패', '다시 시도해주세요.');
    } finally {
      setLogoutModalVisible(false);
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    try {
      await client.delete('/api/members/me');
      clear();
      router.replace('/onboarding/login');
      Alert.alert('회원 탈퇴 완료', '계정이 삭제되었습니다.');
    } catch (err: any) {
      console.error('❌ 회원 탈퇴 실패:', err.response?.data ?? err);
      const message =
        err.response?.data?.message ?? '회원 탈퇴 중 오류가 발생했습니다.';
      Alert.alert('회원 탈퇴 실패', message);
    } finally {
      setDeleteModalVisible(false);
    }
  };

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
          <Text className="text-center text-gray-500 underline text-sm">
            회원 탈퇴
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 로그아웃 모달 */}
      <LogoutModal
        visible={logoutModalVisible}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />

      {/* 회원 탈퇴 모달 */}
      <DeleteAccountModal
        visible={deleteModalVisible}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </>
  );
};

export default MyPageScreen;

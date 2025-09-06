import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import ProfileCard from "@/features/mypage/components/ProfileCard";
import StatsCard from "@/features/mypage/components/StatsCard";
import BadgeList from "@/features/mypage/components/BadgeList";
import SettingsItem from "@/features/mypage/components/SettingsItem";
import MyPageHeader from "@/features/mypage/components/MyPageHeader";
import LogoutModal from "@/features/mypage/components/LogoutModal";
import { useRouter } from "expo-router";

const MyPageScreen = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const router = useRouter();

  const handleLogout = () => {
    setModalVisible(false);
    console.log("로그아웃 완료");
  };

  return (
    <>
      <ScrollView className="flex-1 bg-[#F2EFE6]">
        {/* Header */}
        <MyPageHeader onPressLogout={() => setModalVisible(true)} />

        {/* Profile */}
        <ProfileCard />

        {/* Stats + Badge */}
        <View className="mx-4 mt-6 rounded-2xl bg-[#F7F7F7] shadow p-6">
          <StatsCard />
          <View className="h-6" />
          <BadgeList />
        </View>

        {/* Settings */}
        <View className="mt-4">
          <SettingsItem
            title="알림 설정"
            onPress={() => router.push("/(tabs)/_my/notificationSettings")}
          />
        </View>
      </ScrollView>

      {/* 로그아웃 모달 */}
      <LogoutModal
        visible={modalVisible}
        onConfirm={handleLogout}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
};

export default MyPageScreen;
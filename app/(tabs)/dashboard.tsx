import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@shared/store/authStore";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

export default function DashboardTabScreen() {
  // 전역 스토어에서 로그인한 사용자의 memberId
  const { memberId } = useAuthStore();

  // 아직 memberId가 로드되지 않았을 경우 로딩 화면 출력
  if (!memberId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // 가져온 memberId를 DashboardPage에 prop으로 전달
  return <DashboardPage memberId={memberId} key={memberId} />;
}

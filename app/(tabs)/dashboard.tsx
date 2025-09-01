//topbar 가 잘 작동하는지 확인하기 위한 예시 코드입니다. 지우셔도 됩니다.

import React from "react";
import { View, Text } from "react-native";
import Colors from "@/constants/Colors";
import TopBar from "@/components/Common/TopBar";  //topbar 코드 입니다.

export default function Dashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      {/* 🔼 절대 위치 TopBar */}
      <TopBar
        title="대시보드"
        rightTitle="편집"
        onBackPress={() => console.log("뒤로가기")}
        onRightPress={() => console.log("편집 클릭")}
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      />

      {/* 🔽 화면 본문 */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 60,
        }}
      >
        <Text
          style={{
            color: Colors.brandPrimary,
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          대시보드 화면
        </Text>
      </View>
    </View>
  );
}

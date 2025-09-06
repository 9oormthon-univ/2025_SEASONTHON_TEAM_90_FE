// features/login/screens/LoginScreen.tsx
import React from "react";
import { View, Button, Alert } from "react-native";
import useSocialOAuth from "../hooks/useSocialOAuth";

export default function LoginScreen() {
  const { authorize } = useSocialOAuth();

  const onPressKakao = async () => {
    try {
      const { accessToken } = await authorize("KAKAO");
      // TODO: 백엔드로 accessToken 넘겨서 회원가입/로그인 처리
      Alert.alert("성공", `토큰: ${accessToken.slice(0, 8)}...`);
    } catch (e: any) {
      Alert.alert("실패", e?.message ?? "알 수 없는 오류");
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Button title="카카오 로그인" onPress={onPressKakao} />
      {/* 필요시 GOOGLE/NAVER 버튼도 동일 패턴 */}
    </View>
  );
}

import React from "react";
import { View, Text, ActivityIndicator, Alert, Image } from "react-native";
import SocialButtons from "@/features/login/components/SocialButtons";
import { useAuth } from "@/features/login/hooks/useAuth";

export default function LoginScreen() {
  const { login, loading } = useAuth();

  const go = async (p: "GOOGLE" | "KAKAO" | "NAVER") => {
    try {
      await login(p);
    } catch (e: any) {
      Alert.alert("로그인 실패", e?.message ?? "잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 28 }}>
      <Image
        source={{ uri: "https://dummyimage.com/160x160/eee/000.png&text=Habiglow" }}
        style={{ width: 160, height: 160, alignSelf: "center", borderRadius: 24 }}
      />
      <Text style={{ fontSize: 24, fontWeight: "800", textAlign: "center" }}>Habiglow</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <SocialButtons
          onGoogle={() => go("GOOGLE")}
          onKakao={() => go("KAKAO")}
          onNaver={() => go("NAVER")}
        />
      )}
      <Text style={{ textAlign: "center", color: "#6B7280", fontSize: 12 }}>
        로그인 시 이용약관 및 개인정보 처리방침에 동의합니다.
      </Text>
    </View>
  );
}

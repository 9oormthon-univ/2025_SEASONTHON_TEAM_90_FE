// app/onboarding/login.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useGoogleLogin } from "@/features/auth/api/useGoogleLogin";
import { useKakaoLogin } from "@/features/auth/api/useKakaoLogin";
import { useNaverLogin } from "@/features/auth/api/useNaverLogin";

export default function LoginScreen() {
  const router = useRouter();

  // ✅ 구글 (expo-auth-session 방식)
  const { request: googleReq, promptAsync: googlePrompt } = useGoogleLogin(
    (token) => {
      console.log("서버로 구글 토큰 전달:", token);
      router.replace("/onboarding/purpose-select");
    },
    (err) => {
      console.error("구글 로그인 실패:", err);
    }
  );

  // ✅ 카카오
  const { handleLogin: kakaoHandleLogin } = useKakaoLogin((token) => {
    console.log("서버로 카카오 토큰 전달:", token);
    router.replace("/onboarding/purpose-select");
  });

  // ✅ 네이버
  const { handleLogin: naverHandleLogin } = useNaverLogin((token) => {
    console.log("서버로 네이버 토큰 전달:", token);
    router.replace("/onboarding/purpose-select");
  });

  return (
    <View className="flex-1 justify-center items-center bg-[#F9F5EE] px-6">
      {/* 구글 로그인 */}
      <TouchableOpacity
        disabled={!googleReq}
        onPress={() => googlePrompt()}
        className="flex-row items-center justify-center bg-white border border-gray-300 px-6 py-4 rounded-md w-full mb-3"
      >
        <Text className="text-gray-800 font-medium">구글 계정으로 시작하기</Text>
      </TouchableOpacity>

      {/* 카카오 로그인 */}
      <TouchableOpacity
        onPress={() => kakaoHandleLogin()}
        className="flex-row items-center justify-center bg-[#FEE500] px-6 py-4 rounded-md w-full mb-3"
      >
        <Text className="text-black font-medium">카카오 계정으로 시작하기</Text>
      </TouchableOpacity>

      {/* 네이버 로그인 */}
      <TouchableOpacity
        onPress={() => naverHandleLogin()}
        className="flex-row items-center justify-center bg-[#03C75A] px-6 py-4 rounded-md w-full"
      >
        <Text className="text-white font-medium">네이버 계정으로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}
    
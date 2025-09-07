import React, { JSX, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { devMockLogin } from "@/features/login/api/login";
import { useAuthStore } from "@/features/login/store/auth.store";
import { validateEmail } from "@/features/login/utils/validateEmail";
import { setAccessToken, setRefreshToken } from "@/shared/api/client";

import HabiGlow from "../assets/HabiGlow.svg";
import Logo from "../assets/logo.svg";

// 개발 편의: 이메일 형식 무시하고 "비어있지만 않으면" 활성화하고 싶을 때 true
const DEV_LOOSE_EMAIL_CHECK = true;

export default function LoginPage(): JSX.Element {
  const setTokens = useAuthStore((s) => s.setTokens);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 항상 트림된 값으로 검증
  const emailTrimmed = useMemo(() => email.trim(), [email]);

  // ✅ 공백 등으로 인한 false 방지
  const emailValidStrict = useMemo(() => validateEmail(emailTrimmed), [emailTrimmed]);

  // ✅ 개발모드에선 "비어있지 않음"만 체크, 아니면 엄격검증
  const emailValid = DEV_LOOSE_EMAIL_CHECK ? emailTrimmed.length > 0 : emailValidStrict;

  // 필요하면 비밀번호도 조건에 포함:
  // const passwordValid = password.trim().length >= 1;
  // const disabled = loading || !emailValid || !passwordValid;

  const disabled = loading || !emailValid;

  const onSubmit = async () => {
    if (loading) return;

    // 최종 제출 전에도 트림 값 사용
    if (!emailValid) {
      Alert.alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    try {
      setLoading(true);

      const res = await devMockLogin({ email: emailTrimmed });

      await setAccessToken(res.accessToken ?? null);
      await setRefreshToken((res as any)?.refreshToken ?? null);

      setTokens({ accessToken: res.accessToken ?? "" });

      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("로그인 실패", e?.response?.data?.message ?? "다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="justify-center flex-1 p-6 bg-[#F2EFE6]">
      <View className="flex-col items-center gap-[10px] mb-8">
        <Logo />
        <HabiGlow />
      </View>

      <View className="gap-8">
        <TextInput
          className="p-5 border rounded-xl"
          value={email}
          onChangeText={(t) => setEmail(t)} // 필요시 공백 제거 원하면: setEmail(t.replace(/\s+/g, ""))
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="이메일을 입력해 주세요"
          textContentType="emailAddress"
          // iOS 자동 완성 끄고 싶으면: importantForAutofill="no"
        />

        <TextInput
          className="p-5 border rounded-xl"
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호를 입력해 주세요"
          secureTextEntry
          textContentType="password"
        />

        <Pressable
          disabled={disabled}
          onPress={onSubmit}
          className={`rounded-xl items-center justify-center p-5 ${
            disabled ? "opacity-50" : ""
          } bg-[#5F5548]`}
          accessibilityRole="button"
          accessibilityLabel="로그인 하기"
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-[20px] font-semibold text-white">로그인 하기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

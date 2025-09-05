import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useKakaoLogin } from '@/features/auth/api/useKakaoLogin';

export default function LoginScreen() {
  const router = useRouter();
  const { request, response, handleLogin } = useKakaoLogin();

  // ✅ response 값과 redirectUri 로그 찍기
  useEffect(() => {
    console.log('👉 Kakao Auth Request:', request);
    console.log('👉 Kakao Auth Response:', response);

    if (response?.type === 'success') {
      router.replace('/onboarding/purpose-select');
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        disabled={!request}
        title="카카오 로그인"
        onPress={() => {
          console.log('👉 Login button pressed');
          handleLogin();
        }}
      />
    </View>
  );
}

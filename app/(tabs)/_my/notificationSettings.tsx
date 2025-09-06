import React, { JSX } from 'react'; // CHANGED: JSX/useState 불필요 import 제거
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSessionStore } from '@/features/auth/store/session.store';
import { useRouter } from 'expo-router';
import client, { setAccessToken, setRefreshToken } from '@/shared/api/client';
import { devMockLogin } from '@/features/login/api/login'; // CHANGED: 공용 로그인 API 래퍼 사용

const ProfileCard = (): JSX.Element => { // CHANGED: 반환 타입 명시(Strict TS)
  const { user, setUser } = useSessionStore();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/(tabs)/_my/EditProfileScreen');
  };

  const handleMockLogin = async () => {
    try {
      // CHANGED: 직접 POST 대신 래퍼 사용(응답 스키마 변화에도 안전)
      const loginRes = await devMockLogin({
        email: 'test@example.com',
        name: '테스트유저',
        socialType: 'KAKAO',
        mockSocialId: 'mock_user_001',
      });

      // CHANGED: setAccessToken이 내부에서 'Bearer ' 접두어 제거
      await setAccessToken(loginRes.accessToken ?? null);
      await setRefreshToken((loginRes as any)?.refreshToken ?? null);

      // CHANGED: /me 응답이 통합 래핑형(data.data) 또는 평문(data) 모두 대응
      const meRes = await client.get('/api/members/me');
      const me = meRes?.data?.data ?? meRes?.data;
      setUser(me);

      router.push('/(tabs)/_my/EditProfileScreen');
    } catch (err: any) {
      console.error('❌ Mock 로그인 실패:', err?.response?.data ?? err);
    }
  };

  return (
    <View className="items-center mt-6">
      <View className="items-center justify-center w-40 h-40 bg-white rounded-full shadow">
        {user?.profileImageUrl ? (
          <Image
            source={{ uri: user.profileImageUrl }}
            className="rounded-full w-30 h-30"
            resizeMode="cover"
          />
        ) : (
          <Image
            // source={require('../assets/avatar.png')}
            className="w-40 h-25"
            resizeMode="contain"
          />
        )}
      </View>

      <Text className="mt-3 text-lg font-semibold text-black">
        {user?.nickname ?? user?.name ?? '게스트'}
      </Text>

      <TouchableOpacity
        className="px-6 py-2 mt-2 bg-white rounded-full shadow-sm"
        style={{ backgroundColor: '#F7F7F7' }}
        onPress={user ? handleEditProfile : handleMockLogin}
      >
        <Text
          className="text-center"
          style={{
            fontFamily: 'Pretendard',
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 21,
            color: '#3A332A',
          }}
        >
          {user ? '내 정보 수정' : 'Mock 로그인'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileCard;

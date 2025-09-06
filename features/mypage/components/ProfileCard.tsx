import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSessionStore } from '@/features/auth/store/session.store';
import { useRouter } from 'expo-router';
import client, { setAccessToken, setRefreshToken } from '@/shared/api/client';

const ProfileCard = () => {
  const { user, setUser } = useSessionStore();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/(tabs)/_my/EditProfileScreen');
  };

  const handleMockLogin = async () => {
    try {
      const res = await client.post('/api/dev/auth/mock-login', {
        email: 'test@example.com',
        name: '테스트유저',
        socialType: 'KAKAO',
        mockSocialId: 'mock_user_001',
      });

      const { accessToken, refreshToken } = res.data.data;
      await setAccessToken(accessToken);
      await setRefreshToken(refreshToken);

      const me = await client.get('/api/members/me');
      setUser(me.data);

      router.push('/(tabs)/_my/EditProfileScreen');
    } catch (err) {
      console.error('❌ Mock 로그인 실패:', err);
    }
  };

  return (
    <View className="items-center mt-6">
      <View className="w-40 h-40 rounded-full bg-white justify-center items-center shadow">
        {user?.profileImageUrl ? (
          <Image
            source={{ uri: user.profileImageUrl }}
            className="w-30 h-30 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require('../assets/avatar.png')}
            className="w-40 h-25"
            resizeMode="contain"
          />
        )}
      </View>

      <Text className="mt-3 text-lg font-semibold text-black">
        {user?.nickname ?? user?.name ?? '게스트'}
      </Text>

      <TouchableOpacity
        className="mt-2 px-6 py-2 rounded-full bg-white shadow-sm"
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

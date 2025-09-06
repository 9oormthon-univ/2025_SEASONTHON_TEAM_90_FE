import React, { JSX, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSessionStore } from '@/features/auth/store/session.store';
import { devMockLogin, LoginResponse } from '@/features/login/api/login'; // ✅ LoginResponse import
import { useRouter } from 'expo-router';

const ProfileCard = (): JSX.Element => {
  const { user } = useSessionStore();
  const [email, setEmail] = useState('test@example.com'); // ✅ 기본 테스트용 이메일
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/(tabs)/_my/EditProfileScreen');
  };

  const handleMockLoginAndNavigate = async () => {
    try {
      // ✅ devMockLogin 호출, LoginResponse 타입 보장
      const res: LoginResponse = await devMockLogin({ email });

      if (res?.accessToken) {
        console.log('✅ Mock 로그인 성공:', res.accessToken);
        router.push('/(tabs)/_my/EditProfileScreen');
      }
    } catch (e) {
      console.error('❌ Mock 로그인 실패:', e);
    }
  };

  return (
    <View className="items-center mt-6">
      {/* 아바타 */}
      <View className="items-center justify-center w-40 h-40 bg-white rounded-full shadow">
        {user?.profileImageUrl ? (
          <Image
            source={{ uri: user.profileImageUrl }}
            className="rounded-full w-30 h-30"
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

      {/* 닉네임 */}
      <Text className="mt-3 text-lg font-semibold text-black">
        {user?.nickname ?? user?.name ?? '게스트'}
      </Text>

      {/* 로그인 / 내 정보 수정 버튼 */}
      <TouchableOpacity
        className="px-6 py-2 mt-2 bg-white rounded-full shadow-sm"
        style={{ backgroundColor: '#F7F7F7' }}
        onPress={user ? handleEditProfile : handleMockLoginAndNavigate}
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

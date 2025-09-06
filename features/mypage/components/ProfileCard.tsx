import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSessionStore } from '@/features/auth/store/session.store';
import { useRouter } from 'expo-router';
// ✅ mock 데이터 import
import { mockMyInfo } from '@/features/mypage/mock/mypage.mock';

const ProfileCard = () => {
  const { user, setUser } = useSessionStore();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/(tabs)/_my/EditProfileScreen');
  };

  // ✅ 실제 API 대신 mock 데이터로 로그인
  const handleMockLogin = async () => {
    try {
      setUser(mockMyInfo.data); // user store에 mock 데이터 저장
      router.push('/(tabs)/_my/EditProfileScreen');
    } catch (err) {
      console.error('❌ Mock 로그인 실패:', err);
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
            source={require('../assets/avatar.png')}
            className="w-40 h-25"
            resizeMode="contain"
          />
        )}
      </View>

      <Text className="mt-3 text-lg font-semibold text-black">
        {user?.memberName ?? '게스트'}
      </Text>

      <TouchableOpacity
        className="px-6 py-2 mt-2 bg-white rounded-full shadow-sm"
        style={{ backgroundColor: '#F7F7F7' }}
        onPress={user ? handleEditProfile : handleMockLogin}
      >
        <Text className="text-center text-sm text-[#3A332A]">
          {user ? '내 정보 수정' : 'Mock 로그인'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileCard;

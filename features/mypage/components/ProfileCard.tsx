import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSessionStore } from '@/features/auth/store/session.store';
import { useMockLogin } from '@/features/auth/api/useMockLogin';
import { useRouter } from 'expo-router';

const ProfileCard = () => {
  const { user } = useSessionStore();
  const { handleMockLogin } = useMockLogin();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/(tabs)/_my/EditProfileScreen'); // ✅ 여기서 이동
  };
  const handleMockLoginAndNavigate = async () => {
    const ok = await handleMockLogin();
    if (ok) {
      router.push('/(tabs)/_my/EditProfileScreen'); // ✅ 로그인 성공 후 이동
    }
  };

  return (
    <View className="items-center mt-6">
      {/* 아바타 */}
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

      {/* 닉네임 */}
      <Text className="mt-3 text-lg font-semibold text-black">
        {user?.nickname ?? '게스트'}
      </Text>

      {/* 로그인 / 내 정보 수정 버튼 */}
      <TouchableOpacity
        className="mt-2 px-6 py-2 rounded-full bg-white shadow-sm"
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
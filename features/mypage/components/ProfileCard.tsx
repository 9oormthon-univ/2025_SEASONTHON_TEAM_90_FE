import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSessionStore } from '@/features/auth/store/session.store';
import { loginWithKakao } from '@/features/auth/api/kakaoAuth';

const ProfileCard = () => {
    const { user } = useSessionStore();

    const handleLogin = async () => {
        try {
            await loginWithKakao();
        } catch (e) {
            console.error('로그인 실패', e);
        }
    };

    const handleEditProfile = () => {
        // TODO: 추후 내 정보 수정 페이지로 이동
        console.log('내 정보 수정 페이지 이동');
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
                onPress={user ? handleEditProfile : handleLogin}
            >
                <Text
                    className="text-center"
                    style={{
                        fontFamily: 'Pretendard',
                        fontWeight: '400',
                        fontSize: 14,
                        lineHeight: 21,
                        letterSpacing: 0,
                        color: '#3A332A',
                    }}
                >
                    {user ? '내 정보 수정' : '카카오 로그인'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileCard;

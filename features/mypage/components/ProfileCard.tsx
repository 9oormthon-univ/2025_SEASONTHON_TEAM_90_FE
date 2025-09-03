import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSessionStore } from '../store/session.store';
import { socialLogin, logout } from '../api/authApi';

const ProfileCard = () => {
    const { user, tokens, setUser, setTokens, clear } = useSessionStore();

    // 👉 카카오 소셜 로그인 (예: 카카오 SDK에서 받은 accessToken 사용)
    const handleLogin = async () => {
        try {
            // TODO: 카카오 SDK 연동해서 진짜 accessToken 받아오기
            const kakaoAccessToken = 'dummy-kakao-token';

            // 서버 JWT 발급
            const data = await socialLogin(kakaoAccessToken, 'KAKAO');

            // 토큰 저장
            setTokens({
                accessToken: data.accessToken,
                refreshToken: kakaoAccessToken, // 보통 refreshToken도 응답으로 내려옴 (예시)
            });

            // 유저 정보 저장 (실제는 카카오 API 호출해서 가져오는 게 안전)
            setUser({
                nickname: '단간방고양이',
                profileImageUrl: 'https://placekitten.com/200/200',
            });
        } catch (err) {
            console.error('로그인 실패:', err);
        }
    };

    // 👉 로그아웃
    const handleLogout = async () => {
        try {
            if (tokens?.accessToken) {
                await logout(tokens.accessToken);
            }
        } catch (err) {
            console.error('로그아웃 실패:', err);
        } finally {
            clear();
        }
    };

    return (
        <View className="items-center mt-6">
            {/* 아바타 */}
            <View className="w-28 h-28 rounded-full bg-white justify-center items-center shadow">
                {user?.profileImageUrl ? (
                    <Image
                        source={{ uri: user.profileImageUrl }}
                        className="w-28 h-28 rounded-full"
                        resizeMode="cover"
                    />
                ) : (
                    <Image
                        source={require('../assets/avatar.png')}
                        className="w-20 h-20"
                        resizeMode="contain"
                    />
                )}
            </View>

            {/* 닉네임 */}
            <Text className="mt-3 text-lg font-semibold text-black">
                {user?.nickname ?? '게스트'}
            </Text>

            {/* 버튼 */}
            <TouchableOpacity
                className="mt-2 px-4 py-2 rounded-full bg-white shadow"
                onPress={user ? handleLogout : handleLogin}
            >
                <Text className="text-sm text-gray-600">
                    {user ? '로그아웃' : '카카오 로그인'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileCard;

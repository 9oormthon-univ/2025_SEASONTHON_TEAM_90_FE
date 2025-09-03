import * as AuthSession from 'expo-auth-session';
import { socialLogin } from './authApi';
import { useSessionStore } from '../store/session.store';

const REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
const REDIRECT_URI = AuthSession.makeRedirectUri(); // ex: exp://127.0.0.1:19000

// 카카오 소셜 로그인 → 서버 JWT 발급
export async function loginWithKakao() {
    try {
        // 1. 카카오 OAuth 인증 (access_token 받기)
        const result = await AuthSession.startAsync({
            authUrl: `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=token`,
        });

        if (result.type !== 'success' || !result.params.access_token) {
            throw new Error('카카오 로그인 실패');
        }

        const kakaoAccessToken = result.params.access_token;

        // 2. 우리 서버에 카카오 토큰 전달 → JWT 발급
        const data = await socialLogin(kakaoAccessToken, 'KAKAO');

        // 3. Zustand에 저장
        useSessionStore.getState().setTokens({
            accessToken: data.accessToken,
            refreshToken: kakaoAccessToken, // 서버에서 refreshToken 주면 교체하세요
        });

        // 4. 카카오 사용자 정보 가져오기 (프로필/닉네임)
        const res = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${kakaoAccessToken}` },
        });
        const userData = await res.json();

        useSessionStore.getState().setUser({
            id: String(userData.id),
            nickname: userData.kakao_account?.profile?.nickname ?? '사용자',
            profileImageUrl: userData.kakao_account?.profile?.profile_image_url ?? '',
        });
    } catch (err) {
        console.error('카카오 로그인 에러:', err);
        throw err;
    }
}

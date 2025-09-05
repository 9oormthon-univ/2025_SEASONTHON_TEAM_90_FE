import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { socialLogin } from './authApi';
import { useSessionStore } from '../store/session.store';

WebBrowser.maybeCompleteAuthSession();

// 🔑 Expo config 에서 REST API 키 가져오기
const REST_API_KEY = Constants.expoConfig?.extra?.KAKAO_NATIVE_KEY as string;

// 🔗 redirectUri 설정
// - Expo Go / Web: useProxy: true → auth.expo.io 사용
// - Dev Client: scheme 사용
const redirectUri =
  Platform.select({
    web: makeRedirectUri({ useProxy: true }),
    default: makeRedirectUri({
      scheme: 'goorm90', // ⚡️ app.config.ts 의 scheme 과 동일
      path: 'redirect',
    }),
  }) ?? '';

console.log('👉 Kakao Redirect URI:', redirectUri);

const discovery = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
};

export function useKakaoLogin() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: REST_API_KEY,
      redirectUri,
      responseType: ResponseType.Token, // ⚡️ SDK first 방식에서는 Token, 서버 교환식이면 Code
    },
    discovery
  );

  const handleLogin = async () => {
    const result = await promptAsync();
    console.log('👉 Login result:', result);

    if (result.type !== 'success' || !result.params.access_token) {
      throw new Error('카카오 로그인 실패');
    }

    const kakaoAccessToken = result.params.access_token;

    // 1. 서버로 전달 → JWT 발급
    const data = await socialLogin(kakaoAccessToken, 'KAKAO');

    // 2. Zustand에 저장
    useSessionStore.getState().setTokens({
      accessToken: data.accessToken,
      refreshToken: kakaoAccessToken, // 필요시 서버에서 내려주는 refreshToken으로 교체
    });

    // 3. 카카오 사용자 정보 가져오기
    const res = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });
    const userData = await res.json();

    useSessionStore.getState().setUser({
      id: String(userData.id),
      nickname: userData.kakao_account?.profile?.nickname ?? '사용자',
      profileImageUrl: userData.kakao_account?.profile?.profile_image_url ?? '',
    });
  };

  return { request, response, handleLogin };
}

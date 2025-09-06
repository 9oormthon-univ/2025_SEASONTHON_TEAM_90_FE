  // src/features/auth/api/useKakaoLogin.ts - 백엔드에 맞게 수정
  import * as AuthSession from 'expo-auth-session';
  import axios from 'axios';

  const KAKAO_NATIVE_KEY = process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY!;
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

  export function useKakaoLogin(onSuccess?: (token: string) => void, onError?:       
  (error: string) => void) {
    async function handleLogin() {
      try {
        const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

        const discovery = {
          authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
          tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
        };

        const request = new AuthSession.AuthRequest({
          clientId: KAKAO_NATIVE_KEY,
          redirectUri,
          responseType: 'code',
        });

        const result = await request.promptAsync(discovery);
        if (result.type !== 'success' || !result.params.code) {
          throw new Error('카카오 로그인 실패 또는 취소');
        }

        // 1️⃣ 먼저 카카오에서 accessToken 받기
        const tokenRes = await axios.post('https://kauth.kakao.com/oauth/token',     
  {
          grant_type: 'authorization_code',
          client_id: KAKAO_NATIVE_KEY,
          redirect_uri: redirectUri,
          code: result.params.code,
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const kakaoAccessToken = tokenRes.data.access_token;

        // 2️⃣ 백엔드 API에 맞는 형태로 전송
        const backendRes = await
  axios.post(`${API_BASE_URL}/api/auth/social/login`, {
          socialType: 'KAKAO',
          socialAccessToken: kakaoAccessToken  // ✅ 백엔드가 기대하는 형태
        });

        const accessToken = backendRes.data?.data?.accessToken;
        console.log('✅ 카카오 로그인 성공');
        onSuccess?.(accessToken);
        return accessToken;

      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message ||
  '카카오 로그인 중 오류가 발생했습니다.';
        console.error('❌ 카카오 로그인 오류:', errorMsg);
        onError?.(errorMsg);
        throw error;
      }
    }

    return { handleLogin };
  }

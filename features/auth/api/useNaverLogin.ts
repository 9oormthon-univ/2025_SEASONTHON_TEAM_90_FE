  // src/features/auth/api/useNaverLogin.ts - 백엔드에 맞게 수정
  import * as AuthSession from 'expo-auth-session';
  import axios from 'axios';

  const NAVER_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID!;
  const NAVER_CLIENT_SECRET = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET!;
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

  export function useNaverLogin(onSuccess?: (token: string) => void, onError?:       
  (error: string) => void) {
    async function handleLogin() {
      try {
        const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

        const request = new AuthSession.AuthRequest({
          clientId: NAVER_CLIENT_ID,
          redirectUri,
          responseType: 'code',
        });

        const result = await request.promptAsync({
          authorizationEndpoint: 'https://nid.naver.com/oauth2.0/authorize',
        });

        if (result.type !== 'success' || !result.params.code) {
          throw new Error('네이버 로그인 실패 또는 취소');
        }

        // 1️⃣ 먼저 네이버에서 accessToken 받기
        const tokenRes = await axios.post('https://nid.naver.com/oauth2.0/token',    
   null, {
          params: {
            grant_type: 'authorization_code',
            client_id: NAVER_CLIENT_ID,
            client_secret: NAVER_CLIENT_SECRET,
            redirect_uri: redirectUri,
            code: result.params.code,
          },
        });

        const naverAccessToken = tokenRes.data.access_token;

        // 2️⃣ 백엔드 API에 맞는 형태로 전송
        const backendRes = await
  axios.post(`${API_BASE_URL}/api/auth/social/login`, {
          socialType: 'NAVER',
          socialAccessToken: naverAccessToken  // ✅ 백엔드가 기대하는 형태
        });

        const accessToken = backendRes.data?.data?.accessToken;
        console.log('✅ 네이버 로그인 성공');
        onSuccess?.(accessToken);
        return accessToken;

      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message ||
  '네이버 로그인 중 오류가 발생했습니다.';
        console.error('❌ 네이버 로그인 오류:', errorMsg);
        onError?.(errorMsg);
        throw error;
      }
    }

    return { handleLogin };
  }

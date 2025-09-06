// src/features/auth/api/useGoogleLogin.ts
import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

// ✅ 세션 완료 처리 (필수)
WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin(onSuccess?: (token: string) => void, onError?: (err: string) => void) {
  // ✅ redirectUri 생성 (Expo Go 환경에서 proxy 사용)
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });
  console.log("🔗 Redirect URI:", redirectUri);

  // ✅ 구글 로그인 요청 훅
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  React.useEffect(() => {
    const doLogin = async () => {
      if (response?.type === "success" && response.authentication?.accessToken) {
        const googleAccessToken = response.authentication.accessToken;
        console.log("✅ 구글 accessToken 받음:", googleAccessToken);

        try {
          // 👉 백엔드에 전달
          const backendRes = await axios.post(`${API_BASE_URL}/api/auth/social/login`, {
            socialType: "GOOGLE",
            socialAccessToken: googleAccessToken,
          });

          const accessToken = backendRes.data?.data?.accessToken;
          console.log("✅ 백엔드 JWT 토큰 받음:", accessToken);

          onSuccess?.(accessToken);
        } catch (err: any) {
          console.error("❌ 백엔드 로그인 실패:", err.response?.data || err.message);
          onError?.("백엔드 로그인 실패");
        }
      } else if (response?.type === "error") {
        console.error("❌ 구글 로그인 오류:", response.error);
        onError?.("구글 로그인 오류");
      }
    };

    doLogin();
  }, [response]);

  return { request, promptAsync };
}

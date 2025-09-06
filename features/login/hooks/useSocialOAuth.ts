// features/login/hooks/useSocialOAuth.ts
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import axios from "axios";

WebBrowser.maybeCompleteAuthSession();

type Provider = "GOOGLE" | "KAKAO" | "NAVER";
type OAuthResult =
  | { provider: Provider; type: "token"; accessToken: string }
  | { provider: "KAKAO"; type: "code"; authorizationCode: string };

const extra = Constants.expoConfig?.extra as any;

// 앱 딥링크(앱 복귀용)
const appRedirectUri = AuthSession.makeRedirectUri({ scheme: "goorm90", path: "redirect" });
// 카카오 콘솔에 등록된 Redirect URI (서버 콜백 혹은 웹 페이지)
const kakaoRedirectUri: string = extra.kakaoRedirectUri;

const getFragment = (url: string, key: string) => {
  const hash = url.split("#")[1] ?? "";
  const params = new URLSearchParams(hash);
  return params.get(key) ?? undefined;
};
const getQueryParam = (url: string, key: string) => {
  const q = url.split("?")[1] ?? "";
  const params = new URLSearchParams(q);
  return params.get(key) ?? undefined;
};

const getAuthUrl = (provider: Provider, redirectUri: string) => {
  switch (provider) {
    case "GOOGLE": {
      const params = new URLSearchParams({
        client_id: extra.googleClientId,
        redirect_uri: redirectUri,
        response_type: "token",
        scope: "openid profile email",
        include_granted_scopes: "true",
        prompt: "consent",
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    case "KAKAO": {
      const params = new URLSearchParams({
        client_id: extra.kakaoRestApiKey,
        redirect_uri: kakaoRedirectUri, // 콘솔 등록값과 일치
        response_type: "code",
      });
      return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    }
    case "NAVER": {
      const state = Math.random().toString(36).slice(2);
      const params = new URLSearchParams({
        client_id: extra.naverClientId,
        redirect_uri: redirectUri,
        response_type: "token",
        state,
      });
      return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    }
  }
};

// Kakao 코드 → access_token
async function exchangeKakaoCodeForAccessToken(authorizationCode: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: extra.kakaoRestApiKey,
    redirect_uri: kakaoRedirectUri,
    code: authorizationCode,
  });
  if (extra.kakaoClientSecret) params.append("client_secret", String(extra.kakaoClientSecret));

  const { data } = await axios.post("https://kauth.kakao.com/oauth/token", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 12000,
  });
  if (!data?.access_token) throw new Error("Kakao token exchange failed");
  return data.access_token as string;
}

// (옵션) 카카오 access_token 검증
async function debugKakaoToken(accessToken: string) {
  try {
    const res = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 8000,
    });
    console.log("[DEBUG] Kakao user ok:", res.data?.id);
  } catch (e: any) {
    console.warn("[DEBUG] Kakao token invalid:", e?.response?.status, e?.response?.data);
  }
}

async function authorize(provider: Provider): Promise<OAuthResult> {
  // Kakao는 서버 콜백으로 code를 받음
  const redirectUri = provider === "KAKAO" ? kakaoRedirectUri : appRedirectUri;
  const authUrl = getAuthUrl(provider, redirectUri);

  // returnUrl도 Kakao는 콜백으로 닫히게 맞춤(서버 콜백에서 앱 딥링크로 302 권장)
  const returnUrl = provider === "KAKAO" ? kakaoRedirectUri : appRedirectUri;

  const res = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
  if (res.type !== "success" || !res.url) {
    throw new Error(res.type === "cancel" ? "Login canceled" : "Login failed");
  }

  if (provider === "KAKAO") {
    const code = getQueryParam(res.url, "code");
    const error = getQueryParam(res.url, "error");
    if (error) throw new Error(error);
    if (!code) throw new Error("No authorization code returned");
    return { provider: "KAKAO", type: "code", authorizationCode: code };
  }

  const accessToken = getFragment(res.url, "access_token");
  const error = getFragment(res.url, "error");
  if (error) throw new Error(error);
  if (!accessToken) throw new Error("No access token returned");
  return { provider, type: "token", accessToken };
}

export default function useSocialOAuth() {
  return { authorize, exchangeKakaoCodeForAccessToken, debugKakaoToken };
}

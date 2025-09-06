// features/login/api/auth.ts
import { api } from "@features/login/api/client";
import CookieManager from "@react-native-cookies/cookies";
import { saveTokens, clearTokens, setAccessTokenCached, loadTokens } from "@/features/login/token.store";
import type { LoginResponse, CommonResponse, MemberMe } from "@/features/login/utils/auth";
import Constants from "expo-constants";
import { persistSetCookieSafely } from "@/features/login/persistSetCookieSafely";

const rawBaseURL = (Constants.expoConfig?.extra?.apiBaseUrl as string).replace(/\/+$/, "");
const ORIGIN = (() => {
  try {
    return new URL(rawBaseURL).origin;
  } catch {
    return rawBaseURL;
  }
})();

const ensureBearer = (t?: string | null) =>
  !t ? null : t.startsWith("Bearer ") ? t : `Bearer ${t}`;

async function reflectSetCookie(headers?: any) {
  if (!headers) return;
  try {
    const setCookies =
      headers?.["set-cookie"] ?? headers?.["Set-Cookie"] ?? headers?.setCookie ?? null;

    if (setCookies) {
      const raw = Array.isArray(setCookies) ? setCookies.join(",") : String(setCookies);
      await CookieManager.setFromResponse(ORIGIN, raw);
    } else {
      await persistSetCookieSafely(ORIGIN, headers);
    }
  } catch (e) {
    console.warn("[Auth] reflectSetCookie error", e);
  }
}

export async function socialLogin(params: {
  socialAccessToken: string;
  socialType: "GOOGLE" | "KAKAO" | "NAVER";
}) {
  console.log("[Auth] socialLogin payload =", {
    ...params,
    socialAccessToken: params.socialAccessToken?.slice(0, 10) + "...",
  });

  const res = await api.post<CommonResponse<LoginResponse>>("/api/auth/social/login", params, {
    timeout: 12000,
  });

  console.log("[Auth] socialLogin http status =", res.status);
  console.log("[Auth] socialLogin body keys =", Object.keys(res.data?.data || {}));

  const access = ensureBearer(res.data.data?.accessToken);
  if (!access) console.warn("[Auth] socialLogin: NO accessToken in body!");
  else console.log("[Auth] socialLogin: access len =", access.length);

  // Access 즉시 주입/저장
  api.defaults.headers.Authorization = access || "";
  await saveTokens({ access: access ?? null });
  setAccessTokenCached(access ?? null);

  // Set-Cookie 반영
  await reflectSetCookie(res.headers);

  // 🔹 추가: 리프레시 토큰 로컬 저장
  const refreshUrl = `${rawBaseURL}/api/auth/token/refresh`;
  const saved = await CookieManager.get(refreshUrl).catch(async () => CookieManager.get(ORIGIN));
  const refreshToken = saved?.refresh?.value;
  
  if (refreshToken) {
    await saveTokens({ refresh: refreshToken });
    console.log("[Auth] Refresh token saved to local storage");
  } else {
    console.warn("[Auth] No refresh token found in cookies after login");
  }
  
  // 토큰 저장 상태 확인 로그
  const tokens = await loadTokens();
  console.log("[Auth] Token storage status after login:", {
    hasAccessToken: !!tokens.access,
    hasRefreshToken: !!tokens.refresh,
    hasCookieRefresh: !!refreshToken
  });
  
  console.log("[Auth] cookie refresh present:", !!saved?.refresh?.value);

  return res.data.data;
}

export async function refreshTokens() {
  try {
    const res = await api.post<CommonResponse<LoginResponse>>(
      "/api/auth/token/refresh",
      {},
      { timeout: 10000 },
    );
    const newAccess = ensureBearer(res?.data?.data?.accessToken ?? null);
    if (newAccess) {
      await saveTokens({ access: newAccess });
      setAccessTokenCached(newAccess);
    }
    await reflectSetCookie(res.headers);

    // 🔹 추가: 새 리프레시 토큰 로컬 저장
    const refreshUrl = `${rawBaseURL}/api/auth/token/refresh`;
    const saved = await CookieManager.get(refreshUrl).catch(async () => CookieManager.get(ORIGIN));
    const newRefreshToken = saved?.refresh?.value;
    
    if (newRefreshToken) {
      await saveTokens({ refresh: newRefreshToken });
      console.log("[Auth] New refresh token saved after renewal");
    }
    
    console.log("[Auth] cookie refresh present (after refresh):", !!saved?.refresh?.value);

    return res.data.data;
  } catch (e) {
    console.warn("[Auth] refreshTokens error", e);
    throw e;
  }
}

export async function logout() {
  try {
    await api.post<CommonResponse<null>>("/api/auth/logout", {}, { timeout: 8000 });
  } finally {
    await clearTokens();
    setAccessTokenCached(null);
    try {
      await CookieManager.clearAll(true);
      console.log("[Auth] cleared all cookies");
    } catch {}
  }
}

export async function getMe() {
  const { data } = await api.get<CommonResponse<MemberMe>>("/api/members/me", { timeout: 10000 });
  return data.data;
}

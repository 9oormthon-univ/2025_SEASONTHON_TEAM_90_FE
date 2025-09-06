// utils/api/client.ts
import axios from "axios";
import Constants from "expo-constants";
import CookieManager from "@react-native-cookies/cookies";
import {
  bootstrapTokens,
  loadTokens,
  saveTokens,
  clearTokens,
  getAccessTokenCached,
  setAccessTokenCached,
} from "@/features/login/token.store";
import { persistSetCookieSafely } from "@features/login/persistSetCookieSafely";

const baseURL = (Constants.expoConfig?.extra?.apiBaseUrl as string).replace(/\/+$/, "");
export const api = axios.create({
  baseURL,
  withCredentials: true, // RN에선 자동 쿠키전송 안 되지만 true 유지
  headers: { "Content-Type": "application/json" },
  timeout: 12000,
});

const ensureBearer = (t?: string | null) =>
  !t ? null : t.startsWith("Bearer ") ? t : `Bearer ${t}`;

const ORIGIN = (() => {
  try {
    return new URL(baseURL).origin; // https://habiglow.duckdns.org
  } catch {
    return baseURL;
  }
})();

// 🔹 추가: 세션 만료 처리 함수
async function handleSessionExpired() {
  try {
    // 로그인 페이지로 리디렉션 또는 모달 표시
    // 구체적 구현은 앱의 네비게이션 구조에 따라 결정
    console.log("[Auth] Session expired, redirecting to login");
  } catch (e) {
    console.warn("[Auth] Failed to handle session expiration:", e);
  }
}

// ── 디버그 로그
const hostOf = (url = "") => {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
};

const logReq = (cfg: any) => {
  const path = `${cfg?.method?.toUpperCase?.() || ""} ${cfg?.url || ""}`;
  const authShort = cfg?.headers?.Authorization
    ? String(cfg.headers.Authorization).slice(0, 20) + "..."
    : "";
  console.log("[HTTP] →", path, {
    baseURL: api.defaults.baseURL,
    host: hostOf(api.defaults.baseURL),
    hasAuth: !!cfg?.headers?.Authorization,
    authHead: authShort,
    cookie: cfg?.headers?.Cookie ? "(Cookie attached)" : "-",
  });
};

const logRes = (res: any) => {
  const path = `${res?.config?.method?.toUpperCase?.() || ""} ${res?.config?.url || ""}`;
  console.log("[HTTP] ←", path, res?.status);
};

const logErr = (err: any) => {
  const cfg = err?.config;
  const path = `${cfg?.method?.toUpperCase?.() || ""} ${cfg?.url || ""}`;
  console.warn("[HTTP] !", path, err?.response?.status, err?.response?.data || err?.message);
};

// ── Authorization + Cookie 수동 주입
void bootstrapTokens();
api.interceptors.request.use(async (config) => {
  // 1) AccessToken
  let at = getAccessTokenCached();
  if (!at) {
    const { access } = await loadTokens();
    at = access ?? null;
  }
  if (at) config.headers.Authorization = at;

  // 2) ★ 요청 URL 기준으로 쿠키 수동 부착 (Path 매칭)
  const base = api.defaults.baseURL?.replace(/\/+$/, "") || "";
  const path = (config.url || "").replace(/^\/+/, "");
  const fullUrl = `${base}/${path}`;
  try {
    const map = await CookieManager.get(fullUrl);
    if (map && Object.keys(map).length > 0) {
      const cookieHeader = Object.entries(map)
        .map(([k, v]: any) => `${k}=${v?.value ?? ""}`)
        .join("; ");
      if (cookieHeader) config.headers.Cookie = cookieHeader;
    }
  } catch {}

  logReq(config);
  return config;
});

// ── 응답 가로채기: Set-Cookie 반영 + 401 RTR
let refreshing = false;
let waiters: Array<() => void> = [];
const notifyAll = () => {
  waiters.forEach((w) => w());
  waiters = [];
};

api.interceptors.response.use(
  async (res) => {
    // 응답의 Set-Cookie를 RN 쿠키저장소에 안전하게 반영
    try {
      // 우선 네이티브 헤더 직접 접근 시도 (플랫폼별 헤더 키 차이 대응)
      const setCookies =
        res?.headers?.["set-cookie"] ??
        res?.headers?.["Set-Cookie"] ??
        res?.request?.responseHeaders?.["Set-Cookie"] ??
        res?.request?.responseHeaders?.["set-cookie"] ??
        null;

      if (setCookies) {
        const raw = Array.isArray(setCookies) ? setCookies.join(",") : String(setCookies);
        await CookieManager.setFromResponse(ORIGIN, raw);
      } else {
        await persistSetCookieSafely(ORIGIN, res.headers);
      }
    } catch {}

    logRes(res);
    return res;
  },
  async (error) => {
    logErr(error);
    const original = error.config as typeof error.config & { _retry?: boolean };

    // 401 → refresh 쿠키로 재발급 시도
    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (refreshing) {
        await new Promise<void>((resolve) => waiters.push(resolve));
        return api(original);
      }

      try {
        refreshing = true;

        // RN 쿠키 저장소에서 refresh 읽기 (엔드포인트 Path 고려)
        const refreshUrl = `${baseURL}/api/auth/token/refresh`;
        const cookieMap = await CookieManager.get(refreshUrl).catch(async () => {
          // fallback: ORIGIN 기준
          return CookieManager.get(ORIGIN);
        });
        const refreshCookie = cookieMap?.refresh?.value ?? null;

        const { refresh: storedRefresh, access } = await loadTokens(); // access 유지
        
        // 🔹 우선순위 로직: 쿠키 > 로컬 저장소
        const refresh = refreshCookie || storedRefresh;
        if (!refresh) {
          console.warn("[Auth] No refresh token available:", {
            cookieRefresh: !!refreshCookie,
            storedRefresh: !!storedRefresh
          });
          await clearTokens();
          // 🔹 추가: 사용자 세션 만료 처리
          await handleSessionExpired();
          throw error;
        }

        console.log("[Auth] Using refresh token from:", refreshCookie ? "cookie" : "local storage");

        // 재발급 요청(쿠키를 헤더로 수동 첨부)
        const res = await axios.post(
          `${baseURL}/api/auth/token/refresh`,
          {},
          {
            headers: { Cookie: `refresh=${refresh}` },
            withCredentials: true,
            timeout: 10000,
          },
        );

        // Access 교체
        const newAccess = ensureBearer(res?.data?.data?.accessToken ?? null);
        await saveTokens({ access: newAccess ?? access ?? null });
        setAccessTokenCached(newAccess ?? null);

        // Set-Cookie 반영
        try {
          const setCookies =
            res?.headers?.["set-cookie"] ??
            res?.headers?.["Set-Cookie"] ??
            res?.request?.responseHeaders?.["Set-Cookie"] ??
            res?.request?.responseHeaders?.["set-cookie"] ??
            null;

          if (setCookies) {
            const raw = Array.isArray(setCookies) ? setCookies.join(",") : String(setCookies);
            await CookieManager.setFromResponse(ORIGIN, raw);
          } else {
            await persistSetCookieSafely(ORIGIN, res.headers);
          }
        } catch {}

        // 🔹 추가: 새 리프레시 토큰 로컬 저장
        const newRefreshMap = await CookieManager.get(refreshUrl).catch(async () => CookieManager.get(ORIGIN));
        const newRefreshToken = newRefreshMap?.refresh?.value;
        if (newRefreshToken) {
          await saveTokens({ refresh: newRefreshToken });
          console.log("[Auth] New refresh token saved after renewal");
        }

        notifyAll();
        return api(original);
      } catch (refreshError) {
        // 🔹 추가: 리프레시 토큰마저 만료된 경우 처리
        console.error("[Auth] Token refresh failed:", refreshError);
        await clearTokens();
        await handleSessionExpired();
        notifyAll();
        throw refreshError;
      } finally {
        refreshing = false;
      }
    }

    throw error;
  },
);

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
} from "@features/login/token.store";

const baseURL = Constants.expoConfig?.extra?.apiBaseUrl as string;
// 예: "http://192.168.0.2:8080"  ← 에뮬레이터/실기기에서 닿을 수 있는 주소여야 함 (localhost 금지)

export const api = axios.create({
  baseURL,
  // RN에선 withCredentials가 쿠키를 자동으로 동작시키지 않음(브라우저 전용). 그래도 true 유지.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});

const ensureBearer = (t?: string | null) =>
  !t ? null : t.startsWith("Bearer ") ? t : `Bearer ${t}`;

// 앱 시작 시 캐시 예열(비동기)
void bootstrapTokens();

// ====== Debug 로깅 보조 ======
const logReq = (cfg: any) => {
  const path = `${cfg?.method?.toUpperCase?.() || ""} ${cfg?.url || ""}`;
  console.log("[HTTP] →", path, {
    hasAuth: !!cfg?.headers?.Authorization,
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

// ====== Request: Authorization 주입 ======
api.interceptors.request.use(async (config) => {
  let at = getAccessTokenCached();
  if (!at) {
    const { access } = await loadTokens();
    at = access ?? null;
  }
  if (at) config.headers.Authorization = at;

  logReq(config);
  return config;
});

// ===== Refresh Queue =====
let refreshing = false;
let waiters: Array<() => void> = [];
const notifyAll = () => {
  waiters.forEach((w) => w());
  waiters = [];
};

// ====== Response/401 처리 + RTR ======
api.interceptors.response.use(
  (res) => {
    logRes(res);
    return res;
  },
  async (error) => {
    logErr(error);
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (refreshing) {
        await new Promise<void>((resolve) => waiters.push(resolve));
        return api(original);
      }

      try {
        refreshing = true;

        // 1) refresh 쿠키를 쿠키매니저에서 읽기
        const cookieMap = await CookieManager.get(baseURL);
        const refreshCookie = cookieMap?.refresh?.value ?? null;

        // 2) SecureStore 백업(혹시 서버가 body로 준 적이 있다면)
        const { refresh: storedRefresh } = await loadTokens();
        const refresh = refreshCookie || storedRefresh;

        if (!refresh) {
          console.warn("[Auth] no refresh token (cookie+store both empty)");
          await clearTokens();
          throw error;
        }

        // 3) 서버는 쿠키를 기대하므로, 직접 Cookie 헤더로 동봉
        const { data } = await axios.post(
          `${baseURL}/api/auth/token/refresh`,
          {},
          {
            headers: {
              // HttpOnly라 JS에서 못 읽는 게 원칙이지만 RN CookieManager는 접근 가능.
              // 서버에서 Domain/Path가 baseURL과 맞아야 함.
              Cookie: `refresh=${refresh}`,
            },
            withCredentials: true,
            timeout: 8000,
          },
        );

        const newAccess = ensureBearer(data?.data?.accessToken ?? null);

        // 서버 정책상 refresh는 쿠키로만 전달될 수 있음 → 쿠키매니저에 위임
        // 혹시 data.data.refreshToken을 주면 저장
        const newRefreshFromBody = data?.data?.refreshToken ?? null;

        await saveTokens({
          access: newAccess ?? null,
          refresh: newRefreshFromBody ?? storedRefresh ?? null,
        });
        setAccessTokenCached(newAccess ?? null);

        notifyAll();
        return api(original);
      } catch (e) {
        await clearTokens();
        notifyAll();
        throw e;
      } finally {
        refreshing = false;
      }
    }

    throw error;
  },
);

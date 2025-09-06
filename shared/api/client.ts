import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosRequestConfig } from 'axios';

const fallbackBase = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? fallbackBase;

let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (handler: () => void) => {
  onUnauthorized = handler;
};

let memAccess: string | null = null;
let memRefresh: string | null = null;

// Access Token
export const getAccessToken = async () => {
  if (memAccess) return memAccess;
  const t = await AsyncStorage.getItem('accessToken');
  memAccess = t;
  return t;
};

// 엑세스 토큰 설정
export const setAccessToken = async (token: string | null) => {
  const pure =
    token && token.startsWith('Bearer ') ? token.slice(7) : token;
  memAccess = pure ?? null;
  if (pure) await AsyncStorage.setItem('accessToken', pure);
  else await AsyncStorage.removeItem('accessToken');
};

// Refresh Token
export const getRefreshToken = async () => {
  if (memRefresh) return memRefresh;
  const t = await AsyncStorage.getItem('refreshToken');
  memRefresh = t;
  return t;
};

export const setRefreshToken = async (token: string | null) => {
  memRefresh = token;
  if (token) await AsyncStorage.setItem('refreshToken', token);
  else await AsyncStorage.removeItem('refreshToken');
};

// Axios 인스턴스
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': `rn-${Platform.OS}`,
  },
  withCredentials: true,
});

// 요청 인터셉터: 항상 Bearer 붙이기
client.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    console.log('➡️ Authorization', (config.headers as any).Authorization);
  }
  return config;
});

// 응답 인터셉터: 401 → Refresh 로직
let isRefreshing = false;
let queue: ((token: string | null) => void)[] = [];

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest: RetryableConfig = error?.config ?? {};
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            if (token) {
              originalRequest.headers = originalRequest.headers ?? {}; // CHANGED
              (originalRequest.headers as any).Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            } else {
              resolve(Promise.reject(error));
            }
          });
        });
      }

      originalRequest._retry = true; // CHANGED
      isRefreshing = true;

      try {
        const rt = await getRefreshToken();
        const refreshRes = await axios.post(
          `${API_BASE_URL}/api/auth/token/refresh`,
          {},
          { withCredentials: true }
        );

        let { accessToken, refreshToken } = refreshRes.data ?? {};

        await setAccessToken(accessToken ?? null); // 내부에서 Bearer 제거
        await setRefreshToken(refreshToken ?? null);

        const newAccess = await getAccessToken();

        queue.forEach((cb) => cb(newAccess ?? null));
        queue = [];

        originalRequest.headers = originalRequest.headers ?? {}; // CHANGED
        if (newAccess) {
          (originalRequest.headers as any).Authorization = `Bearer ${newAccess}`;
          return client(originalRequest);
        } else {
          throw new Error('No access token after refresh');
        }
      } catch (err) {
        await setAccessToken(null);
        await setRefreshToken(null);
        onUnauthorized?.();
        queue.forEach((cb) => cb(null));
        queue = [];
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
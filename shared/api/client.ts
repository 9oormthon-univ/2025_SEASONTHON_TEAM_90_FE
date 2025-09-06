import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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

export const setAccessToken = async (token: string | null) => {
  memAccess = token;
  if (token) await AsyncStorage.setItem('accessToken', token);
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
});

// 요청 인터셉터: 항상 Bearer 붙이기
client.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    console.log('➡️ 요청 Authorization 헤더:', (config.headers as any).Authorization);
  }
  return config;
});

// 응답 인터셉터: 401 → Refresh 로직
let isRefreshing = false;
let queue: ((token: string | null) => void)[] = [];

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(client(originalRequest));
            } else {
              resolve(Promise.reject(error));
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {});
        let { accessToken, refreshToken } = res.data;

        // Bearer 접두어 제거
        const pureAccess = accessToken?.startsWith('Bearer ')
          ? accessToken.replace('Bearer ', '')
          : accessToken;

        await setAccessToken(pureAccess);
        await setRefreshToken(refreshToken);

        queue.forEach((cb) => cb(pureAccess));
        queue = [];

        originalRequest.headers['Authorization'] = `Bearer ${pureAccess}`;
        return client(originalRequest);
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
// 공용 Axios 클라이언트
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


/**
* 환경설정: EXPO_PUBLIC_API_BASE_URL 사용
*/
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';


/**
* 외부에서 주입 가능한 401 처리기 (예: 세션스토어 logout + 토스트)
*/
let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (handler: () => void) => {
    onUnauthorized = handler;
};


/**
* 액세스 토큰 헬퍼: 메모리 캐시 + AsyncStorage 동기화
*/
let memToken: string | null = null;

/** 엑세스 토큰 가져오기 함수(header 설정) */
export const getAccessToken = async () => {
    if (memToken) return memToken;
    const t = await AsyncStorage.getItem('accessToken');
    memToken = t;
    return t;
};

/** 엑세스 토큰 set 설정 */
export const setAccessToken = async (token: string | null) => {
    memToken = token;
    if (token) await AsyncStorage.setItem('accessToken', token);
    else await AsyncStorage.removeItem('accessToken');
};

/** API 호출 포맷 정의(사용자 OS에 따른 헤더 설정) */
const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15_000,
    headers: {
        'Content-Type': 'application/json',
        'X-Client': `rn-${Platform.OS}`,
    },
});


// req: 토큰 주입
client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});


// res: 401 공통 처리
client.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error?.response?.status as number | undefined;
        if (status === 401) {
            // 서버에서 401이면 토큰 파기 및 콜백 알림
            await setAccessToken(null);
            onUnauthorized?.();
        }
        return Promise.reject(error);
    }
);


export default client;
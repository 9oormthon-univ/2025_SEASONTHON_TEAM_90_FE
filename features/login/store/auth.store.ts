import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '@/shared/api/client';

export type Tokens = {
    accessToken: string | null;
    // 필요 시 refreshToken 등 확장 가능
};

type AuthState = Tokens & {
    isLoggedIn: () => boolean;
    setTokens: (t: Tokens) => void;
    clear: () => void;
    refreshAccessToken: () => Promise<string | null>;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            isLoggedIn: () => Boolean(get().accessToken),
            setTokens: (t) => set({ ...t }),
            clear: () => set({ accessToken: null }),
            /**
             * 서버 스펙: POST /api/auth/token/refresh
             * 반환 예시:
             * {
             *   "accessToken":"Bearer eyJhbGciOi...","tokenType":"Bearer","expiresIn":3600,"refreshTokenIncluded":true
             * }
             */
            refreshAccessToken: async () => {
                try {
                    const res = await client.post('/api/auth/token/refresh');
                    // accessToken이 "Bearer xxx" 형태일 수도, 생 토큰일 수도 있으니 그대로 저장
                    const token: string | undefined =
                        (res.data?.accessToken as string | undefined) ??
                        (res.headers?.authorization as string | undefined);
                    if (!token) return null;
                    set({ accessToken: token });
                    return token;
                } catch {
                    return null;
                }
            },
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ accessToken: s.accessToken }),
            version: 1,
        }
    )
);

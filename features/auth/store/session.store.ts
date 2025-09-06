import { create } from 'zustand';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id?: string;
  nickname?: string;
  name?: string;
  profileImageUrl?: string;
  interests?: string[];
}

interface SessionState {
  user: User | null;
  tokens: Tokens | null;
  setUser: (user: User) => void;
  setTokens: (tokens: Tokens) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  tokens: null,
  setUser: (user) => set({ user }),
  setTokens: (tokens) => set({ tokens }),
  clear: () => {
    // ✅ 메모리 초기화
    set({ user: null, tokens: null });

    // ✅ 로컬 스토리지 초기화 (zustand-persist 안 쓴 경우)
    try {
      localStorage.removeItem('session');
    } catch {
      // RN 환경에서는 AsyncStorage 사용
    }
  },
}));

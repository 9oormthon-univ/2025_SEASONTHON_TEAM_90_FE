import { create } from 'zustand';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id?: string;
  nickname?: string;
  profileImageUrl?: string;
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
  clear: () => set({ user: null, tokens: null }),
}));

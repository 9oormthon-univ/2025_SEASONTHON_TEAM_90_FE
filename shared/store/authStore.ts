import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 스토어 상태 및 액션에 대한 타입 정의
interface AuthState {
    memberId: number | null;
    actions: {
        setMemberId: (id: number) => void;
        clearAuth: () => void;
    };
}

/**
 * 로그인한 사용자의 ID를 저장하고 관리하는 전역 스토어
 * Zustand의 persist middleware를 사용하여 AsyncStorage에 상태를 자동 저장
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            memberId: null,
            actions: {
                setMemberId: (id) => set({ memberId: id }),
                clearAuth: () => set({ memberId: null }),
            },
        }),
        {
            name: "auth-storage", // AsyncStorage에 저장될 때 사용될 키(key)
            storage: createJSONStorage(() => AsyncStorage),
            // actions는 저장하지 않고 상태(memberId)만 저장하도록 설정
            partialize: (state) => ({ memberId: state.memberId }),
        },
    ),
);
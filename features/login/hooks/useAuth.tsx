// features/login/context/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { socialLogin, logout as apiLogout, getMe, refreshTokens } from "@/features/login/api/auth";
import type { MemberMe } from "@/features/login/utils/auth";
import useSocialOAuth from "@/features/login/hooks/useSocialOAuth";
import { bootstrapTokens } from "@/features/login/token.store";

type AuthContextType = {
  me: MemberMe | null;
  loading: boolean;
  login: (p: "GOOGLE" | "KAKAO" | "NAVER") => Promise<void>;
  logout: () => Promise<void>;
  reloadMe: () => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<MemberMe, "memberName" | "profileImageUrl">> & { interests?: string[] },
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { authorize, exchangeKakaoCodeForAccessToken /*, debugKakaoToken*/ } = useSocialOAuth();
  const [me, setMe] = useState<MemberMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthProvider] me changed ->", me);
  }, [me]);

  const reloadMe = async () => {
    try {
      console.log("[AuthProvider] reloadMe: start");
      const data = await withTimeout(getMe(), 7000).catch(async () => {
        console.warn("[AuthProvider] getMe timeout/401 → refreshTokens 시도");
        await withTimeout(refreshTokens(), 7000).catch((e) => {
          console.warn("[AuthProvider] refreshTokens 실패/timeout", e);
          return null;
        });
        try {
          return await withTimeout(getMe(), 7000);
        } catch (e2) {
          console.warn("[AuthProvider] getMe 재시도 실패/timeout", e2);
          return null;
        }
      });
      setMe(data ?? null);
      console.log("[AuthProvider] reloadMe: done. me =", data);
    } catch (e) {
      console.warn("[AuthProvider] reloadMe: error", e);
      setMe(null);
    }
  };

  const login = async (provider: "GOOGLE" | "KAKAO" | "NAVER") => {
    setLoading(true);
    try {
      console.log("[AuthProvider] login start:", provider);
      const result = await authorize(provider);
      console.log("[AuthProvider] authorize result =", result);

      if (provider === "KAKAO" && result.type === "code") {
        const kakaoAccess = await exchangeKakaoCodeForAccessToken(result.authorizationCode);

        // 필요하면 한 번 검증
        // await debugKakaoToken(kakaoAccess);

        await socialLogin({ socialAccessToken: kakaoAccess, socialType: "KAKAO" });
        console.log("[AuthProvider] socialLogin(KAKAO token) done");
      } else if (result.type === "token") {
        await socialLogin({ socialAccessToken: result.accessToken, socialType: provider });
        console.log("[AuthProvider] socialLogin(token) done");
      } else {
        throw new Error("Unsupported auth result");
      }

      await reloadMe();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || String(e);
      console.warn("[AuthProvider] login error:", msg);
    } finally {
      setLoading(false);
      console.log("[AuthProvider] login end");
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log("[AuthProvider] logout start");
      await apiLogout();
      setMe(null);
      console.log("[AuthProvider] logout done");
    } catch (e) {
      console.warn("[AuthProvider] logout error", e);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    patch: Partial<Pick<MemberMe, "memberName" | "profileImageUrl">> & { interests?: string[] },
  ) => {
    console.log("[AuthProvider] updateProfile patch =", patch);
    await reloadMe();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log("[AuthProvider] initial load start");
        await bootstrapTokens(); // Access 캐시 예열
        await reloadMe();
      } finally {
        if (mounted) {
          setLoading(false);
          console.log("[AuthProvider] initial load end");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ me, loading, login, logout, reloadMe, updateProfile }),
    [me, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

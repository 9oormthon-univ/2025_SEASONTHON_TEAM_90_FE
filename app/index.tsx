// app/index.tsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/login/store/auth.store";

/** 진입점: 로그인 여부로 분기 */
export default function Index() {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);

  // persist 복구 여부 체크 (깜빡임 방지) [mod]
  const [hydrated, setHydrated] = useState<boolean>(
    useAuthStore.persist?.hasHydrated?.() ?? true
  );
  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setHydrated(true));
    if (!hydrated && useAuthStore.persist?.hasHydrated?.()) setHydrated(true);
    return () => unsub?.();
  }, [hydrated]);

  if (!hydrated) return null; // 스플래시 유지

  // 로그인 시 탭 루트, 아니면 로그인 페이지
  return (
    <Redirect
      href={isLoggedIn ? "/(tabs)/home" : "/(tabs)/login"}
    />
  );
}

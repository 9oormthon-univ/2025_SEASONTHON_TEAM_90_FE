import { useEffect } from "react";
import { useAuth } from "@/features/login/hooks/useAuth";
import { useRoutineStore } from "../store/store";

export const useRoutines = () => {
  const { me, loading: authLoading } = useAuth();
  const { routines, loading, error, load, create, toggleComplete } = useRoutineStore();

  useEffect(() => {
    // ✅ 로그인 확인 전/미로그인 상태에선 호출 금지
    if (authLoading || !me) return;
    if (!routines.length) void load();
  }, [authLoading, me, routines.length, load]);

  return { routines, loading, error, create, toggleComplete, reload: load };
};

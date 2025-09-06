// features/routine/hooks/useRoutines.ts
import { useEffect } from "react";
import { useRoutineStore } from "../store/store";

// 최초 1회만 load, 빈 배열 재렌더에도 중복 호출 방지
export const useRoutines = () => {
  const routines = useRoutineStore((s) => s.routines);
  const loading = useRoutineStore((s) => s.loading);
  const error = useRoutineStore((s) => s.error);
  const load = useRoutineStore((s) => s.load);
  const create = useRoutineStore((s) => s.create);
  const toggleComplete = useRoutineStore((s) => s.toggleComplete);

  useEffect(() => {
    // 이미 로딩 중이거나 한 번이라도 로딩이 끝났으면 스킵
    if (!loading && routines.length === 0) {
      void load();
    }
  }, [loading, routines.length, load]);

  return { routines, loading, error, create, toggleComplete, reload: load };
};

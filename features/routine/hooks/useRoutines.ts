import { useEffect } from "react";
import { useRoutineStore } from "../store/store";

export const useRoutines = () => {
  const { routines, loading, error, load, create, toggleComplete } = useRoutineStore();

  useEffect(() => {
    if (!routines.length) void load();
  }, [routines.length, load]);

  return { routines, loading, error, create, toggleComplete, reload: load };
};

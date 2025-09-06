
// features/routine/hooks/useEditRoutineModal.ts
import { useCallback, useState } from "react";
import type { AddRoutineForm, Routine } from "../types";

export const useEditRoutineModal = (
  onSubmit: (id: number, f: AddRoutineForm) => Promise<void>,
  onDelete: (id: number) => Promise<void>, // ✅ 추가
) => {
  const [target, setTarget] = useState<Routine | null>(null);

  const open = useCallback((r: Routine) => setTarget(r), []);
  const close = useCallback(() => setTarget(null), []);

  const submit = useCallback(
    async (f: AddRoutineForm) => {
      if (!target) return;
      await onSubmit(target.id, f);
      setTarget(null);
    },
    [onSubmit, target],
  );

  const remove = useCallback(async () => {
    if (!target) return;
    await onDelete(target.id);
    setTarget(null);
  }, [onDelete, target]);

  return { target, open, close, submit, remove, visible: !!target };
};
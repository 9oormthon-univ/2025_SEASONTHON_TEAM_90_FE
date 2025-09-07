import { useCallback, useMemo, useRef, useState } from "react";
import type { AddRoutineForm, Routine } from "../types";

export const useEditRoutineModal = (
  onSubmit: (id: number, f: AddRoutineForm) => Promise<void>,
  onDelete: (id: number) => Promise<void>,
) => {
  const [target, setTarget] = useState<Routine | null>(null);
  const inFlightRef = useRef(false);

  const open = useCallback((r: Routine) => {
    console.log("[EditRoutineModal] open", { id: r.id, title: r.title });
    setTarget(r);
  }, []);

  const close = useCallback(() => {
    console.log("[EditRoutineModal] close");
    setTarget(null);
  }, []);

  const submit = useCallback(
    async (f: AddRoutineForm) => {
      if (!target) return;
      if (inFlightRef.current) {
        console.warn("[EditRoutineModal] submit blocked: already in-flight");
        return;
      }
      inFlightRef.current = true;
      console.log("[EditRoutineModal] submit:start", { id: target.id, form: f });
      try {
        await onSubmit(target.id, f);
        console.log("[EditRoutineModal] submit:success", { id: target.id });
        setTarget(null);
      } catch (e: any) {
        console.warn(
          "[EditRoutineModal] submit:error",
          e?.response?.status,
          e?.response?.data || e,
        );
      } finally {
        inFlightRef.current = false;
        console.log("[EditRoutineModal] submit:end");
      }
    },
    [onSubmit, target],
  );

  const remove = useCallback(async () => {
    if (!target) return;
    if (inFlightRef.current) {
      console.warn("[EditRoutineModal] remove blocked: already in-flight");
      return;
    }
    inFlightRef.current = true;
    console.log("[EditRoutineModal] remove:start", { id: target.id });
    try {
      await onDelete(target.id);
      console.log("[EditRoutineModal] remove:success", { id: target.id });
      setTarget(null);
    } catch (e: any) {
      console.warn("[EditRoutineModal] remove:error", e?.response?.status, e?.response?.data || e);
    } finally {
      inFlightRef.current = false;
      console.log("[EditRoutineModal] remove:end");
    }
  }, [onDelete, target]);

  return { target, open, close, submit, remove, visible: !!target };
};
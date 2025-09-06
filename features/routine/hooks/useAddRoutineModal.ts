import { useCallback, useMemo, useRef, useState } from "react";
import type { AddRoutineForm } from "../types";

function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("submit-timeout")), ms);
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

export const useAddRoutineModal = (onSubmitForm: (f: AddRoutineForm) => Promise<void>) => {
  const [visible, setVisible] = useState(false);
  const inFlightRef = useRef(false);
  const lastStartAtRef = useRef<number | null>(null);

  const open = useCallback(() => {
    inFlightRef.current = false;
    lastStartAtRef.current = null;
    console.log("[AddRoutineModal] open → reset inflight=false");
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    console.log("[AddRoutineModal] close → force reset inflight=false");
    inFlightRef.current = false;
    lastStartAtRef.current = null;
    setVisible(false);
  }, []);

  const submit = useCallback(
    async (f: AddRoutineForm) => {
      console.log("[AddRoutineModal] submit:enter", {
        inflight: inFlightRef.current,
        lastStartAt: lastStartAtRef.current,
      });

      if (inFlightRef.current) {
        const elapsed = lastStartAtRef.current ? Date.now() - lastStartAtRef.current : null;
        if (!lastStartAtRef.current || (elapsed != null && elapsed > 300)) {
          console.warn("[AddRoutineModal] inflight stuck → self-heal reset and continue");
          inFlightRef.current = false;
          lastStartAtRef.current = null;
        }
      }
      if (inFlightRef.current) {
        console.warn("[AddRoutineModal] submit blocked: already in-flight");
        return;
      }

      inFlightRef.current = true;
      lastStartAtRef.current = Date.now();
      console.log("[AddRoutineModal] submit:start", { form: f });

      try {
        await withTimeout(onSubmitForm(f), 10000);
        console.log("[AddRoutineModal] submit:success");
        setVisible(false);
      } catch (e: any) {
        if (e?.message === "submit-timeout") {
          console.warn("[AddRoutineModal] submit:timeout (10s) → 서버/네트워크 지연 의심");
        } else {
          console.warn(
            "[AddRoutineModal] submit:error",
            e?.response?.status,
            e?.response?.data || e,
          );
        }
      } finally {
        inFlightRef.current = false;
        lastStartAtRef.current = null;
        console.log("[AddRoutineModal] submit:end (inflight=false)");
      }
    },
    [onSubmitForm],
  );

  return { visible, open, close, submit };
};

import { useCallback, useState } from "react";
import type { AddRoutineForm } from "../types";

export const useAddRoutineModal = (onSubmitForm: (f: AddRoutineForm) => Promise<void>) => {
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(
    async (f: AddRoutineForm) => {
      await onSubmitForm(f);
      setVisible(false);
    },
    [onSubmitForm],
  );

  return { visible, open, close, submit };
};
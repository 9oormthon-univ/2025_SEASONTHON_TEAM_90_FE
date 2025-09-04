// features/common/popupQueue.ts
import { create } from "zustand";
import { nanoid } from "nanoid/non-secure";
import type { ReactElement } from "react";

export type PopupItem = {
  id: string;
  render: (dismiss: () => void) => ReactElement | null;
};

type PopupQueueState = {
  queue: PopupItem[];
  current: PopupItem | null;
  enqueue: (render: PopupItem["render"]) => string;
  dismiss: () => void;
  clear: () => void;
};

export const usePopupQueue = create<PopupQueueState>((set, get) => ({
  queue: [],
  current: null,
  enqueue: (render) => {
    const id = nanoid();
    const item: PopupItem = { id, render };
    const { current, queue } = get();
    if (!current) set({ current: item });
    else set({ queue: [...queue, item] });
    return id;
  },
  dismiss: () => {
    const { queue } = get();
    if (queue.length === 0) set({ current: null });
    else {
      const [next, ...rest] = queue;
      set({ current: next, queue: rest });
    }
  },
  clear: () => set({ queue: [], current: null }),
}));

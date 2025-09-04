// features/common/PopupHost.tsx
import React from "react";
import { usePopupQueue } from "./popupQueue";

export default function PopupHost() {
  // 개별 selector로 분리하면 디버깅도 쉬움
  const current = usePopupQueue((s) => s.current);
  const dismiss = usePopupQueue((s) => s.dismiss);

  if (!current) return null;
  return current.render(dismiss);
}

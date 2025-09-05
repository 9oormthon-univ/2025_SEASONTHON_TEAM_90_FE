// features/retrospect/constants/icons.ts
// 섹션/헤더/뒤로가기
export { default as SmileIcon } from "@/features/retrospect/assets/stickers/icon-smile.svg";
export { default as WriteIcon } from "@/features/retrospect/assets/stickers/icon-write.svg";
export { default as FireIcon } from "@/features/retrospect/assets/stickers/fire.svg";
export { default as ArrowLeft } from "@/features/retrospect/assets/stickers/arrow-left.svg";

// 드로어 옵션 (회색/컬러)
export { default as SiNone } from "@/features/retrospect/assets/stickers/si1-1.svg";
export { default as SiPartial } from "@/features/retrospect/assets/stickers/si1-2.svg";
export { default as SiDone } from "@/features/retrospect/assets/stickers/si1-3.svg";
export { default as SadSvg } from "@/features/retrospect/assets/stickers/si1.svg";
export { default as NormalSvg } from "@/features/retrospect/assets/stickers/si2.svg";

export { default as VHappySvg } from "@/features/retrospect/assets/stickers/si3.svg";

// 리스트 카드용 스티커(상태별)
import UNSET from "@/features/retrospect/assets/stickers/lets.svg";

import DONE from "@/features/retrospect/assets/stickers/perfect.svg";
import PARTIAL from "@/features/retrospect/assets/stickers/good.svg";

import NONE from "@/features/retrospect/assets/stickers/cheer.svg";

export const stickerSvgs = {
  UNSET: UNSET,
  DONE: DONE,
  PARTIAL: PARTIAL,
  NONE: NONE,
} as const;

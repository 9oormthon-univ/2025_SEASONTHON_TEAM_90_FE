// features/retrospect/components/RoutineTickCard.tsx
import React, { useMemo, useState } from "react";
import {
  Pressable,
  View,
  Text,
  Image,
  type ImageSourcePropType,
  LayoutChangeEvent,
} from "react-native";
import type { RetrospectRoutineItem } from "../types";

/** 상태별 테마 */
const THEME_BY_STATUS = {
  DONE: { bg: "#E8F9EE", border: "#BEEAD0", track: "#D6F3E2", fill: "#2ECC71" }, // 초록
  PARTIAL: { bg: "#EAF2FF", border: "#CFE1FF", track: "#E0EAFF", fill: "#5B9BFF" }, // 파랑
  NONE: { bg: "#F3E8FF", border: "#E2D5FF", track: "#EBDDFF", fill: "#C3B3FF" }, // 보라
  UNSET: { bg: "#F5F6F7", border: "#E5E7EB", track: "#E5E7EB", fill: "#D1D5DB" }, // 회색
} as const;

const STICKER_TEXT = {
  UNSET: "Let's go!",
  DONE: "Perfect!",
  PARTIAL: "Good!",
  NONE: "Cheer up!",
} as const;

/** 진행 퍼센트: PARTIAL은 정확히 50% */
const FILL_PCT = { UNSET: 0, NONE: 0, PARTIAL: 50, DONE: 100 } as const;
type LogicalStatus = keyof typeof FILL_PCT;

/** 치수 상수 */
const STICKER_W = 44;
const KNOB_HALF = STICKER_W / 2;
const BAR_H = 10; // 진행바 높이(둥근 캡 반지름 = BAR_H/2)

type Props = {
  item: RetrospectRoutineItem;
  onToggle: () => void;
  readonly?: boolean;
  showStreak?: boolean;
  streakDays?: number;
  showStatusSticker?: boolean; // 카드 우측 상단 텍스트 라벨
  isUnset?: boolean;

  /** (선택) PNG/JPG 스티커 소스 */
  stickers?: Partial<Record<LogicalStatus, ImageSourcePropType>>;
  /** (권장) SVG 스티커 컴포넌트 */
  stickerSvgs?: Partial<
    Record<LogicalStatus, React.ComponentType<{ width?: number; height?: number }>>
  >;

  stickerEmoji?: string;
};

export default function RoutineTickCard({
  item,
  onToggle,
  readonly,
  showStreak = true,
  streakDays,
  showStatusSticker = true,
  isUnset = false,
  stickers,
  stickerSvgs,
  stickerEmoji = "🐵",
}: Props) {
  const logicalStatus: LogicalStatus = isUnset ? "UNSET" : (item.status as LogicalStatus);

  const theme =
    THEME_BY_STATUS[logicalStatus === "UNSET" ? "UNSET" : (item.status as LogicalStatus)];
  const pct = FILL_PCT[logicalStatus] ?? 0;

  const statusLabel =
    item.status === "DONE" ? "완료" : item.status === "PARTIAL" ? "부분 완료" : "미완료";

  // 진행바 너비 측정
  const [barW, setBarW] = useState(0);
  const onBarLayout = (e: LayoutChangeEvent) => setBarW(e.nativeEvent.layout.width);

  // ✅ 위치 규칙 + 둥근 캡 보정(cap compensation)
  const knobX = useMemo(() => {
    if (!barW) return 0;

    // 둥근 캡 반지름
    const cap = BAR_H / 2; // 필요시 +1로 미세 보정 가능: const cap = BAR_H / 2 + 1;

    // 스티커 이동 한계(스티커 폭 고려)
    const start = 0;
    const end = Math.max(barW - STICKER_W, 0);

    // 시각적 유효 길이(좌우 캡 제외)
    const visualStart = cap;
    const visualEnd = barW - cap;
    const visualWidth = Math.max(visualEnd - visualStart, 0);

    switch (logicalStatus) {
      case "NONE": // 미완료: 항상 시작점
        return start;
      case "DONE": // 완료: 항상 끝점
        return end;
      case "PARTIAL": {
        const center = visualStart + (visualWidth * pct) / 100; // 50% 중앙
        return Math.min(Math.max(center - KNOB_HALF, start), end);
      }
      case "UNSET":
      default:
        return start;
    }
  }, [barW, logicalStatus, pct]);

  const stickerText = STICKER_TEXT[logicalStatus];
  const SvgSticker = stickerSvgs?.[logicalStatus];
  const imgSource = stickers?.[logicalStatus];

  const showStreakBadge = showStreak && typeof streakDays === "number" && streakDays > 0;

  // ✅ 상태색에 맞춘 카테고리 칩 배경
  const chipBg = logicalStatus === "UNSET" ? "#C8CDD3" : theme.fill;
  const chipTxt = "#FFFFFF";

  // 우측 상단 라벨을 쓰면, 플로팅 라벨(이모티콘 위 텍스트)은 숨김
  const showFloatingLabel = !showStatusSticker;

  return (
    <Pressable
      disabled={readonly}
      onPress={onToggle}
      hitSlop={8}
      style={{
        backgroundColor: theme.bg,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: theme.border,
        marginBottom: 14,
      }}
    >
      {/* 상단 라인 */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        {/* 카테고리 칩(상태색) */}
        <View
          style={{
            backgroundColor: chipBg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: chipTxt, fontSize: 11, fontWeight: "700" }}>{item.category}</Text>
        </View>

        <View
          style={{
            marginLeft: 6,
            backgroundColor: "#fff",
            borderColor: theme.border,
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: "#3F3429", fontWeight: "700", fontSize: 11 }}>{statusLabel}</Text>
        </View>

        {showStreakBadge && (
          <View
            style={{
              marginLeft: 6,
              backgroundColor: "#FFF1E5",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#FED7AA",
            }}
          >
            <Text style={{ color: "#F97316", fontWeight: "700", fontSize: 11 }}>
              🔥 {streakDays}일 연속
            </Text>
          </View>
        )}

        {showStatusSticker && (
          <View style={{ marginLeft: "auto" }}>
            <Text style={{ color: "#6B5B4A", fontWeight: "800", fontSize: 12 }}>{stickerText}</Text>
          </View>
        )}
      </View>

      {/* 제목 */}
      <Text style={{ color: "#1F2937", fontWeight: "700", fontSize: 16, marginBottom: 12 }}>
        {item.title}
      </Text>

      {/* 진행바 + 스티커 */}
      <View style={{ height: 64, position: "relative" }}>
        {/* 진행바(둥근 캡) */}
        <View
          onLayout={onBarLayout}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: BAR_H,
            borderRadius: 999,
            backgroundColor: theme.track,
            overflow: "hidden",
          }}
        >
          {/* 채움도 radius 부여 */}
          <View
            style={{
              width: `${pct}%`,
              height: "100%",
              backgroundColor: theme.fill,
              borderRadius: 999,
            }}
          />
        </View>

        {/* 스티커(막대 위로 떠 있음) */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: knobX,
            bottom: 18, // 막대 윗선에서 살짝 띄우기
            alignItems: "center",
          }}
        >
          {showFloatingLabel && (
            <Text style={{ color: "#FF7D4D", fontWeight: "900", marginBottom: 2, fontSize: 12 }}>
              {stickerText}
            </Text>
          )}

          {SvgSticker ? (
            <SvgSticker width={STICKER_W} height={STICKER_W} />
          ) : imgSource ? (
            <Image
              source={imgSource}
              style={{ width: STICKER_W, height: STICKER_W, resizeMode: "contain" }}
            />
          ) : (
            <Text style={{ fontSize: 28 }}>{stickerEmoji}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

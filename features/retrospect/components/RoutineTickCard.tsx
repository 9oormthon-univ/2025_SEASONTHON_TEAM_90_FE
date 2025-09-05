// features/retrospect/components/RoutineTickCard.tsx
import React, { useMemo } from "react";
import { Pressable, View, Text } from "react-native";
import type { RetrospectRoutineItem } from "../types";

const COLOR = {
  운동: "#DDF6E2",
  학업: "#E7F0FF",
  문화: "#EDE6FF",
  기타: "#EEECE8",
} as const;

const STATUS_BADGE_BG = {
  NONE: "#F3F4F6",
  PARTIAL: "#DBEAFE",
  DONE: "#D1FAE5",
} as const;

const STATUS_BADGE_TXT = {
  NONE: "#6B7280",
  PARTIAL: "#2563EB",
  DONE: "#059669",
} as const;

const FILL_PCT = { NONE: 0, PARTIAL: 55, DONE: 100 } as const;

type Props = {
  item: RetrospectRoutineItem;
  onToggle: () => void; // 외부에서 Bottom Sheet 열도록 연결됨
  readonly?: boolean;
  streakDays?: number; // 선택: streak 배지 표시용
  showStreak?: boolean;
};

export default function RoutineTickCard({
  item,
  onToggle,
  readonly,
  streakDays,
  showStreak = true,
}: Props) {
  const bg = COLOR[(item.category as keyof typeof COLOR) || "기타"] ?? "#F4F1EA";
  const pct = useMemo(() => FILL_PCT[item.status] ?? 0, [item.status]);
  const statusLabel =
    item.status === "DONE" ? "완료" : item.status === "PARTIAL" ? "부분 완료" : "미완료";

  const showStreakBadge = showStreak && typeof streakDays === "number" && streakDays > 0;

  return (
    <Pressable
      disabled={readonly}
      onPress={onToggle}
      hitSlop={8}
      testID={`tick-card-${item.id}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!readonly }}
      accessibilityLabel={`${item.title} 상태: ${statusLabel}`}
      style={{
        backgroundColor: bg,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        marginBottom: 12,
        opacity: readonly ? 0.7 : 1,
      }}
    >
      {/* 상단 라인: 카테고리 + 상태 뱃지 */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.12)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11 }}>{item.category}</Text>
        </View>

        <View
          style={{
            marginLeft: 8,
            backgroundColor: STATUS_BADGE_BG[item.status],
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: STATUS_BADGE_TXT[item.status],
              fontWeight: "700",
              fontSize: 11,
            }}
          >
            {statusLabel}
          </Text>
        </View>

        {/* streak 배지: prop으로 받은 숫자 기준 조건부 표시 */}
        {showStreakBadge && (
          <View
            style={{
              marginLeft: 8,
              backgroundColor: "#FFF1E5",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "#F97316", fontWeight: "700", fontSize: 11 }}>
              🔥 {streakDays}일 연속
            </Text>
          </View>
        )}
      </View>

      {/* 제목 */}
      <Text style={{ color: "#1F2937", fontWeight: "700", fontSize: 16, marginBottom: 10 }}>
        {item.title}
      </Text>

      {/* 진행 바: 트랙 + 채움 */}
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor:
              item.status === "DONE"
                ? "#34D399"
                : item.status === "PARTIAL"
                  ? "#93C5FD"
                  : "#D1D5DB",
          }}
        />
      </View>
    </Pressable>
  );
}

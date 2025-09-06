import { useMemo } from "react";
import { View, Text } from "react-native";
import type { WeeklyDashboardData, Emotion } from "../types";
import { emotionFromScore } from "../utils/emotion";

import GloomyIcon from "@/features/dashboard/assets/gloomy.svg";
import NormalIcon from "@/features/dashboard/assets/basic.svg";
import HappyIcon from "@/features/dashboard/assets/happy.svg";
import ExitedIcon from "@/features/dashboard/assets/exited.svg";

// 직선 가져오기
import Svg, { Polyline, Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";

/**WeeklyDashboardData 타입을 사용하여 props 타입을 명시 */
export interface EmotionChangeProps {
  daily: WeeklyDashboardData["daily_completion"];
  summaryText: string;
}

// 아이콘과 Emotion 타입을 매핑
const emotionIcons: Record<Emotion, React.ComponentType<{ width: number; height: number }>> = {
  LOW: GloomyIcon,
  NORMAL: NormalIcon,
  GOOD: HappyIcon,
  VERY_GOOD: ExitedIcon,
};

const Point = ({ emotion }: { emotion: Emotion }) => {
  const Icon = emotionIcons[emotion] ?? NormalIcon;
  return <Icon width={40} height={40} />;
};

// SVG Path 데이터 생성을 위한 헬퍼 함수 (직선으로 변경)
// const createSplinePath = (points: { x: number; y: number }[]) => {
//   if (points.length < 2) return "";
//   let path = `M ${points[0].x} ${points[0].y}`;
//   for (let i = 0; i < points.length - 1; i++) {
//     const x1 = points[i].x;
//     const y1 = points[i].y;
//     const x2 = points[i + 1].x;
//     const y2 = points[i + 1].y;
//     const midX = (x1 + x2) / 2;
//     path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
//   }
//   return path;
// };

/** 하루 레코드에서 Emotion 안전 추출(점수/문자열 모두 지원) */
const pickEmotion = (
  d: WeeklyDashboardData["daily_completion"][number]
): Emotion => {
  const score =
    (d as any)?.primary_emotion_score ?? (d as any)?.primaryEmotionScore;
  if (typeof score === "number") return emotionFromScore(score);

  const e = d.primary_emotion as Emotion | undefined;
  if (e === "LOW" || e === "NORMAL" || e === "GOOD" || e === "VERY_GOOD") {
    return e;
  }
  return "NORMAL"; // fallback
};

export default function EmotionChange({ daily, summaryText }: EmotionChangeProps) {
  const ORDER = ["VERY_GOOD", "GOOD", "NORMAL", "LOW"] as const;

  // 빈 데이터 방어
  if (!daily || daily.length === 0) {
    return (
      <View className="px-6 py-8 bg-white rounded-xl">
        <Text className="text-center text-[16px] text-[#3A332A]">감정 데이터가 없어요.</Text>
      </View>
    );
  }

  const points = useMemo(() => {
    const days = daily.slice(0, 7);
    return days.map((d, idx) => {
      const emotion = pickEmotion(d);
      const idxInOrder = ORDER.indexOf(emotion);
      const safeIdx = idxInOrder === -1 ? ORDER.indexOf("NORMAL") : idxInOrder;
      const x = (idx + 0.5) * (100 / days.length); // 각 요일 중앙
      const y = 90 - (safeIdx / (ORDER.length - 1)) * 80; // 상단 10% ~ 하단 90%
      return { x, y, emotion, date: d.date };
    });
  }, [daily]);

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View className="px-6 py-8 bg-white rounded-xl">
      {/* 상단 요일 라벨 */}
      <View className="flex-row mb-5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <View key={day} className="items-center flex-1">
            <Text className="text-[16px] text-[#5F5548] font-choco">{day}</Text>
          </View>
        ))}
      </View>
      {/* 그래프 영역 */}
      <View className="relative w-full h-28">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            {/* 자연스러운 흰색 → 연노랑 그라데이션 */}
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="40%" stopColor="white" />
              <Stop offset="100%" stopColor="#FFE8A3" />
            </LinearGradient>
          </Defs>

          {/* 배경 전체를 그라데이션으로 채움 */}
          <Rect x="0" y="0" width="100" height="100" fill="url(#grad)" />

          {/* 배경 가로 점선 */}
          {[25, 50, 75, 99].map((y) => (
            <Line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#816E57"
              strokeWidth="1"
              strokeDasharray="0.5"
            />
          ))}

          {/* 직선 그래프 */}
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke="#FF9752"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </Svg>

        {/* 아이콘 배치 */}
        {points.map((p) => (
          <View
            key={p.date}
            className="absolute items-center justify-center"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: [{ translateX: -20 }, { translateY: -16 }],
            }}
          >
            <Point emotion={p.emotion} />
          </View>
        ))}
      </View>

      <Text className="text-center text-[16px] text-[#3A332A] mt-4">
        {summaryText}
      </Text>
    </View>
  );
}

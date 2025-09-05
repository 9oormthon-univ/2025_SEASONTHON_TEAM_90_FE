import { useMemo } from "react";
import { View, Text } from "react-native";
import type { WeeklyDashboardResponse } from "../types";

import NormalIcon from "@/features/dashboard/assets/basic.svg";
import ExitedIcon from "@/features/dashboard/assets/excited.svg";
import GloomyIcon from "@/features/dashboard/assets/gloomy.svg";
import HappyIcon from "@/features/dashboard/assets/happy.svg";
// 직선 가져오기
import Svg, { Polyline, Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";

export interface EmotionChangeProps {
  daily: WeeklyDashboardResponse["data"]["daily_completion"];
}

const Point = ({ emotion }: { emotion: string }) => {
  // 아이콘 크기 통일을 위해 width, height 지정
  const iconSize = 40;
  switch (emotion) {
    case "HAPPY":
      return <HappyIcon width={iconSize} height={iconSize} />;
    case "NORMAL":
      return <NormalIcon width={iconSize} height={iconSize} />;
    case "SAD":
      return <GloomyIcon width={iconSize} height={iconSize} />;
    case "EXITED":
      return <ExitedIcon width={iconSize} height={iconSize} />;
    default:
      return <NormalIcon width={iconSize} height={iconSize} />;
  }
};

// SVG Path 데이터 생성을 위한 헬퍼 함수 (부드러운 곡선)
const createSplinePath = (points: { x: number; y: number }[]) => {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i].x;
    const y1 = points[i].y;
    const x2 = points[i + 1].x;
    const y2 = points[i + 1].y;
    const midX = (x1 + x2) / 2;
    path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  }
  return path;
};

export default function EmotionChange({ daily }: EmotionChangeProps) {
  const TOP_RATIO = 0.48;

  const points = useMemo(() => {
    const order = ["EXITED", "HAPPY", "NORMAL", "SAD"] as const;
    const days = daily.slice(0, 7);
    return days.map((d, idx) => {
      const emotionIdx = Math.max(0, order.indexOf(d.primary_emotion as any)); // 0..3
      const x = (idx + 0.5) * (100 / days.length); // 각 요일 중앙
      // y: 상단 10% ~ 하단 90% 사이에 배치(위가 값 큼)
      const y = 90 - (emotionIdx / (order.length - 1)) * 80;
      return { x, y, emotion: d.primary_emotion, date: d.date };
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

          {/* 배경 가로 점선 (그라데이션 뒤에 위치) */}
          {[25, 50, 75, 100].map((y) => (
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
        이번 주는 전반적으로 <Text className="font-bold">안정적</Text>이에요.
      </Text>
    </View>
  );
}

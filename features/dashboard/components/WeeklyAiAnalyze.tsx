// features/dashboard/components/WeeklyAiAnalyze.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
// import { useWeeklyInsight } from "../hooks/useWeeklyInsight"; // 수정됨: 더미 전용으로 제거
import AnalyzeIcon from "@/features/dashboard/assets/analyze.svg";
import type { WeeklyDashboardData, Suggestion } from "../types";
import { buildStreakMap, getStreakBadgeForHighlight } from "../utils/insight";
import { getWeekLabel } from "../utils/date";
import { mockWeeklyInsight } from "../utils/mock"; // 수정됨: 더미 데이터 사용

// 수정됨: 더미 전용 Props로 축소
export interface WeeklyAiAnalyzeProps {
  weekStartISO: string;
  routines?: WeeklyDashboardData["routine_performance"];
}

export default function WeeklyAiAnalyze({
  weekStartISO,
  routines,
}: WeeklyAiAnalyzeProps) {
  // 수정됨: 항상 더미 데이터 사용
  const data = useMemo(() => mockWeeklyInsight(weekStartISO), [weekStartISO]); // 수정됨
  const loading = false; // 수정됨
  const error = null; // 수정됨

  const weekLabel = useMemo(() => getWeekLabel(weekStartISO), [weekStartISO]);
  const streakMap = useMemo(() => buildStreakMap(routines), [routines]);

  return (
    <View>
      {/* 수정됨: 더미 전용이라 로딩/에러 분기 단순화 */}
      {loading && (
        <View className="items-center">
          <AnalyzeIcon />
        </View>
      )}

      {!loading && !!error && (
        <Text className="text-sm text-red-500">분석을 가져오지 못했습니다.</Text>
      )}

      {!loading && !!data && (
        <View className="gap-3 bg-white p-[20px] rounded-xl">
          {/* 한주 요약 */}
          <View className="p-5 rounded-xl bg-[#EFECE4]">
            <Text className="text-sm text-[#5F5548] mb-2">{weekLabel} 요약</Text>
            <Text className="text-sm text-[#3A332A]">{data.summary}</Text>
          </View>

          {/* 훌륭해요! */}
          {data.highlights.length > 0 && (
            <View className="p-5 rounded-xl bg-[#EFECE4]">
              <Text className="text-sm text-[#5F5548] mb-2">훌륭해요!</Text>
              {data.highlights.map((h: string, i: number) => {
                const badge = getStreakBadgeForHighlight(h, streakMap);
                return (
                  <View key={`${i}-${h}`} className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-[#3A332A]">• {h}</Text>
                    {badge && <Text className="text-sm text-[#FF812C]">{badge}</Text>}
                  </View>
                );
              })}
            </View>
          )}

          {/* 제안 */}
          {data.suggestions.length > 0 && (
            <View className="p-5 rounded-xl bg-[#EFECE4]">
              <Text className="text-sm text-[#5F5548] mb-2">제안</Text>
              {data.suggestions.map((s: Suggestion, i: number) => (
                <Text key={i} className="mb-2 text-sm text-[#3A332A]">
                  • {s.pattern} — {s.suggestion}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

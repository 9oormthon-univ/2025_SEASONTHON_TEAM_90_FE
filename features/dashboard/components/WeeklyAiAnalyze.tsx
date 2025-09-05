import React, { useMemo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useWeeklyInsight } from "../hooks/useWeeklyInsight";
import AnalyzeIcon from "@/features/dashboard/assets/analyze.svg";
import type { WeeklyDashboardData, Suggestion } from "../types";
import { buildStreakMap, getStreakBadgeForHighlight } from "../utils/insight";
import { getWeekLabel } from "../utils/date";


export interface WeeklyAiAnalyzeProps {
  weekStartISO: string;
  memberId: number;
  force?: boolean;
  AnalyzingIcon?: React.ComponentType;
  delayMs?: number;
  routines?: WeeklyDashboardData["routine_performance"];
}

export default function WeeklyAiAnalyze({
  weekStartISO,
  memberId,
  force,
  AnalyzingIcon,
  // delayMs = 800, // 강제 딜레이
  routines,
}: WeeklyAiAnalyzeProps) {
  const Icon = AnalyzingIcon ?? AnalyzeIcon;

  const { data, loading, error } = useWeeklyInsight(weekStartISO, memberId, force ?? false);
  // Mock 데이터
  // const hook = useWeeklyInsight(weekStartISO, memberId, force ?? false);
  // const [mockState, setMockState] = useState<typeof hook>({ data: null, loading: !!mockData, error: null } as any);

  // const data = mockData ? mockState.data : hook.data;
  // const loading = mockData ? mockState.loading : hook.loading;
  // const error = mockData ? mockState.error : hook.error;

  // 연산 최적화
  const weekLabel = useMemo(() => getWeekLabel(weekStartISO), [weekStartISO]);
  const streakMap = useMemo(() => buildStreakMap(routines), [routines]);

  return (
    <View>
      {loading && <View className="items-center">{Icon ? <Icon /> : <ActivityIndicator />}</View>}

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

          {/* 제안 하기 */}
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

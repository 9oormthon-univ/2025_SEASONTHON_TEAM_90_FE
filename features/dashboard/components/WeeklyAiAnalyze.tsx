import React, { useMemo} from "react"
import { View, Text, ActivityIndicator } from "react-native";
import { useWeeklyInsight } from "../hooks/useWeeklyInsight";
import AnalyzeIcon from "@/features/dashboard/assets/analyze.svg";
import type { WeeklyDashboardResponse } from "../types"
import { buildStreakMap, getStreakBadgeForHighlight } from "../utils/insight";
import { getWeekLabel } from "../utils/date";

export interface WeeklyAiAnalyzeProps {
    weekStartISO: string;
    memberId: number;
    force?: boolean;
    AnalyzingIcon?: React.ComponentType;
    // mockData?: WeeklyInsightResponse["data"];
    delayMs?: number;
    routines?: WeeklyDashboardResponse["data"]["routine_performance"];
}

export default function WeeklyAiAnalyze({
    weekStartISO,
    memberId,
    force,
    AnalyzingIcon,
    // mockData,
    delayMs = 800,
    routines,
}: WeeklyAiAnalyzeProps) {
    const Icon = AnalyzingIcon ?? AnalyzeIcon;

    const { data, loading, error } = useWeeklyInsight(weekStartISO, memberId, force ?? false);

    // const hook = useWeeklyInsight(weekStartISO, memberId, force ?? false);
    // const [mockState, setMockState] = useState<typeof hook>({ data: null, loading: !!mockData, error: null } as any);
    const weekLabel = useMemo(() => getWeekLabel(weekStartISO), [weekStartISO]);
    const streakMap = useMemo(() => buildStreakMap(routines), [routines]);

    // const data = mockData ? mockState.data : hook.data;
    // const loading = mockData ? mockState.loading : hook.loading;
    // const error = mockData ? mockState.error : hook.error;

    return (
        <View >
            {loading && (
                <View className="items-center">
                    {Icon ? <Icon /> : <ActivityIndicator />}
                </View>
            )}

            {!loading && !!error && (
                <Text className="text-sm text-red-500">분석을 가져오지 못했습니다.</Text>
            )}

            {!loading && !!data && (
                <View className="gap-3 bg-white p-[20px] rounded-xl">
                    {/* changed: n월 m째주 요약 라벨 적용 */}
                    <View className="p-5 rounded-xl bg-[#EFECE4]">
                        <Text className="text-sm text-[#5F5548] mb-2">{weekLabel} 요약</Text>
                        <Text className="text-sm text-[#3A332A]">{data.summary}</Text>
                    </View>

                    {data.highlights.length > 0 && (
                        <View className="p-5 rounded-xl bg-[#EFECE4]">
                            <Text className="text-sm text-[#5F5548] mb-2">훌륭해요!</Text>
                            {data.highlights.map((h, i) => {
                                const badge = getStreakBadgeForHighlight(h, streakMap);
                                return (
                                    <View
                                        key={`${i}-${h}`}
                                        className="flex-row items-center justify-between mb-2"
                                    >
                                        <Text className="text-sm text-[#3A332A]">• {h}</Text>
                                        {badge && <Text className="text-sm text-[#FF812C]">{badge}</Text>}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {data.suggestions.length > 0 && (
                        <View className="p-5 rounded-xl bg-[#EFECE4]">
                            <Text className="text-sm text-[#5F5548] mb-2">제안</Text>
                            {data.suggestions.map((s, i) => (
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

import React, { useMemo, useState, useCallback } from "react";
import { View, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Text } from "react-native";
import TopBar from "@/components/Common/TopBar";
import WeeklyRoutine from "@/features/dashboard/components/WeeklyRoutine";
import EmotionChange from "@/features/dashboard/components/EmotionChange";
import WeeklyAiAnalyze from "@/features/dashboard/components/WeeklyAiAnalyze";
import ReportSheet from "@/features/dashboard/components/ReportSheet";
import { addDays, format, formatISO, parseISO, startOfWeek } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Fire from '../assets/fire.svg'
import Ai from '../assets/ai.svg'
import Smile from '../assets/smile.svg'

import {
    mockWeeklyDashboard,
    mockWeeklyInsight,
    mockWeekStart,
    mockFirstWeek,
    mockCurrentWeek,
} from "@/features/dashboard/utils/mock";
import { getReportLabel, getWeekLabel } from "../utils/date";

const MEMBER_ID_FOR_TEST = 1;

function toISO(d: Date) {
    return formatISO(d, { representation: "date" });
}

function getCurrentWeekStartISO() {
    return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export default function DashboardPage() {
    const [weekStartISO, setWeekStartISO] = useState<string>(() => getCurrentWeekStartISO());
    const [sheetVisible, setSheetVisible] = useState(false);

    // 더미 데이터(실제 API로 교체 가능)
    const data = mockWeeklyDashboard;

    // 주 라벨/모달 라벨
    const weekLabel = getWeekLabel(weekStartISO); // 예: "9월 첫째주"
    const reportLabel = getReportLabel(weekStartISO); // 이번 주면 "이번 주 보고서"

    // 상단 요약
    const summary = {
        completionRate: data.metrics.completion_rate,
        recordRate: data.metrics.record_rate,
        totalRoutines: data.routine_performance.length,
    };

    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        if (y > 30) setSheetVisible(true);
        if (y <= 0) setSheetVisible(false);
    }, []);

    const currentWeekISO = useMemo(() => getCurrentWeekStartISO(), []);
    const canPrev = useMemo(() => parseISO(weekStartISO) > parseISO(mockFirstWeek), [weekStartISO]);
    const canNext = useMemo(() => parseISO(weekStartISO) < parseISO(currentWeekISO), [weekStartISO, currentWeekISO]);

    const goPrev = () => canPrev && setWeekStartISO(toISO(addDays(parseISO(weekStartISO), -7)));
    const goNext = () => canNext && setWeekStartISO(toISO(addDays(parseISO(weekStartISO), +7)));

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
            <StatusBar translucent backgroundColor="transparent" style="dark" />
            <TopBar title="대시보드" bgColor="#f3efe3" />
            <ScrollView
                className="flex-1 px-4"
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <View className="flex-row gap-[8px] items-center my-4">
                    <Fire />
                    <Text className="text-[#5F5548] text-xl">루틴 실행률</Text>
                </View>
                <WeeklyRoutine
                    weekLabel={weekLabel}
                    completionRate={summary.completionRate}
                    routines={data.routine_performance}
                />
                <View className="flex-row gap-[8px] items-center my-4">
                    <Smile />
                    <Text className="text-[#5F5548] text-xl">감정 변화</Text>
                </View>
                <EmotionChange daily={data.daily_completion} />
                <View className="flex-row gap-[8px] items-center my-4">
                    <Ai />
                    <Text className="text-[#5F5548] text-xl">AI 주간 분석</Text>
                </View>
                <WeeklyAiAnalyze
                    weekStartISO={weekStartISO}
                    memberId={MEMBER_ID_FOR_TEST}
                    mockData={mockWeeklyInsight}
                    delayMs={1200}
                />
                <View className="h-10" />
            </ScrollView>

            <ReportSheet
                visible={sheetVisible}
                label={reportLabel}
                canPrev={canPrev}
                canNext={canNext}
                onPrev={goPrev}
                onNext={goNext}
            />
        </SafeAreaView>
    );
}

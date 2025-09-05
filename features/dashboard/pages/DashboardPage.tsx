import React, { useMemo, useState, useCallback } from "react";
import { View, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import TopBar from "@/components/Common/TopBar";
import WeeklyRoutine from "@/features/dashboard/components/WeeklyRoutine";
import EmotionChange from "@/features/dashboard/components/EmotionChange";
import WeeklyAiAnalyze from "@/features/dashboard/components/WeeklyAiAnalyze";
import ReportSheet from "@/features/dashboard/components/ReportSheet";
import { addDays, format, formatISO, parseISO, startOfWeek } from "date-fns";
import { useWeeklyDashboard } from "../hooks/useWeeklyDashboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Fire from "../assets/fire.svg";
import Ai from "../assets/ai.svg";
import Smile from "../assets/smile.svg";
import { getReportLabel, getWeekLabel } from "../utils/date";

// import {
//     mockWeeklyDashboard,
//     mockWeeklyInsight,
//     mockWeekStart,
//     mockFirstWeek,
//     mockCurrentWeek,
// } from "@/features/dashboard/utils/mock";
// const MEMBER_ID_FOR_TEST = 1;

interface DashboardPageProps {
  memberId: number;
}

function toISO(d: Date) {
  return formatISO(d, { representation: "date" });
}

function getCurrentWeekStartISO() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export default function DashboardPage({ memberId }: DashboardPageProps){
  const [weekStartISO, setWeekStartISO] = useState<string>(() => getCurrentWeekStartISO());
  const [sheetVisible, setSheetVisible] = useState(false);

  // 더미 데이터(실제 API로 교체 가능)
  // const data = mockWeeklyDashboard;
  const { memberId: memberIdFromRoute } = useLocalSearchParams(); // ID 호출
  // const memberId = parseInt(Array.isArray(memberIdFromRoute) ? memberIdFromRoute[0] : memberIdFromRoute ?? "", 10);

  // memberId가 유효한 숫자인 경우에만 API를 호출하도록 enabled 옵션을 활용할 수 있습니다. (react-query 사용 시)
  const { data, loading, error } = useWeeklyDashboard(weekStartISO, memberId);

  // 주 라벨/모달 라벨
  const weekLabel = getWeekLabel(weekStartISO); // 예: "9월 첫째주"
  const reportLabel = getReportLabel(weekStartISO); // 이번 주면 "이번 주 보고서"

  // // 상단 요약
  // const summary = {
  //     completionRate: data.metrics.completion_rate,
  //     recordRate: data.metrics.record_rate,
  //     totalRoutines: data.routine_performance.length,
  // };

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > 30) setSheetVisible(true);
    if (y <= 0) setSheetVisible(false);
  }, []);

  const currentWeekISO = useMemo(() => getCurrentWeekStartISO(), []);
  const canPrev = true;
  const canNext = useMemo(
    () => parseISO(weekStartISO) < parseISO(currentWeekISO),
    [weekStartISO, currentWeekISO],
  );

  const goPrev = () => canPrev && setWeekStartISO(toISO(addDays(parseISO(weekStartISO), -7)));
  const goNext = () => canNext && setWeekStartISO(toISO(addDays(parseISO(weekStartISO), +7)));

  // memberId가 유효하지 않은 경우에 대한 처리 추가
  if (isNaN(memberId)) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
        <TopBar title="대시보드" bgColor="#f3efe3" />
        <View className="items-center justify-center flex-1">
          <Text>잘못된 접근입니다.</Text>
        </View>
      </SafeAreaView>
    )
  }

  // 로딩 중
  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
        <StatusBar translucent backgroundColor="transparent" style="dark" />
        <TopBar title="대시보드" bgColor="#f3efe3" />
        <View className="items-center justify-center flex-1">
          <Text>로딩 중…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 에러 UI
  if (error || !data) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
        <StatusBar translucent backgroundColor="transparent" style="dark" />
        <TopBar title="대시보드" bgColor="#f3efe3" />
        <View className="items-center justify-center flex-1">
          <Text>데이터를 불러오지 못했어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const summary = {
    completionRate: data.metrics.completion_rate,
    recordRate: data.metrics.record_rate,
    totalRoutines: data.routine_performance.length,
  };
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
      <StatusBar translucent backgroundColor="transparent" style="dark" />
      <TopBar title="대시보드" bgColor="#f3efe3" />
      <ScrollView className="flex-1 px-4" onScroll={onScroll} scrollEventThrottle={16}>
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
          memberId={memberId}
        // mockData={mockWeeklyInsight} // 주석화 강제 딜레이
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

import { useMemo, useState, useCallback } from "react";
import { View, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Text } from "react-native";
import TopBar from "@/components/Common/TopBar";
import WeeklyRoutine from "@/features/dashboard/components/WeeklyRoutine";
import EmotionChange from "@/features/dashboard/components/EmotionChange";
import WeeklyAiAnalyze from "@/features/dashboard/components/WeeklyAiAnalyze";
import ReportSheet from "@/features/dashboard/components/ReportSheet";
import { addDays, format, formatISO, parseISO, startOfWeek } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Fire from "../assets/fire.svg";
import Ai from "../assets/ai.svg";
import Smile from "../assets/smile.svg";
import { getReportLabel, getWeekLabel } from "../utils/date";
import { useWeeklyDashboard } from "../hooks/useWeeklyDashboard";
import { useWeeklyInsight } from "../hooks/useWeeklyInsight";
import type { WeeklyInsightData } from "../types";
import { hasEmotion } from "../utils/emotion";

// import {
//     mockWeeklyDashboard,
//     mockWeeklyInsight,
//     mockWeekStart,
//     mockFirstWeek,
//     mockCurrentWeek,
// } from "@/features/dashboard/utils/mock";
// const MEMBER_ID_FOR_TEST = 1;

function toISO(d: Date) {
  return formatISO(d, { representation: "date" });
}
function getCurrentWeekStartISO() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

interface DashboardPageProps {
  memberId: number; // 필수
  initialWeekStartISO?: string; // 선택: 초기 주 시작(YYYY-MM-DD)
  forceInsight?: boolean; // 선택: 인사이트 강제 재생성 플래그
  mockInsight?: WeeklyInsightData; // 선택: 더미 인사이트 주입(시연용)
  mockInsightDelayMs?: number; // 선택: 더미 인사이트 딜레이(ms)
}

export default function DashboardPage({
  memberId,
  initialWeekStartISO,
  forceInsight = false,
}: DashboardPageProps) {

  // 초기 주차 주입
  const [weekStartISO, setWeekStartISO] = useState<string>(
    () => initialWeekStartISO ?? getCurrentWeekStartISO()
  );
  const [sheetVisible, setSheetVisible] = useState(false);

  // 더미 데이터(실제 API로 교체 가능)
  // const data = mockWeeklyDashboard;
  // const memberId = parseInt(Array.isArray(memberIdFromRoute) ? memberIdFromRoute[0] : memberIdFromRoute ?? "", 10);

  // 주간 통계
  const { data, loading, error } = useWeeklyDashboard(weekStartISO, memberId);
  // AI 인사이트(요약 텍스트용)
  const { data: insight, loading: insightLoading } = useWeeklyInsight(
    weekStartISO,
    memberId,
    forceInsight
  );
  // 라벨
  const weekLabel = getWeekLabel(weekStartISO);   // 예: "9월 첫째주"
  const reportLabel = getReportLabel(weekStartISO);

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
  if (!Number.isFinite(memberId)) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
        <TopBar title="대시보드" />
        <View className="items-center justify-center flex-1">
          <Text>잘못된 접근입니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#f3efe3" }} edges={["top"]}>
        <StatusBar translucent backgroundColor="transparent" style="dark" />
        <TopBar title="대시보드" />
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
        <TopBar title="대시보드" />
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
  // 하루라도 감정 데이터 있으면 그래프 표시
  const showEmotionGraph = useMemo(
    () => data.daily_completion?.some(hasEmotion) ?? false,
    [data.daily_completion]
  );
  // EmotionChange 하단 문구 = AI 요약
  const emotionSummaryText = insight?.summary ?? "";
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

        {showEmotionGraph ? (
          <EmotionChange
            daily={data.daily_completion}
            summaryText={emotionSummaryText}
          />
        ) : (
          // 감정 데이터가 전혀 없을 때의 플레이스홀더
          <View className="px-6 py-8 bg-white rounded-xl">
            <Text className="text-center text-[16px] text-[#3A332A]">
              감정 데이터가 없어요.
            </Text>
          </View>
        )}
        <View className="flex-row gap-[8px] items-center my-4">
          <Ai />
          <Text className="text-[#5F5548] text-xl">AI 주간 분석</Text>
        </View>
        <WeeklyAiAnalyze
          weekStartISO={weekStartISO}
          memberId={memberId}
          // mockData={mockWeeklyInsight} // 주석화 강제 딜레이
          routines={data.routine_performance}
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

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ymd, isFuture, isToday as isTodayY, isPast } from "@features/retrospect/utils";
import { useRetrospectStore } from "@features/retrospect/store/store";
import type { RoutineStatus } from "@features/retrospect/types";
import type { SimpleBottomDrawerRef } from "@features/retrospect/components/SimpleBottomDrawer";

export function useRetrospectPage() {
  const router = useRouter();
  const { date: qd } = useLocalSearchParams<{ date?: string | string[] }>();
  const date = Array.isArray(qd) ? qd[0] : (qd ?? ymd());

  const { data, loading, error, load, cycleStatus, setStatus, updateNote, pickMood, submit } =
    useRetrospectStore();

  useEffect(() => {
    if (isFuture(date, ymd())) {
      Alert.alert("아직 작성할 수 없어요", "오늘 이후의 날짜는 회고를 작성할 수 없습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
      return;
    }
    // 🔧 실서버에선 서버가 해당 날짜의 루틴 목록을 함께 내려주므로
    // getDailyRoutines 인자가 필요 없습니다.
    load(date);
  }, [date, load, router]);

  const baseMode: "view" | "edit" = useMemo(() => {
    if (!data) return "edit";
    if (isPast(date, ymd()) && !isTodayY(date)) return "view";
    return data.submitted ? "view" : "edit";
  }, [data, date]);

  const [manualEditing, setManualEditing] = useState(false);
  useEffect(() => setManualEditing(false), [date, data?.submitted]);

  const effectiveMode: "view" | "edit" = manualEditing ? "edit" : baseMode;
  const canShowEditButton = !!data && isTodayY(date) && data.submitted && effectiveMode === "view";
  const dateIsToday = isTodayY(date);

  const drawerRef = useRef<SimpleBottomDrawerRef>(null);
  const [selected, setSelected] = useState<{
    id: number;
    title: string;
    current?: RoutineStatus;
  } | null>(null);
  const [pending, setPending] = useState<RoutineStatus | null>(null);
  const [pickedIds, setPickedIds] = useState<Set<number>>(new Set());

  const handlePick = (id: number, status: RoutineStatus) => {
    if (setStatus) setStatus(date, id, status);
    else cycleStatus(id);
    setPickedIds((prev) => new Set(prev).add(id));
  };

  const onPressCard = (id: number, title: string, current?: RoutineStatus) => {
    if (effectiveMode === "view") return;
    setSelected({ id, title, current });
    setPending(current ?? null);
    drawerRef.current?.open();
  };

  const onConfirmStatus = (picked: RoutineStatus | null) => {
    if (selected && picked) handlePick(selected.id, picked);
    drawerRef.current?.close();
  };

  const onSubmit = async () => {
    try {
      await Promise.resolve(submit());
      setManualEditing(false);
    } catch (e: any) {
      const body = e?.response?.data as { code?: string; message?: string } | undefined;
      Alert.alert("저장 실패", body?.message ?? "네트워크 또는 서버 오류가 발생했습니다.");
    }
  };

  const onPressBack = () => {
    try {
      if (router.canGoBack()) router.back();
      else router.replace("/home");
    } catch {
      router.replace("/home");
    }
  };

  const enableManualEdit = () => setManualEditing(true);
  const reload = () => load(date);

  return {
    ui: {
      date,
      data,
      loading,
      error,
      effectiveMode,
      canShowEditButton,
      pickedIds,
      dateIsToday,
    },
    handlers: {
      onPressBack,
      onPressCard,
      onConfirmStatus,
      onSubmit,
      enableManualEdit,
      reload,
      updateNote,
      pickMood,
    },
    refs: { drawerRef },
    selected,
    pending,
    setPending,
  };
}

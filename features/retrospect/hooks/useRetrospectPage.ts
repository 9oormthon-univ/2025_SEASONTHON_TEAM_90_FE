// features/retrospect/hooks/useRetrospectPage.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ymd, isFuture, isToday as isTodayY, isPast } from "@features/retrospect/utils";
import { useRoutineStore } from "@features/routine/store/store";
import { useRetrospectStore } from "@features/retrospect/store/store";
import type { RoutineStatus } from "@features/retrospect/types";
import type { SimpleBottomDrawerRef } from "@features/retrospect/components/SimpleBottomDrawer";

export function useRetrospectPage() {
  const router = useRouter();
  const { date: qd } = useLocalSearchParams<{ date?: string | string[] }>();
  const date = Array.isArray(qd) ? qd[0] : (qd ?? ymd());

  const { routines } = useRoutineStore();
  const getDailyRoutines = useCallback(
    () =>
      routines.map((r) => ({ id: r.id, title: r.title, category: (r.category ?? "기타") as any })),
    [routines],
  );

  const { data, loading, error, load, cycleStatus, setStatus, updateNote, pickMood, submit } =
    useRetrospectStore();

  useEffect(() => {
    if (isFuture(date, ymd())) {
      Alert.alert("아직 작성할 수 없어요", "오늘 이후의 날짜는 회고를 작성할 수 없습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
      return;
    }
    load(date, getDailyRoutines);
  }, [date, load, getDailyRoutines, router]);

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
    } catch {}
  };

  const onPressBack = () => router.back();
  const enableManualEdit = () => setManualEditing(true);
  const reload = () => load(date, getDailyRoutines);

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

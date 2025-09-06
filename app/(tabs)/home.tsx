// app/(tabs)/home.tsx
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

// 캘린더 (barrel 사용 시 named export)
import { CalendarView } from "@/features/calendar";

// 루틴 UI
import RoutineBottomSheet from "@/features/routine/components/RoutineBottomSheet";
import AddRoutineModal from "@/features/routine/components/AddRoutineModal";
import EditRoutineModal from "@/features/routine/components/EditRoutineModal";

// 전역 팝업 호스트 (경로 수정)
import PopupHost from "@/features/routine/common/PopupHost";

// 스토어/훅
import { useRoutineStore } from "@/features/routine/store/store";
import { useAddRoutineModal } from "@/features/routine/hooks/useAddRoutineModal";
import { useEditRoutineModal } from "@/features/routine/hooks/useEditRoutineModal";
import { useGrowthCheck } from "@/features/routine/hooks/useGrowthCheck";
import type { AddRoutineForm } from "@/features/routine/types";

export default function HomeScreen() {
  // ✅ selector 이슈 우회: 한 번에 구조분해
  const {
    routines,
    load,
    create: createRoutine,
    update: updateRoutine,
    remove: removeRoutine,
    toggleComplete,
  } = useRoutineStore();

  const growth = useGrowthCheck();

  // BottomSheet ref (버전별 타입 차이 회피)
  const sheetRef = useRef<any>(null);

  // 초기 로드 (store 내부에 hasLoaded/loading 가드 권장)
  useEffect(() => {
    void load();
  }, [load]);

  // 루틴 추가 모달
  const addModal = useAddRoutineModal(async (form: AddRoutineForm) => {
    await createRoutine(form);
    sheetRef.current?.expand?.();
  });

  // 루틴 수정/삭제 모달
  const editModal = useEditRoutineModal(
    async (id, form) => updateRoutine(id, form),
    async (id) => removeRoutine(id),
  );

  return (
    <View style={{ flex: 1 }}>
      <CalendarView variant="month" />

      <RoutineBottomSheet
        ref={sheetRef}
        routines={routines}
        onPressAdd={addModal.open}
        onPressEdit={editModal.open}
        onPressComplete={async (id: number) => {
          await toggleComplete(id);
        }}
        initialIndex={0}
        headerDateText="9월 19일 금요일"
        headerSubtitle="오늘도 차근차근 해나가요!"
      />

      <AddRoutineModal
        visible={addModal.visible}
        onClose={addModal.close}
        onSubmit={addModal.submit}
      />
      <EditRoutineModal
        visible={editModal.visible}
        routine={editModal.target}
        onClose={editModal.close}
        onSubmit={async (id, form) => updateRoutine(id, form)}
        onDelete={async (id) => removeRoutine(id)}
      />

      <PopupHost />
    </View>
  );
}

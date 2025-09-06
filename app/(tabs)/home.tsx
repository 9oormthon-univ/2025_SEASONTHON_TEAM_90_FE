// app/(tabs)/home.tsx
import React, { useEffect, useRef } from "react";
import { View, Button } from "react-native";
import BottomSheet, { type BottomSheetMethods } from "@gorhom/bottom-sheet";

// ✅ 팀원 코드 호환: barrel에서 named export로 가져오기
//    (만약 프로젝트가 default export만 있다면, 아래 줄을
//    `import CalendarView from "@features/calendar/components/CalendarView";` 로 바꿔도 OK)
import { CalendarView } from "@/features/calendar";

import RoutineBottomSheet from "@features/routine/components/RoutineBottomSheet";
import AddRoutineModal from "@features/routine/components/AddRoutineModal";
import EditRoutineModal from "@features/routine/components/EditRoutineModal";

// 전역 팝업 호스트
import PopupHost from "@features/routine/common/PopupHost";

// 스토어/훅
import { useRoutineStore } from "@features/routine/store/store";
import { useAddRoutineModal } from "@features/routine/hooks/useAddRoutineModal";
import { useEditRoutineModal } from "@features/routine/hooks/useEditRoutineModal";
import { useGrowthCheck } from "@features/routine/hooks/useGrowthCheck";
import type { AddRoutineForm } from "@features/routine/types";

export default function HomeScreen() {
  const { routines, load, create, update, remove, toggleComplete } = useRoutineStore();

  // 성장 제안: 화면 진입 시 스캔하여 팝업들을 큐에 enqueue
  const growth = useGrowthCheck();

  // BottomSheet 제어
  const sheetRef = useRef<BottomSheetMethods | null>(null);

  // 초기 로드
  useEffect(() => {
    load();
  }, [load]);

  // (테스트 전용) 하루 제한 리셋 + 즉시 스캔
  // useEffect(() => {
  //   (async () => {
  //     await growth.resetTodayOnce();
  //     await growth.scanNow();
  //   })();
  // }, [growth]);

  // 루틴 추가 모달 훅
  const addModal = useAddRoutineModal(async (form: AddRoutineForm) => {
    await create(form);
    sheetRef.current?.expand();
  });

  // 루틴 수정/삭제 모달 훅
  const editModal = useEditRoutineModal(
    async (id, form) => update(id, form),
    async (id) => remove(id),
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 팀원/너 모두 원하는 캘린더 진입 동작 포함(오늘/과거 진입, 미래 차단은 CalendarView 내부 로직으로 처리됨) */}
      <CalendarView variant="month" />

      <RoutineBottomSheet
        ref={sheetRef as React.RefObject<BottomSheetMethods>}
        routines={routines}
        onPressAdd={addModal.open}
        onPressEdit={editModal.open}
        onPressComplete={async (id: number) => {
          await toggleComplete(id);
          // 완료 직후 별도 팝업 트리거 없음 — 성장 제안은 하루 1회 진입 시 스캔
        }}
        initialIndex={0}
        headerDateText="9월 19일 금요일"
        headerSubtitle="오늘도 차근차근 해나가요!"
      />

      {/* (테스트 전용) 배포 전 제거 권장 */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 8 }}>
        <Button title="Reset Today Limit" onPress={() => growth.resetTodayOnce()} />
        <Button title="Scan Now" onPress={() => growth.scanNow()} />
      </View>

      {/* 추가/수정 모달 */}
      <AddRoutineModal
        visible={addModal.visible}
        onClose={addModal.close}
        onSubmit={addModal.submit}
      />
      <EditRoutineModal
        visible={editModal.visible}
        routine={editModal.target}
        onClose={editModal.close}
        onSubmit={async (id, form) => update(id, form)}
        onDelete={async (id) => remove(id)}
      />

      {/* 전역 팝업 큐 호스트 */}
      <PopupHost />
    </View>
  );
}

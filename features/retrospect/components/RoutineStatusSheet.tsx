// features/retrospect/components/RoutineStatusSheet.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { View, Text, Pressable } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import type { RoutineStatus } from "../types";

export type RoutineStatusSheetRef = {
  open: (item: { id: number; title: string }, current?: RoutineStatus) => void;
  close: () => void;
};

type Props = {
  onPick: (id: number, status: RoutineStatus) => void;
  readonly?: boolean; // 읽기 모드
};

const RoutineStatusSheet = forwardRef<RoutineStatusSheetRef, Props>(({ onPick, readonly }, ref) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const [target, setTarget] = useState<{ id: number; title: string } | null>(null);
  const [current, setCurrent] = useState<RoutineStatus | undefined>(undefined);

  const [useFallback, setUseFallback] = useState(false); // 모달 실패 시 BottomSheet로 폴백
  const [overlay, setOverlay] = useState(false); // 폴백일 때 백드롭 표시

  const snapPoints = useMemo(() => ["40%"], []);

  // --- 공통 옵션/뷰 ---
  const OPTIONS: { key: RoutineStatus; title: string; subtitle: string }[] = [
    { key: "NONE", title: "미완료", subtitle: "오늘은 쉬어가요!" },
    { key: "PARTIAL", title: "부분 완료", subtitle: "어느 정도 완료!" },
    { key: "DONE", title: "완료", subtitle: "전부 완료!" },
  ];

  const Content = (
    <View style={{ padding: 16, gap: 14 }}>
      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
        {target ? `루틴: ${target.title}` : ""}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "900", color: "#3F3429" }}>
        어느 정도 실행하셨나요?
      </Text>
      <Text style={{ color: "#9CA3AF", marginBottom: 6 }}>
        완벽하지 않아도 괜찮아요. 시도한 것만으로도 충분해요!
      </Text>

      {readonly && (
        <View
          style={{
            backgroundColor: "#FFF7ED",
            borderColor: "#FED7AA",
            borderWidth: 1,
            padding: 10,
            borderRadius: 10,
            marginBottom: 4,
          }}
        >
          <Text style={{ color: "#9A3412", fontSize: 12 }}>
            이미 제출된 회고입니다. 상단의 “수정” 버튼을 눌러 편집할 수 있어요.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {OPTIONS.map(({ key, title, subtitle }) => {
          const active = current === key;
          return (
            <Pressable
              key={key}
              testID={`status-${key}`}
              disabled={readonly}
              onPress={() => {
                if (readonly) return;
                if (target) onPick(target.id, key);
                if (useFallback) {
                  sheetRef.current?.close?.();
                  setOverlay(false);
                } else {
                  modalRef.current?.dismiss();
                }
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityState={{ disabled: !!readonly, selected: active }}
              accessibilityLabel={`루틴 상태: ${title}`}
              style={{
                flex: 1,
                borderWidth: 2,
                borderColor: active ? "#6B5B4A" : "#E5E7EB",
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 12,
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                opacity: readonly ? 0.6 : 1,
              }}
            >
              <Text style={{ fontWeight: "800", color: active ? "#6B5B4A" : "#3F3429" }}>
                {title}
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // --- 모달 프레젠트 (실패 시 폴백) ---
  const presentSafely = useCallback(() => {
    // 모달 경로 우선 시도
    let fallbackTimer: any;
    try {
      requestAnimationFrame(() => {
        // 일정 시간 내 index 변경 콜백이 안 오면 폴백
        fallbackTimer = setTimeout(() => {
          setUseFallback(true);
          // 폴백 시트 열기
          setOverlay(true);
          requestAnimationFrame(() => setTimeout(() => sheetRef.current?.expand?.(), 0));
        }, 400); // 400ms 내로 모달이 표시 안 되면 폴백

        modalRef.current?.present?.();
      });
    } catch {
      // 바로 폴백
      setUseFallback(true);
      setOverlay(true);
      requestAnimationFrame(() => setTimeout(() => sheetRef.current?.expand?.(), 0));
    }

    // 모달이 실제로 열렸다면 index 콜백에서 타이머 정리
    const clear = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
    // clear 함수는 onChange에서 호출
    (presentSafely as any).clearTimer = clear;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: (item, curr) => {
        setTarget(item);
        setCurrent(curr);
        setUseFallback(false);
        presentSafely();
      },
      close: () => {
        if (useFallback) {
          sheetRef.current?.close?.();
          setOverlay(false);
        } else {
          modalRef.current?.dismiss();
        }
      },
    }),
    [presentSafely, useFallback],
  );

  const renderBackdrop = useCallback(
    (p: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  return (
    // ✅ 내부에 Provider 포함(포털 루트 보장)
    <BottomSheetModalProvider>
      {/* 모달 경로 */}
      {!useFallback && (
        <BottomSheetModal
          ref={modalRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          keyboardBehavior="extend"
          android_keyboardInputMode="adjustResize"
          onChange={(i) => {
            // 모달이 실제로 열리기 시작하면 폴백 타이머 정리
            if ((presentSafely as any).clearTimer) (presentSafely as any).clearTimer();
          }}
        >
          {Content}
        </BottomSheetModal>
      )}

      {/* 폴백 경로: 포털 없이 같은 화면 트리에 렌더 */}
      {useFallback && (
        <>
          {/* 반투명 백드롭 */}
          {overlay && (
            <Pressable
              onPress={() => {
                sheetRef.current?.close?.();
                setOverlay(false);
              }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
                zIndex: 1,
              }}
            />
          )}

          <View
            pointerEvents="box-none"
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 2 }}
          >
            <BottomSheet
              ref={sheetRef}
              index={-1}
              snapPoints={snapPoints}
              enablePanDownToClose
              onClose={() => setOverlay(false)}
              backgroundStyle={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
              handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}
            >
              {Content}
            </BottomSheet>
          </View>
        </>
      )}
    </BottomSheetModalProvider>
  );
});

RoutineStatusSheet.displayName = "RoutineStatusSheet";
export default RoutineStatusSheet;

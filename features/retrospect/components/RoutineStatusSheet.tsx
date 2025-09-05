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
} from "@gorhom/bottom-sheet";
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
  const [target, setTarget] = useState<{ id: number; title: string } | null>(null);
  const [current, setCurrent] = useState<RoutineStatus | undefined>(undefined);

  const snapPoints = useMemo(() => ["40%"], []);

  const presentSafely = useCallback(() => {
    requestAnimationFrame(() => setTimeout(() => modalRef.current?.present(), 0));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: (item, curr) => {
        setTarget(item);
        setCurrent(curr);
        presentSafely();
      },
      close: () => modalRef.current?.dismiss(),
    }),
    [presentSafely],
  );

  const renderBackdrop = useCallback(
    (p: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  const OPTIONS: { key: RoutineStatus; title: string; subtitle: string }[] = [
    { key: "NONE", title: "미완료", subtitle: "오늘은 쉬어가요!" },
    { key: "PARTIAL", title: "부분 완료", subtitle: "어느 정도 완료!" },
    { key: "DONE", title: "완료", subtitle: "전부 완료!" },
  ];

  return (
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
    >
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
                  modalRef.current?.dismiss();
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
    </BottomSheetModal>
  );
});

RoutineStatusSheet.displayName = "RoutineStatusSheet";
export default RoutineStatusSheet;

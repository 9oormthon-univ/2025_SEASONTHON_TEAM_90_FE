import React, { useCallback, useMemo, useRef } from 'react';
import type { ElementRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

/** BottomSheet 인스턴스 타입 추론 (v5 호환) */
type BottomSheetRef = ElementRef<typeof BottomSheet>;

/** 홈 화면 (샘플)
 * - 상단 버튼으로 Bottom Sheet 열기/스냅/닫기
 * - 시트는 초기 닫힘(index: -1)
 */
export default function Home() {
  const sheetRef = useRef<BottomSheetRef>(null);

  const snapPoints = useMemo(() => ['25%', '50%'], []);
  const open = useCallback(() => sheetRef.current?.expand(), []);
  const close = useCallback(() => sheetRef.current?.close(), []);
  const snapToMiddle = useCallback(() => sheetRef.current?.snapToIndex(1), []);

  return (
    <View className="flex-1">
      <View className="gap-3 p-6">
        <Text className="text-xl font-semibold">Home</Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={open}
            className="items-center justify-center h-10 px-4 bg-black rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Open Bottom Sheet"
          >
            <Text className="text-white">Open Sheet</Text>
          </Pressable>

          <Pressable
            onPress={snapToMiddle}
            className="items-center justify-center h-10 px-4 border rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Snap to 50 percent"
          >
            <Text>Snap 50%</Text>
          </Pressable>

          <Pressable
            onPress={close}
            className="items-center justify-center h-10 px-4 border rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Close Bottom Sheet"
          >
            <Text>Close</Text>
          </Pressable>
        </View>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={-1}                 // 처음엔 닫힘
        snapPoints={snapPoints}    // '25%', '50%'
        enablePanDownToClose       // 아래로 스와이프해 닫기
      >
        <BottomSheetView className="p-6">
          <Text className="text-base">Bottom Sheet Content</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

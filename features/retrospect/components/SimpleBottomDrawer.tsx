// features/common/SimpleBottomDrawer.tsx
import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Dimensions, Pressable, View, Platform, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";

export type SimpleBottomDrawerRef = {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
};

type Props = {
  /** 패널 높이 비율 (0~1). 기본 0.56 (요청하신 디자인에 맞춤) */
  heightPct?: number;
  children: React.ReactNode;
  onClose?: () => void;
  /** 딤 배경색 */
  backdropColor?: string;
  /** 딤 최대 불투명도 (0~1). 기본 0.14 */
  backdropOpacity?: number;
  rounded?: boolean;
  /** 배경 블러 사용 여부 */
  useBlur?: boolean;
  blurIntensity?: number;
  /** 우상단 X 닫기 버튼 표시 (기본 true) */
  showClose?: boolean;
};

const SCREEN_H = Dimensions.get("window").height;

const SimpleBottomDrawer = forwardRef<SimpleBottomDrawerRef, Props>(
  (
    {
      heightPct = 0.56,
      children,
      onClose,
      backdropColor = "rgba(0,0,0,1)",
      backdropOpacity = 0.14,
      rounded = true,
      useBlur = false,
      blurIntensity = 18,
      showClose = true,
    },
    ref,
  ) => {
    const panelH = useMemo(() => Math.round(SCREEN_H * heightPct), [heightPct]);
    const [visible, setVisible] = useState(false);

    // y: 0(열림) ~ panelH(닫힘)
    const translateY = useSharedValue(panelH);
    const backdrop = useSharedValue(0); // 0~1

    const open = () => {
      setVisible(true);
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
      backdrop.value = withTiming(1, { duration: 180 });
    };

    const close = () => {
      translateY.value = withSpring(panelH, { damping: 18, stiffness: 180 }, (finished) => {
        if (finished) runOnJS(setVisible)(false);
      });
      backdrop.value = withTiming(0, { duration: 160 }, (fin) => {
        if (fin && onClose) runOnJS(onClose)();
      });
    };

    useImperativeHandle(
      ref,
      () => ({
        open,
        close,
        isOpen: () => visible,
      }),
      [visible],
    );

    // 드래그로 닫기
    const pan = Gesture.Pan()
      .onChange((e) => {
        const next = Math.min(panelH, Math.max(0, translateY.value + e.changeY));
        translateY.value = next;
        backdrop.value = 1 - next / panelH;
      })
      .onEnd(() => {
        if (translateY.value > panelH * 0.5) {
          runOnJS(close)();
        } else {
          translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
          backdrop.value = withTiming(1, { duration: 120 });
        }
      });

    const panelStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdrop.value * backdropOpacity,
    }));

    if (!visible) return null;

    return (
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      >
        {/* Backdrop (연한 회색/블러) */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
            backdropStyle,
          ]}
        >
          {useBlur ? (
            <BlurView
              intensity={blurIntensity}
              tint={Platform.OS === "ios" ? "light" : "default"}
              style={{ flex: 1 }}
            >
              <Pressable style={{ flex: 1 }} onPress={close} />
            </BlurView>
          ) : (
            <Pressable style={{ flex: 1, backgroundColor: backdropColor }} onPress={close} />
          )}
        </Animated.View>

        {/* Panel */}
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: panelH,
                backgroundColor: "#fff",
                borderTopLeftRadius: rounded ? 16 : 0,
                borderTopRightRadius: rounded ? 16 : 0,
                padding: 16,
                paddingTop: 20, // X 버튼 공간
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: -4 },
                elevation: 10,
              },
              panelStyle,
            ]}
          >
            {/* Grabber + Close */}
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: "#E5E7EB",
                }}
              />
              {showClose && (
                <Pressable
                  onPress={close}
                  hitSlop={10}
                  style={{
                    position: "absolute",
                    right: 4,
                    top: -6,
                    height: 32,
                    width: 32,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="닫기"
                >
                  <Text style={{ fontSize: 20, color: "#9CA3AF" }}>×</Text>
                </Pressable>
              )}
            </View>

            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

SimpleBottomDrawer.displayName = "SimpleBottomDrawer";
export default SimpleBottomDrawer;

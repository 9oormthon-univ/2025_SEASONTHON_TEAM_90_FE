// features/calendar/components/DayCompletionIcon.tsx
import React from 'react';
import { Platform, View, StyleSheet, ViewStyle } from 'react-native';

// SVG 컴포넌트 
import Step0 from '@features/calendar/assets/day-step0.svg';
import Step50 from '@features/calendar/assets/day-step50.svg';
import Step75 from '@features/calendar/assets/day-step75.svg';
import Step100 from '@features/calendar/assets/day-step100.svg';

type Props = {
  value: number | null;   // 0~100 or null
  hasRecord: boolean;
};

// 값 -> 스텝(0/50/75/100)
const mapToStep = (v: number | null | undefined): 0 | 50 | 75 | 100 => {
  if (v == null || v <= 0) return 0;
  if (v < 51) return 50;
  if (v < 76) return 75;
  return 100;
};

// 플랫폼별 드롭섀도우 스타일
const makeShadow = (): ViewStyle =>
  Platform.select<ViewStyle>({
    web: ({ filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.10))' } as any), // [web] CSS 필터
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.10,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 3 },
    },
    android: {
      shadowColor: '#000',
      shadowOpacity: 0.10,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    default: {},
  })!;

const DayCompletionIcon: React.FC<Props> = ({ value, hasRecord}) => {
  const step = mapToStep(value);
  const needsShadow = step !== 0;

  const WrapperStyle = [
    styles.wrap,
    needsShadow ? makeShadow() : null, 
  ];

  const Icon = step === 0 ? Step0 : step === 50 ? Step50 : step === 75 ? Step75 : Step100;

  return (
    <View style={WrapperStyle} accessibilityElementsHidden={!hasRecord}>
      {/* SVG 자체엔 스타일 안 주고, 래퍼에만 그림자 적용 */}
      <Icon  />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    // 배경 없음(투명)
  },
});

export default DayCompletionIcon;

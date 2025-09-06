import React from 'react';
import { Pressable, Text, View } from 'react-native';
import DayCompletionIcon from './DayCompletionIcon';

type Props = {
  day: Date;
  ymd: string;
  inMonth: boolean;
  isToday: boolean;
  completion: number | null;
  hasRecord: boolean;
  onPress: (ymd: string) => void;
};

const CELL_W = 54; // 고정 폭
const CELL_H = 56; // 고정 높이
const CELL_PX = 10; // 좌우 패딩

const DayCell: React.FC<Props> = ({
  day, ymd, inMonth, completion, hasRecord, onPress, isToday,
}) => {
  // 다른 달 날짜는 보이지 않음(자리 유지)
  if (!inMonth) {
    return <View style={{ width: CELL_W, height: CELL_H, paddingHorizontal: CELL_PX }} />;
  }

  const num = day.getDate();

  // 날짜 숫자 렌더
  const numEl = isToday ? (
    // 오늘: 동그라미 배경
    <View
      className="items-center justify-center rounded-full"
      style={{ width: 21, height: 21, backgroundColor: '#816E57' }}
    >
      <Text className="font-choco text-[14px]" style={{ color: '#F7F0DE' }}>{num}</Text>
    </View>
  ) : (
    <Text className="font-choco text-[14px]" style={{ color: '#5F5548' }}>{num}</Text>
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(ymd)}
      className="flex-col items-center justify-between"
      style={{ width: CELL_W, height: CELL_H, paddingHorizontal: CELL_PX }}
    >
      {/* 위쪽: 날짜 */}
      {numEl}

      {/* 아래쪽: 진행도 아이콘 (50/75/100은 섀도우 있음, 0은 없음) */}
      <View style={{ marginBottom: 0 }}>
        <DayCompletionIcon value={completion} hasRecord={hasRecord} />
      </View>
    </Pressable>
  );
};

export default DayCell;

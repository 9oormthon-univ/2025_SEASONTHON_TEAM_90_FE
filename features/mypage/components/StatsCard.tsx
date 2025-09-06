import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
// ✅ mock 데이터 import
import { mockTodayRecord, mockWeeklyStats } from '@/features/mypage/mock/mypage.mock';

const StatsCard = () => {
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);

  useEffect(() => {
    // 오늘 루틴 기록 mock 사용
    const routineRecords = mockTodayRecord.data?.routineRecords ?? [];
    if (routineRecords.length > 0) {
      const maxConsecutive = Math.max(
        ...routineRecords.map((r: any) => r.consecutiveDays ?? 0)
      );
      setConsecutiveDays(maxConsecutive);
    }

    // 주간 대시보드 통계 mock 사용
    const rate = mockWeeklyStats.data?.metrics?.overall?.rate ?? 0;
    setSuccessRate(rate);
  }, []);

  return (
    <View className="flex-row justify-between items-center">
      <View className="items-center flex-1">
        <Text
          className="font-bold text-[22px] leading-[22px] text-black text-center"
          style={{ fontFamily: 'Pretendard' }}
        >
          {consecutiveDays}일
        </Text>
        <Text className="text-xs text-gray-500 mt-1">최대 연속 성공일</Text>
      </View>

      <View style={{ width: 2, height: 70, backgroundColor: '#D8D6CF' }} />

      <View className="items-center flex-1">
        <Text
          className="font-bold text-[22px] leading-[22px] text-center"
          style={{ fontFamily: 'Pretendard', color: '#F8761F' }}
        >
          {successRate}%
        </Text>
        <Text className="text-xs text-gray-500 mt-1">평균 성공률</Text>
      </View>
    </View>
  );
};

export default StatsCard;

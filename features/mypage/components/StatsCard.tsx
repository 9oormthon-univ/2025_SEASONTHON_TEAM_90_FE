import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import client from '@/shared/api/client';

const StatsCard = () => {
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 오늘 루틴 기록
        const todayRes = await client.get('/api/daily-records/today');
        const routineRecords = todayRes.data?.routineRecords ?? [];
        if (routineRecords.length > 0) {
          const maxConsecutive = Math.max(
            ...routineRecords.map((r: any) => r.consecutiveDays ?? 0)
          );
          setConsecutiveDays(maxConsecutive);
        }

        // 주간 대시보드 통계
        const weeklyRes = await client.get('/api/dashboard/weekly/stats');
        const rate = weeklyRes.data?.metrics?.overall?.rate ?? 0;
        setSuccessRate(rate);
      } catch (err: any) {
        console.error('❌ Stats 불러오기 실패:', err.response?.data ?? err);
        Alert.alert('오류', '통계를 불러오는 데 실패했습니다.');
      }
    };

    fetchStats();
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

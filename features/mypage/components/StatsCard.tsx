import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import client from '@/shared/api/client';

interface DailyStat {
  day: number;
  successfulRoutines: number;
  totalRoutines: number;
  successRate: number;
}

interface MonthlyStatsResponse {
  year: number;
  month: number;
  dailyStats: DailyStat[];
}

const StatsCard = () => {
  const [data, setData] = useState<MonthlyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    client
      .get(`/api/daily-records/monthly-stats/${year}/${month}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Text>로딩 중...</Text>;
  if (!data) return <Text>데이터 없음</Text>;

  const stats = data.dailyStats ?? [];

  // 평균 성공률
  const avgRate =
    stats.length > 0
      ? (stats.reduce((sum, s) => sum + s.successRate, 0) / stats.length) * 100
      : 0;

  // 최대 연속 성공일
  let maxStreak = 0;
  let currentStreak = 0;
  stats.forEach((s) => {
    if (s.successRate === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return (
    <View className="flex-row justify-between items-center">
      {/* 최대 연속 성공일 */}
      <View className="items-center flex-1">
        <Text className="font-bold text-[22px]">{maxStreak}일</Text>
        <Text className="text-xs text-gray-500 mt-1">최대 연속 성공일</Text>
      </View>

      <View style={{ width: 1.5, height: 50, backgroundColor: '#D8D6CF' }} />

      {/* 평균 성공률 */}
      <View className="items-center flex-1">
        <Text
          className="font-bold text-[22px]"
          style={{ color: '#F8761F' }}
        >
          {avgRate.toFixed(0)}%
        </Text>
        <Text className="text-xs text-gray-500 mt-1">평균 성공률</Text>
      </View>
    </View>
  );
};

export default StatsCard;
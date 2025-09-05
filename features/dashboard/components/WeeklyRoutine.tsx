import { View, Text } from "react-native";
import type { WeeklyDashboardResponse } from "../types";

export interface WeeklyRoutineProps {
  weekLabel: string;
  completionRate: number;
  routines: WeeklyDashboardResponse["data"]["routine_performance"];
}
/**카테고리 별 컬러 */
const barColorByName = (name: string) => {
  if (name.includes("건강")) return "#71D871";
  if (name.includes("공부")) return "#6BAFF8";
  if (name.includes("문화")) return "#C088E3";
  return "#222";
};

export function WeeklyRoutine({ weekLabel, completionRate, routines }: WeeklyRoutineProps) {
  return (
    <View className="bg-white rounded-2xl">
      <View className="px-[23px] pt-[12px]">
        {/* n월 m째주 */}
        <Text className="text-[16px] mb-[18px]">{weekLabel}</Text>
        <View className="flex-row justify-around border-b border-[#D8D6CF]">
          <View className="pr-[65px] border-r border-[#D8D6CF] pb-[12px] text-center">
            <Text className="text-[25px] font-semibold text-center ">{routines.length}</Text>
            <Text className="text-[#816E57] text-[14px]">총 루틴 수</Text>
          </View>
          <View>
            <Text className="text-[25px] font-semibold text-[#5F5548]">
              {Math.round(completionRate)}%
            </Text>
            <Text className="text-[14px] text-[#816E57]">실행률</Text>
          </View>
        </View>
      </View>

      <View className="px-10 py-10">
        {routines.map((item, idx) => {
          const rate = Math.min(100, Math.max(0, Math.round(item.completion_rate)));
          const color = barColorByName(item.routine_name);

          return (
            <View key={item.routine_id} className={idx === 0 ? "" : "mt-[12px]"}>
              <View className="flex-row items-center justify-around">
                {/* 좌측 점 + 카테고리명 */}
                <View className="flex-row items-baseline mr-[110px]">
                  <View
                    style={{ backgroundColor: color }}
                    className="w-[9px] h-[9px] rounded-full mr-4 "
                  />
                  <Text className="text-sm text-[#3A332A]">{item.routine_name}</Text>
                </View>

                {/* 중앙 바 */}
                <View className="flex-1 mx-2">
                  <View className="h-3 overflow-hidden rounded-full bg-[#D8D6CF]">
                    <View
                      style={{ width: `${rate}%`, backgroundColor: color }}
                      className="h-3 rounded-full"
                    />
                  </View>
                </View>

                {/* 우측 퍼센트 */}
                <Text className="w-10 text-sm font-medium text-right">{rate}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
export default WeeklyRoutine;

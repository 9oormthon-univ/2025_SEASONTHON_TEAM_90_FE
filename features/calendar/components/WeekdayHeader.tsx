import React from "react";
import { View, Text } from "react-native";

// Mon ~ Sun
const W = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WeekdayHeader: React.FC = () => {
  return (
    <View className="flex-row gap-[13px] my-2">
      {W.map((w) => (
        <View key={w} className="items-center p-[10px] ">
          <Text className="font-choco text-[15px]" style={{ color: "#5F5548" }}>
            {w}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default WeekdayHeader;

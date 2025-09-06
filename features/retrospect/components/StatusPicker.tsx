// features/retrospect/components/StatusPicker.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import type { RoutineStatus } from "@features/retrospect/types";
import { SiNone, SiPartial, SiDone, SadSvg, NormalSvg, VHappySvg } from "../icons";

type Props = {
  picked: RoutineStatus | null;
  onChange: (s: RoutineStatus) => void;
};

export default function StatusPicker({ picked, onChange }: Props) {
  const OPTIONS = [
    {
      key: "NONE" as const,
      title: "미완료",
      subtitle: "오늘은 쉬어 가요!",
      Inactive: SiNone,
      Active: SadSvg,
    },
    {
      key: "PARTIAL" as const,
      title: "부분 완료",
      subtitle: "어느 정도 완료했어요!",
      Inactive: SiPartial,
      Active: NormalSvg,
    },
    {
      key: "DONE" as const,
      title: "완료",
      subtitle: "전부 완료했어요!",
      Inactive: SiDone,
      Active: VHappySvg,
    },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
      {OPTIONS.map(({ key, title, subtitle, Inactive, Active }) => {
        const isOn = picked === key;
        const Icon = isOn ? Active : Inactive;
        const titleColor = isOn ? "#3F3429" : "#C7C9CD";
        const subColor = isOn ? "#9CA3AF" : "#D1D5DB";
        const ringBorder = isOn ? "#E7CBAE" : "#E5E7EB";
        const ringBg = isOn ? "#FFF7EE" : "#FFFFFF";

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={{ flex: 1, alignItems: "center", paddingVertical: 6 }}
          >
            <View>
              <Icon width={60} height={60} />
            </View>
            <Text
              style={{
                fontWeight: "900",
                marginTop: 10,
                color: titleColor,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {title}
            </Text>
            <Text style={{ color: subColor, fontSize: 12, textAlign: "center", marginTop: 4 }}>
              {subtitle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

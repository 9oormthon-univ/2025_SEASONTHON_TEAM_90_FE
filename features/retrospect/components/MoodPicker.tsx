// features/retrospect/components/MoodPicker.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import type { Mood } from "../types";

// ✅ SVG 아이콘 import
import SadSvg from "@/features/retrospect/assets/stickers/sad.svg";
import NormalSvg from "@/features/retrospect/assets/stickers/normal.svg";
import HappySvg from "@/features/retrospect/assets/stickers/happy.svg";
import VHappySvg from "@/features/retrospect/assets/stickers/vhappy.svg";

const MOODS: { key: Exclude<Mood, null>; label: string; caption: string; Icon: any }[] = [
  { key: "SAD", label: "낮음", caption: "쉬어가고 싶은 하루예요", Icon: SadSvg },
  { key: "SOSO", label: "보통", caption: "무난히 흘러간 하루예요", Icon: NormalSvg },
  { key: "HAPPY", label: "좋음", caption: "기분이 맑고 좋은 하루예요", Icon: HappySvg },
  { key: "MAD", label: "매우 좋음", caption: "특별히 반짝이는 하루예요", Icon: VHappySvg },
];

type Props = { value: Mood; onChange: (m: Mood) => void; readonly?: boolean };

export default function MoodPicker({ value, onChange, readonly }: Props) {
  if (readonly && value) {
    const m = MOODS.find((x) => x.key === value)!;
    const Icon = m.Icon;
    return (
      <View style={{ alignItems: "center", paddingVertical: 12 }}>
        <Icon width={100} height={100} />
        <Text
          style={{
            fontWeight: "800",
            color: "#3F3429",
            fontSize: 18,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {m.label}
        </Text>
        <Text style={{ color: "#9CA3AF", marginTop: 4, fontSize: 13, textAlign: "center" }}>
          {m.caption}
        </Text>
      </View>
    );
  }

  // 편집 모드: 2열 그리드
  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}
    >
      {MOODS.map((m) => {
        const isOn = value === m.key;
        const Icon = m.Icon;
        return (
          <Pressable
            key={m.key}
            onPress={() => onChange(m.key)}
            style={{
              width: "48%",
              backgroundColor: isOn ? "#F4F1EA" : "#F8FAFC",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: isOn ? "#E6DCCF" : "#E5E7EB",
              alignItems: "center",
            }}
          >
            <Icon width={72} height={72} />
            <Text
              style={{
                fontWeight: "700",
                color: "#3F3429",
                marginTop: 8,
                fontSize: 15,
                textAlign: "center",
              }}
            >
              {m.label}
            </Text>
            <Text style={{ color: "#9CA3AF", marginTop: 4, fontSize: 13, textAlign: "center" }}>
              {m.caption}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

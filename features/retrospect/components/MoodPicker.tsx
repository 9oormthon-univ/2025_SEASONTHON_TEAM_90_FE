// features/retrospect/components/MoodPicker.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import type { Mood } from "../types";

/**
 * 프론트 도메인 키를 서버 명세(HAPPY|SOSO|SAD|MAD)와 통일
 */
const MOODS: { key: Exclude<Mood, null>; label: string; caption: string }[] = [
  { key: "SAD", label: "낮음", caption: "쉬어가고 싶은 하루예요" },
  { key: "SOSO", label: "보통", caption: "무난히 흘러간 하루예요" },
  { key: "HAPPY", label: "좋음", caption: "기분이 맑고 좋은 하루예요" },
  { key: "MAD", label: "매우 좋음", caption: "특별히 반짝이는 하루예요" },
];

type Props = { value: Mood; onChange: (m: Mood) => void; readonly?: boolean };

export default function MoodPicker({ value, onChange, readonly }: Props) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {MOODS.map((m) => {
        const isOn = value === m.key;
        return (
          <Pressable
            key={m.key}
            disabled={readonly}
            onPress={() => onChange(m.key)}
            style={{
              width: "48%",
              backgroundColor: isOn ? "#F4F1EA" : "#F8FAFC",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: isOn ? "#E6DCCF" : "#E5E7EB",
              opacity: readonly ? 0.6 : 1,
            }}
          >
            <Text style={{ fontWeight: "700", color: "#3F3429" }}>{m.label}</Text>
            <Text style={{ color: "#9CA3AF", marginTop: 2, fontSize: 12 }}>{m.caption}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

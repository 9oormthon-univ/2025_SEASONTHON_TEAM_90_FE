// features/retrospect/components/SectionHeader.tsx
import React from "react";
import { View, Text } from "react-native";
import { FireIcon, WriteIcon, SmileIcon } from "../icons";

type Props = { icon: "fire" | "write" | "smile"; title: string };

export default function SectionHeader({ icon, title }: Props) {
  const Icon = icon === "fire" ? FireIcon : icon === "write" ? WriteIcon : SmileIcon;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
      <Icon width={20} height={20} />
      <Text style={{ marginLeft: 8, fontWeight: "800", color: "#3F3429" }}>{title}</Text>
    </View>
  );
}

import React from "react";
import { View, Pressable, Text } from "react-native";

type Props = {
  onGoogle: () => void;
  onKakao: () => void;
  onNaver: () => void;
};

export default function SocialButtons({ onGoogle, onKakao, onNaver }: Props) {
  const Btn = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "#0F172A",
      }}
    >
      <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 12 }}>
      <Btn label="구글로 계속하기" onPress={onGoogle} />
      <Btn label="카카오로 계속하기" onPress={onKakao} />
      <Btn label="네이버로 계속하기" onPress={onNaver} />
    </View>
  );
}

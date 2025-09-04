// features/routine/components/RoutineCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Routine } from "../types";

type Props = {
  routine: Routine;
  onPressEdit: (r: Routine) => void;
};

export default function RoutineCard({ routine, onPressEdit }: Props) {
  const goalUnit = routine.goalType === "time" ? "시간" : "개";
  const goalText = routine.goalValue != null ? ` ${routine.goalValue}${goalUnit}` : "";

  return (
    <View style={s.card}>
      <View style={s.left}>
        <View style={s.titleRow}>
          <Text style={s.title}>{routine.title}</Text>
          <TouchableOpacity
            onPress={() => onPressEdit(routine)}
            hitSlop={10}
            style={{ marginLeft: 6 }}
          >
            <Ionicons name="create-outline" size={16} color="#6B5B4A" />
          </TouchableOpacity>
        </View>
        {!!routine.subtitleHint && <Text style={s.subtitle}>{routine.subtitleHint}</Text>}
      </View>

      {typeof routine.streakDays === "number" && routine.streakDays > 0 && (
        <View style={s.badgeWrap}>
          <Ionicons name="flame" size={18} color="#FF8A00" style={{ marginRight: 6 }} />
          <Text style={s.badgeText}>{routine.streakDays}일 연속!</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#F4F1EA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 88,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  left: { flex: 1, paddingRight: 8 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#3F3429" },
  subtitle: { marginTop: 6, fontSize: 14, color: "#B0A89F" },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1E5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { color: "#F97316", fontWeight: "700", fontSize: 12 },
});

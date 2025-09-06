// features/routine/components/GrowthSuggestionModal.tsx
import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import type { Routine } from "../types";

type Props = {
  visible: boolean;
  routine: Routine | null;
  onClose: () => void;
  onAdjust: (id: number, action: "keep" | "inc" | "dec") => void;
  suggestionKind?: "inc" | "dec" | null;
};

export default function GrowthSuggestionModal({
  visible,
  routine,
  onClose,
  onAdjust,
  suggestionKind,
}: Props) {
  if (!routine) return null;

  const showInc = suggestionKind === "inc";
  const showDec = suggestionKind === "dec";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>성장 모드 제안</Text>
          <Text style={s.desc}>
            {routine.title}
            {"\n"}
            목표를 조정할까요?
          </Text>

          <View style={s.actions}>
            <Pressable style={[s.btn, s.keep]} onPress={() => onAdjust(routine.id, "keep")}>
              <Text style={s.light}>유지</Text>
            </Pressable>

            {showInc && (
              <Pressable style={[s.btn, s.inc]} onPress={() => onAdjust(routine.id, "inc")}>
                <Text style={s.light}>증가</Text>
              </Pressable>
            )}

            {showDec && (
              <Pressable style={[s.btn, s.dec]} onPress={() => onAdjust(routine.id, "dec")}>
                <Text style={s.light}>감소</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// GrowthSuggestionModal.tsx (스타일 부분만 교체)
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: { width: "100%", maxWidth: 320, backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: "800", color: "#5F5548", marginBottom: 10 },
  desc: { fontSize: 15, color: "#111827", marginBottom: 20, textAlign: "center" },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  btn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  keep: { backgroundColor: "#10B981" },
  inc: { backgroundColor: "#3B82F6" },
  dec: { backgroundColor: "#EF4444" },
  light: { fontWeight: "700", color: "#fff" },
});

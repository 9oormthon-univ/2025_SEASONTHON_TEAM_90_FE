// features/routine/components/EditRoutineModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert, // ✅ 추가
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AddRoutineForm, GoalType, Routine } from "../types";

const C = {
  overlay: "rgba(0,0,0,0.55)",
  card: "#FFFFFF",
  label: "#5F5548",
  border: "#E5E7EB",
  text: "#111827",
  placeholder: "#9CA3AF",
  primary: "#6B5B4A",
  primaryText: "#FFFFFF",
  cancel: "#E5E7EB",
  error: "#C2410C",
};

const CATEGORY_OPTIONS = ["운동", "학업", "기타"] as const;

type Errors = Partial<
  Record<"title" | "category" | "goalValue" | "growthPeriodDays" | "growthIncrement", string>
>;

type Props = {
  visible: boolean;
  routine: Routine | null; // 수정 대상
  onClose: () => void;
  onSubmit: (id: number, form: AddRoutineForm) => Promise<void>;
  onDelete: (id: number) => Promise<void>; // ✅ 삭제 콜백 추가
};

export default function EditRoutineModal({ visible, routine, onClose, onSubmit, onDelete }: Props) {
  const [submitting, setSubmitting] = useState(false); // ✅ 중복 방지
  const [deleting, setDeleting] = useState(false);

  // form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  const [growthMode, setGrowthMode] = useState(false);
  const [goalType, setGoalType] = useState<GoalType>("count");
  const onlyDigits = (t: string) => t.replace(/[^\d]/g, "");

  const [goalValue, setGoalValue] = useState("");
  const [period, setPeriod] = useState("");
  const [increment, setIncrement] = useState("");

  const [errors, setErrors] = useState<Errors>({});

  // 대상 바뀌면 초기값 주입
  useEffect(() => {
    if (!routine) return;
    setTitle(routine.title ?? "");
    setCategory(routine.category ?? "");
    setGrowthMode(!!routine.growthMode);
    setGoalType(routine.goalType ?? "count");
    setGoalValue(routine.goalValue != null ? String(routine.goalValue) : "");
    setPeriod(routine.growthPeriodDays != null ? String(routine.growthPeriodDays) : "");
    setIncrement(routine.growthIncrement != null ? String(routine.growthIncrement) : "");
    setErrors({});
    setCatOpen(false);
  }, [routine]);

  const validate = () => {
    const e: Errors = {};
    if (!title.trim()) e.title = "루틴 이름을 입력해 주세요";
    if (!category.trim()) e.category = "카테고리를 선택해 주세요";
    if (growthMode) {
      if (!goalValue) e.goalValue = "목표를 입력해 주세요";
      if (!period) e.growthPeriodDays = "난이도 증가 주기를 입력해 주세요";
      if (!increment) e.growthIncrement = "난이도 증가 수치를 입력해 주세요";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!routine || submitting || deleting) return;
    if (!validate()) return;
    try {
      setSubmitting(true);
      await onSubmit(routine.id, {
        title: title.trim(),
        category: category.trim(),
        growthMode,
        goalType: growthMode ? goalType : undefined,
        goalValue: growthMode ? Number(goalValue) : undefined,
        growthPeriodDays: growthMode ? Number(period) : undefined,
        growthIncrement: growthMode ? Number(increment) : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!routine || submitting || deleting) return;
    Alert.alert(
      "삭제할까요?",
      `‘${routine.title}’ 루틴을 영구 삭제합니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await onDelete(routine.id);
              onClose();
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const Field = ({
    value,
    onChangeText,
    placeholder,
    errorKey,
    keyboardType = "default" as "default" | "number-pad",
  }: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    errorKey?: keyof Errors;
    keyboardType?: "default" | "number-pad";
  }) => {
    const isErr = errorKey ? !!errors[errorKey] : false;
    return (
      <View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={C.placeholder}
          value={value}
          onChangeText={(t) => {
            onChangeText(t);
            if (errorKey && errors[errorKey]) {
              setErrors({ ...errors, [errorKey]: undefined });
            }
          }}
          keyboardType={keyboardType}
          style={{
            borderWidth: 1,
            borderColor: isErr ? C.error : C.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 15,
            color: C.text,
          }}
        />
        {isErr && (
          <Text style={{ color: C.error, marginTop: 6, fontSize: 12 }}>{errors[errorKey!]}</Text>
        )}
      </View>
    );
  };

  const incPlaceholder = goalType === "time" ? "난이도 증가 수치(분)" : "난이도 증가 수치";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{
          flex: 1,
          backgroundColor: C.overlay,
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <View style={{ backgroundColor: C.card, borderRadius: 18, padding: 16 }}>
          {/* 헤더: 제목 + 삭제 */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: C.label, fontWeight: "800", fontSize: 18, flex: 1 }}>
              루틴 수정
            </Text>
            {!!routine && (
              <Pressable
                onPress={handleDelete}
                disabled={submitting || deleting}
                hitSlop={8}
                style={{ opacity: deleting ? 0.5 : 1 }}
              >
                <Text style={{ color: C.error, fontWeight: "700", fontSize: 14 }}>삭제</Text>
              </Pressable>
            )}
          </View>

          <View style={{ gap: 12 }}>
            <Field
              value={title}
              onChangeText={setTitle}
              placeholder="루틴 이름을 입력해 주세요"
              errorKey="title"
            />

            {/* 카테고리 드롭다운 */}
            <View>
              <Pressable
                onPress={() => setCatOpen((v) => !v)}
                style={{
                  borderWidth: 1,
                  borderColor: errors.category ? C.error : C.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: category ? C.text : C.placeholder, fontSize: 15 }}>
                  {category || "카테고리를 선택해 주세요"}
                </Text>
                <Ionicons
                  name={catOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={C.placeholder}
                />
              </Pressable>
              {errors.category && (
                <Text style={{ color: C.error, marginTop: 6, fontSize: 12 }}>
                  {errors.category}
                </Text>
              )}
              {catOpen && (
                <View
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: C.border,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                >
                  {CATEGORY_OPTIONS.map((c, i) => (
                    <Pressable
                      key={c}
                      onPress={() => {
                        setCategory(c);
                        setCatOpen(false);
                        if (errors.category) setErrors({ ...errors, category: undefined });
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderTopWidth: i === 0 ? 0 : 1,
                        borderTopColor: C.border,
                      }}
                    >
                      <Text style={{ fontSize: 15, color: C.text }}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* 성장 모드 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: C.label, fontSize: 15 }}>성장 모드</Text>
              <Switch value={growthMode} onValueChange={setGrowthMode} />
            </View>

            {growthMode && (
              <View style={{ gap: 10 }}>
                {/* 목표 타입 */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => setGoalType("count")}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: C.border,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: goalType === "count" ? "#F5F5F5" : "#fff",
                    }}
                  >
                    <Text>목표 횟수</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setGoalType("time")}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: C.border,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: goalType === "time" ? "#F5F5F5" : "#fff",
                    }}
                  >
                    <Text>목표 시간</Text>
                  </Pressable>
                </View>

                <Field
                  value={goalValue}
                  onChangeText={(t) => setGoalValue(onlyDigits(t))}
                  placeholder="목표를 입력해 주세요"
                  errorKey="goalValue"
                  keyboardType="number-pad"
                />
                <Field
                  value={period}
                  onChangeText={(t) => setPeriod(onlyDigits(t))}
                  placeholder="난이도 증가 주기(일)"
                  errorKey="growthPeriodDays"
                  keyboardType="number-pad"
                />
                <Field
                  value={increment}
                  onChangeText={(t) => setIncrement(onlyDigits(t))}
                  placeholder={incPlaceholder}
                  errorKey="growthIncrement"
                  keyboardType="number-pad"
                />
              </View>
            )}
          </View>

          {/* 버튼 */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting || deleting}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: C.primary,
                alignItems: "center",
                justifyContent: "center",
                opacity: submitting || deleting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {submitting ? "저장 중..." : "수정하기"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              disabled={submitting || deleting}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: C.cancel,
                alignItems: "center",
                justifyContent: "center",
                opacity: submitting || deleting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#A1A1A1", fontWeight: "800" }}>취소</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

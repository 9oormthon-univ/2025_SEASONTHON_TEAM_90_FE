import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
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
  onClose: () => void;
  onSubmit: (f: AddRoutineForm) => void | Promise<void>;
  mode?: "create" | "edit";
  initial?: Partial<Routine>;
};

export default function AddRoutineModal({
  visible,
  onClose,
  onSubmit,
  mode = "create",
  initial,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [catOpen, setCatOpen] = useState(false);

  const [growthMode, setGrowthMode] = useState(!!initial?.growthMode);
  const [goalType, setGoalType] = useState<GoalType>(initial?.goalType ?? "count");

  const onlyDigits = (t: string) => t.replace(/[^\d]/g, "");
  const [goalValue, setGoalValue] = useState(
    initial?.goalValue != null ? String(initial.goalValue) : "",
  );
  const [period, setPeriod] = useState(
    initial?.growthPeriodDays != null ? String(initial.growthPeriodDays) : "",
  );
  const [increment, setIncrement] = useState(
    initial?.growthIncrement != null ? String(initial.growthIncrement) : "",
  );

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false); // ✅ 중복 방지

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

  const submit = async () => {
    if (submitting) {
      console.warn("[AddRoutineModal] button blocked: already submitting");
      return;
    }
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        category: category.trim(),
        growthMode,
        goalType: growthMode ? goalType : undefined,
        goalValue: growthMode ? Number(goalValue) : undefined,
        growthPeriodDays: growthMode ? Number(period) : undefined,
        growthIncrement: growthMode ? Number(increment) : undefined,
      });
      onClose();
    } catch (e: any) {
      console.warn("[AddRoutineModal] onSubmit error", e?.response?.status, e?.response?.data || e);
    } finally {
      setSubmitting(false);
    }
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
            if (errorKey && errors[errorKey]) setErrors({ ...errors, [errorKey]: undefined });
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
          <Text style={{ color: C.label, fontWeight: "800", fontSize: 18, marginBottom: 12 }}>
            {mode === "edit" ? "루틴 수정" : "루틴 추가"}
          </Text>

          <View style={{ gap: 12 }}>
            <Field
              value={title}
              onChangeText={setTitle}
              placeholder="루틴 이름을 입력해 주세요"
              errorKey="title"
            />

            {/* ▼ 카테고리 드롭다운 */}
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
                {/* 목표 타입 토글 */}
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

          {/* 하단 버튼 */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={submit}
              disabled={submitting}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: C.primary,
                alignItems: "center",
                justifyContent: "center",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {submitting ? "추가 중..." : mode === "edit" ? "수정하기" : "추가하기"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: C.cancel,
                alignItems: "center",
                justifyContent: "center",
                opacity: submitting ? 0.6 : 1,
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

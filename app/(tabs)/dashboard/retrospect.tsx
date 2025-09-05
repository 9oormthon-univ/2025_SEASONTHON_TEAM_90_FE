// app/(tabs)/dashboard/retrospect.tsx
import React, { useEffect, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRetrospectStore } from "@features/retrospect/store/store";
import RoutineTickCard from "@features/retrospect/components/RoutineTickCard";
import MoodPicker from "@features/retrospect/components/MoodPicker";
import { todayYMD } from "@features/calendar/utils/date";

export default function RetrospectPage() {
  const { date: qd } = useLocalSearchParams<{ date?: string }>();
  const date = qd ?? todayYMD(); // 파라미터 없으면 오늘
  const { data, loading, load, cycleStatus, updateNote, pickMood, submit } = useRetrospectStore();

  useEffect(() => {
    load(date);
  }, [date, load]);

  const isToday = useMemo(() => date === todayYMD(), [date]);
  const mode: "view" | "edit" = useMemo(() => {
    if (!data) return "edit";
    // 오늘 이전(과거) && submitted -> view
    if (data.submitted) return "view";
    // 오늘인데 아직 미제출 -> edit
    return isToday ? "edit" : "view";
  }, [data, isToday]);

  // 완료 비율 → 불 크기 (캘린더와 동일한 단계 사용 가능)
  const completionRatio = useMemo(() => {
    if (!data) return 0;
    const total = data.routines.length || 1;
    const score = data.routines.reduce(
      (acc, r) => acc + (r.status === "DONE" ? 1 : r.status === "PARTIAL" ? 0.5 : 0),
      0,
    );
    return Math.round((score / total) * 100);
  }, [data]);

  if (loading || !data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16, gap: 18 }}
    >
      {/* 헤더 */}
      <View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#3F3429" }}>{date}</Text>
        <Text style={{ marginTop: 4, color: "#877C70" }}>
          {mode === "view" ? "오늘의 회고" : "각 루틴을 선택하여 완료해 주세요"}
        </Text>
      </View>

      {/* 루틴 리스트 */}
      <View>
        <Text style={{ fontWeight: "800", marginBottom: 8, color: "#3F3429" }}>🦉 오늘의 루틴</Text>
        {data.routines.map((r) => (
          <RoutineTickCard
            key={r.id}
            item={r}
            onToggle={() => cycleStatus(r.id)}
            readonly={mode === "view"}
          />
        ))}
      </View>

      {/* 회고 메모 */}
      <View>
        <Text style={{ fontWeight: "800", marginBottom: 8, color: "#3F3429" }}>✍️ 오늘의 회고</Text>
        <TextInput
          editable={mode === "edit"}
          value={data.note}
          onChangeText={updateNote}
          placeholder="루틴을 진행하며 느낌 점을 적어주세요"
          placeholderTextColor="#B8B8B8"
          multiline
          maxLength={100}
          style={{
            minHeight: 120,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 12,
            color: "#111827",
            backgroundColor: mode === "view" ? "#F8FAFC" : "#fff",
          }}
        />
        <Text style={{ alignSelf: "flex-end", marginTop: 6, color: "#9CA3AF", fontSize: 12 }}>
          {data.note.length}/100
        </Text>
      </View>

      {/* 감정 선택 */}
      <View>
        <Text style={{ fontWeight: "800", marginBottom: 8, color: "#3F3429" }}>🙂 오늘의 기분</Text>
        <MoodPicker value={data.mood} onChange={pickMood} readonly={mode === "view"} />
      </View>

      {/* 저장 버튼 (작성 모드일 때만) */}
      {mode === "edit" && (
        <Pressable
          onPress={submit}
          style={{
            marginTop: 6,
            height: 52,
            borderRadius: 12,
            backgroundColor: "#6B5B4A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>저장하기</Text>
        </Pressable>
      )}

      {/* 완료 불(퍼센트 기반 사이즈 변화는 달력에서 사용, 여기선 수치만 안내) */}
      <Text style={{ alignSelf: "center", marginVertical: 8, color: "#F97316" }}>
        완료도: {completionRatio}%
      </Text>
    </ScrollView>
  );
}

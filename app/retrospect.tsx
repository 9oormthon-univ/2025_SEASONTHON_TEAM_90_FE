// app/(tabs)/dashboard/retrospect.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useRetrospectStore } from "@features/retrospect/store/store";
import RoutineTickCard from "@features/retrospect/components/RoutineTickCard";
import MoodPicker from "@features/retrospect/components/MoodPicker";
import { ymd, isFuture, isToday as isTodayY, isPast } from "@features/retrospect/utils";
import { useRoutineStore } from "@features/routine/store/store";
import RoutineStatusSheet, {
  RoutineStatusSheetRef,
} from "@features/retrospect/components/RoutineStatusSheet";
import type { RoutineStatus } from "@features/retrospect/types";

export default function RetrospectPage() {
  const router = useRouter();
  const { date: qd } = useLocalSearchParams<{ date?: string | string[] }>();
  const date = Array.isArray(qd) ? qd[0] : (qd ?? ymd());

  // 오늘 기준 루틴 스냅샷
  const { routines } = useRoutineStore();
  const getDailyRoutines = () =>
    routines.map((r) => ({ id: r.id, title: r.title, category: (r.category ?? "기타") as any }));

  const {
    data,
    loading,
    error,
    load,
    cycleStatus,
    setStatus, // (date, id, status)
    updateNote,
    pickMood,
    submit,
  } = useRetrospectStore();

  // ✅ 미래 날짜 차단 + 로드
  useEffect(() => {
    if (isFuture(date, ymd())) {
      Alert.alert("아직 작성할 수 없어요", "오늘 이후의 날짜는 회고를 작성할 수 없습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
      return;
    }
    load(date, getDailyRoutines);
  }, [date]);

  // 기본 모드 결정
  const baseMode: "view" | "edit" = useMemo(() => {
    if (!data) return "edit";
    if (isPast(date, ymd()) && !isTodayY(date)) return "view";
    return data.submitted ? "view" : "edit";
  }, [data, date]);

  // "수정"으로 강제 편집 모드 전환
  const [manualEditing, setManualEditing] = useState(false);
  useEffect(() => setManualEditing(false), [date, data?.submitted]);

  const effectiveMode: "view" | "edit" = manualEditing ? "edit" : baseMode;
  const canShowEditButton = !!data && isTodayY(date) && data.submitted && effectiveMode === "view";

  // Bottom Sheet
  const sheetRef = useRef<RoutineStatusSheetRef>(null);

  const handlePick = (id: number, status: RoutineStatus) => {
    if (setStatus) setStatus(date, id, status);
    else cycleStatus(id);
  };

  const onPressCard = (id: number, title: string, current?: RoutineStatus) => {
    if (effectiveMode === "view") return;
    // 타이밍 보정: 다음 프레임에 열기
    requestAnimationFrame(() =>
      setTimeout(() => {
        sheetRef.current?.open({ id, title }, current);
      }, 0),
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ color: "#6b7280", textAlign: "center" }}>
          {error ?? "데이터를 불러오지 못했어요."}
        </Text>
        <Pressable
          onPress={() => load(date, getDailyRoutines)}
          style={{ marginTop: 12, padding: 10, backgroundColor: "#eee", borderRadius: 8 }}
        >
          <Text>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 헤더 */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#3F3429" }}>
            {date} {isTodayY(date) ? "(오늘)" : ""}
          </Text>
          <Text style={{ marginTop: 4, color: "#877C70" }}>
            {effectiveMode === "view" ? "오늘의 회고" : "각 루틴을 선택하여 완료해 주세요"}
          </Text>
        </View>

        {canShowEditButton && (
          <Pressable onPress={() => setManualEditing(true)} hitSlop={8}>
            <Text style={{ color: "#6B5B4A", fontWeight: "800" }}>수정</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        {/* 오늘의 루틴 */}
        <View>
          <Text style={{ fontWeight: "800", marginBottom: 8, color: "#3F3429" }}>
            🦉 오늘의 루틴
          </Text>
          {data.routines.map((r) => (
            <RoutineTickCard
              key={r.id}
              item={r}
              onToggle={() => onPressCard(r.id, r.title, r.status)}
              readonly={effectiveMode === "view"}
              onToggle={() => {
                console.log("card pressed", r.id); // ← 눌릴 때 로그 나와야 정상
                onPressCard(r.id, r.title, r.status);
              }}
            />
          ))}
        </View>

        {/* 오늘의 회고 */}
        <View>
          <Text style={{ fontWeight: "800", marginBottom: 8, color: "#3F3429" }}>
            ✍️ 오늘의 회고
          </Text>
          <TextInput
            editable={effectiveMode === "edit"}
            value={data.note}
            onChangeText={updateNote}
            placeholder="오늘 하루는 어땠나요?"
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
              backgroundColor: effectiveMode === "view" ? "#F8FAFC" : "#fff",
            }}
          />
          <Text style={{ alignSelf: "flex-end", marginTop: 6, color: "#9CA3AF", fontSize: 12 }}>
            {data.note.length}/100
          </Text>
        </View>

        {/* 오늘의 기분 */}
        <View>
          <Text style={{ fontWeight: "800", marginBottom: 8, color: "#3F3429" }}>
            🙂 오늘의 기분
          </Text>
          <MoodPicker value={data.mood} onChange={pickMood} readonly={effectiveMode === "view"} />
        </View>

        {/* 저장 버튼: 작성 모드에서만 */}
        {effectiveMode === "edit" && (
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
      </ScrollView>

      {/* Bottom Sheet (Provider는 루트에만!) */}
      <RoutineStatusSheet ref={sheetRef} onPick={handlePick} />
    </View>
  );
}

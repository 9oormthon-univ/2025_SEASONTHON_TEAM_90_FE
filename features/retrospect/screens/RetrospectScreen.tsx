// features/retrospect/screens/RetrospectScreen.tsx
import React from "react";
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRetrospectPage } from "../hooks/useRetrospectPage";
import RoutineTickCard from "@features/retrospect/components/RoutineTickCard";
import MoodPicker from "@features/retrospect/components/MoodPicker";
import SimpleBottomDrawer from "@features/retrospect/components/SimpleBottomDrawer";
import SectionHeader from "../components/SectionHeader";
import StatusPicker from "../components/StatusPicker";
import { stickerSvgs, ArrowLeft } from "../icons";

export default function RetrospectScreen() {
  const {
    ui, // 로딩/에러/모드 등
    handlers, // onPressBack, onPressCard, onSubmit, onConfirmStatus, setPending
    refs, // drawerRef
    selected,
    pending,
    setPending,
  } = useRetrospectPage();

  if (ui.loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!ui.data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ color: "#6b7280", textAlign: "center" }}>
          {ui.error ?? "데이터를 불러오지 못했어요."}
        </Text>
        <Pressable
          onPress={handlers.reload}
          style={{ marginTop: 12, padding: 10, backgroundColor: "#eee", borderRadius: 8 }}
        >
          <Text>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const { data, effectiveMode, canShowEditButton, pickedIds, dateIsToday } = ui;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 헤더 */}
      <View
        style={{
          marginTop: 12, //
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={handlers.onPressBack} hitSlop={8} style={{ padding: 4 }}>
          <ArrowLeft width={22} height={22} />
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#3F3429" }}>
            {dateIsToday ? "오늘의 회고" : ui.date}
          </Text>
        </View>

        <View style={{ width: 40, alignItems: "flex-end" }}>
          {canShowEditButton && (
            <Pressable onPress={handlers.enableManualEdit} hitSlop={8}>
              <Text style={{ color: "#6B5B4A", fontWeight: "800" }}>수정</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* 본문 */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 오늘의 루틴 */}
        <View>
          <SectionHeader icon="fire" title="오늘의 루틴" />
          {data.routines.map((r) => {
            const isUnset =
              effectiveMode === "edit" &&
              !data.submitted &&
              r.status === "NONE" &&
              !pickedIds.has(r.id);

            return (
              <RoutineTickCard
                key={r.id}
                item={r}
                readonly={effectiveMode === "view"}
                showStatusSticker={effectiveMode === "view"}
                isUnset={isUnset}
                stickerSvgs={stickerSvgs}
                onToggle={() => handlers.onPressCard(r.id, r.title, r.status)}
              />
            );
          })}
        </View>

        {/* 오늘의 회고 */}
        <View>
          <SectionHeader icon="write" title="오늘의 회고" />
          <TextInput
            editable={effectiveMode === "edit"}
            value={data.note}
            onChangeText={handlers.updateNote}
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
          <SectionHeader icon="smile" title="오늘의 기분" />
          <MoodPicker
            value={data.mood}
            onChange={handlers.pickMood}
            readonly={effectiveMode === "view"}
          />
        </View>

        {/* 저장 버튼 (편집 모드에서만) */}
        {effectiveMode === "edit" && (
          <Pressable
            onPress={handlers.onSubmit}
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

      {/* 드로어 (상태 선택) */}
      <SimpleBottomDrawer ref={refs.drawerRef} heightPct={0.68} backdropOpacity={0.14} showClose>
        <View style={{ flex: 1, gap: 16 }}>
          <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
            {selected ? `루틴: ${selected.title}` : ""}
          </Text>

          <Text style={{ fontSize: 24, fontWeight: "900", color: "#3F3429", textAlign: "center" }}>
            어느 정도 실행하셨나요?
          </Text>
          <Text style={{ color: "#9CA3AF", textAlign: "center" }}>
            완벽하지 않아도 괜찮아요. 시도한 것만으로도 충분해요!
          </Text>

          {/* 옵션 (선택만) */}
          <StatusPicker picked={pending} onChange={setPending} />

          {/* 확인 버튼 하단 고정 */}
          <Pressable
            disabled={!pending}
            onPress={() => handlers.onConfirmStatus(pending)}
            style={{
              marginTop: "auto",
              height: 52,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pending ? "#6B5B4A" : "#D8D8D8",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>확인</Text>
          </Pressable>
        </View>
      </SimpleBottomDrawer>
    </View>
  );
}

import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import TopBar from "@/components/Common/TopBar";
import { useRouter } from "expo-router";

export default function NotificationSettings() {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const [morningStart, setMorningStart] = useState(new Date(2025, 0, 1, 8, 0));
  const [morningEnd, setMorningEnd] = useState(new Date(2025, 0, 1, 10, 0));
  const [afternoonStart, setAfternoonStart] = useState(new Date(2025, 0, 1, 14, 0));
  const [afternoonEnd, setAfternoonEnd] = useState(new Date(2025, 0, 1, 20, 0));

  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    "morningStart" | "morningEnd" | "afternoonStart" | "afternoonEnd" | null
  >(null);

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleTimeChange = (_: any, selectedDate?: Date) => {
    if (selectedDate && pickerTarget) {
      if (pickerTarget === "morningStart") setMorningStart(selectedDate);
      if (pickerTarget === "morningEnd") setMorningEnd(selectedDate);
      if (pickerTarget === "afternoonStart") setAfternoonStart(selectedDate);
      if (pickerTarget === "afternoonEnd") setAfternoonEnd(selectedDate);
    }
    setShowPicker(false);
  };

  return (
    <View className="flex-1 bg-[#F7F3EB]">
      {/* TopBar */}
      <TopBar
        title="알림 설정"
        bgColor="#F7F3EB"
        style={{ marginTop: 37 }}
        onBackPress={() => router.back()}
      />

      <View className="p-4">
        {/* 푸시 알림 */}
        <View className="bg-[#F7F7F7] rounded-2xl p-5 mb-4 flex-row justify-between items-center">
          <Text
            style={{
              fontFamily: "Inter",
              fontWeight: "500",
              fontSize: 17,
              lineHeight: 20,
              textAlignVertical: "center",
            }}
          >
            푸시 알림
          </Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            thumbColor={pushEnabled ? "#5F5548" : "#f4f3f4"}
            trackColor={{ false: "#d1d5db", true: "#CBC9C2" }}
          />
        </View>

        {/* 리마인드 알림 */}
        <View className="bg-[#F7F7F7] rounded-2xl">
          {/* 리마인드 헤더 */}
          <View
            className="flex-row justify-between items-center p-5"
            style={{ borderBottomWidth: 1, borderBottomColor: "#F4EFE3CC" }}
          >
            <Text
              style={{
                fontFamily: "Inter",
                fontWeight: "400",
                fontSize: 17,
                lineHeight: 20,
                textAlignVertical: "center",
              }}
            >
              리마인드 알림
            </Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              thumbColor={reminderEnabled ? "#5F5548" : "#f4f3f4"}
              trackColor={{ false: "#d1d5db", true: "#CBC9C2" }}
            />
          </View>

          {reminderEnabled && (
            <View>
              {/* 오전 */}
              <View
                className="flex-row justify-between items-center px-5 py-4"
                style={{ borderBottomWidth: 1, borderBottomColor: "#F4EFE3CC" }}
              >
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontWeight: "400",
                    fontSize: 14,
                    lineHeight: 20,
                    textAlignVertical: "center",
                  }}
                >
                  오전
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="bg-[#EFECE4] px-4 py-2 rounded-md mx-1"
                    onPress={() => {
                      setPickerTarget("morningStart");
                      setShowPicker(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-[#5F5548]">
                      {formatTime(morningStart)}
                    </Text>
                  </TouchableOpacity>
                  <Text>-</Text>
                  <TouchableOpacity
                    className="bg-[#EFECE4] px-4 py-2 rounded-md mx-1"
                    onPress={() => {
                      setPickerTarget("morningEnd");
                      setShowPicker(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-[#5F5548]">
                      {formatTime(morningEnd)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 오후 */}
              <View className="flex-row justify-between items-center px-5 py-4">
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontWeight: "400",
                    fontSize: 14,
                    lineHeight: 20,
                    textAlignVertical: "center",
                  }}
                >
                  오후
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    className="bg-[#EFECE4] px-4 py-2 rounded-md mx-1"
                    onPress={() => {
                      setPickerTarget("afternoonStart");
                      setShowPicker(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-[#5F5548]">
                      {formatTime(afternoonStart)}
                    </Text>
                  </TouchableOpacity>
                  <Text>-</Text>
                  <TouchableOpacity
                    className="bg-[#EFECE4] px-4 py-2 rounded-md mx-1"
                    onPress={() => {
                      setPickerTarget("afternoonEnd");
                      setShowPicker(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-[#5F5548]">
                      {formatTime(afternoonEnd)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 시간 선택 피커 */}
      {showPicker && (
        <DateTimePicker
          value={
            pickerTarget === "morningStart"
              ? morningStart
              : pickerTarget === "morningEnd"
              ? morningEnd
              : pickerTarget === "afternoonStart"
              ? afternoonStart
              : afternoonEnd
          }
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}
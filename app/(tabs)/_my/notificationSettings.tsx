import React, { useState, useEffect } from "react";
import { View, Text, Switch, Alert, Platform } from "react-native";
import TopBar from "@/components/Common/TopBar";
import { useRouter } from "expo-router";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import notifee, { TriggerType, RepeatFrequency, TimestampTrigger } from "@notifee/react-native";
import client from "@/shared/api/client";

async function getPermanentDeviceId() {
  if (Platform.OS === "android") return await DeviceInfo.getAndroidId();
  if (Platform.OS === "ios") return await DeviceInfo.getVendorId();
  return DeviceInfo.getUniqueId();
}

export default function NotificationSettings() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const initFCM = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          Alert.alert("알림 권한이 거부되었습니다.");
          return;
        }

        const token = await messaging().getToken();
        setFcmToken(token);

        const deviceId = await getPermanentDeviceId();
        await client.post("/api/notifications/tokens", { token, deviceId });

        setPushEnabled(true);
        console.log("✅ 토큰 등록 완료:", { token, deviceId });
      } catch (err) {
        console.error("❌ FCM 초기화 실패:", err);
      }
    };
    initFCM();
  }, []);

  const scheduleDailyNotifications = async () => {
    const now = new Date();

    const morning = new Date(now);
    morning.setHours(8, 0, 0, 0);
    if (morning <= now) morning.setDate(morning.getDate() + 1);

    const morningTrigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: morning.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };
    await notifee.createTriggerNotification({ title: "굿모닝 ☀️", body: "아침 8시 알림입니다!" }, morningTrigger);

    const evening = new Date(now);
    evening.setHours(22, 0, 0, 0);
    if (evening <= now) evening.setDate(evening.getDate() + 1);

    const eveningTrigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: evening.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };
    await notifee.createTriggerNotification({ title: "굿나잇 🌙", body: "저녁 10시 알림입니다!" }, eveningTrigger);
  };

  const togglePush = async (value: boolean) => {
    setPushEnabled(value);
    if (value) {
      if (fcmToken) {
        const deviceId = await getPermanentDeviceId();
        await client.post("/api/notifications/tokens", { token: fcmToken, deviceId });
        console.log("✅ 푸시 알림 활성화:", fcmToken);
        await scheduleDailyNotifications();
      }
    } else {
      if (fcmToken) {
        await client.delete(`/api/notifications/tokens/${fcmToken}`);
        console.log("❌ 푸시 알림 비활성화:", fcmToken);
        await notifee.cancelAllNotifications();
      }
    }
  };

  return (
    <View className="flex-1 bg-[#F7F3EB]">
      <TopBar title="알림 설정" bgColor="#F7F3EB" style={{ marginTop: 37 }} onBackPress={() => router.back()} />
      <View className="p-4">
        <View className="bg-[#F7F7F7] rounded-2xl p-5 mb-4 flex-row justify-between items-center">
          <Text style={{ fontFamily: "Inter", fontWeight: "500", fontSize: 17 }}>푸시 알림</Text>
          <Switch
            value={pushEnabled}
            onValueChange={togglePush}
            thumbColor={pushEnabled ? "#5F5548" : "#f4f3f4"}
            trackColor={{ false: "#d1d5db", true: "#CBC9C2" }}
          />
        </View>
      </View>
    </View>
  );
}

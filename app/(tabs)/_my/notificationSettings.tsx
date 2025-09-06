import React, { useState, useEffect } from "react";
import { View, Text, Switch, Alert, Platform } from "react-native";
import TopBar from "@/components/Common/TopBar";
import { useRouter } from "expo-router";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import axios from "axios";
import notifee, { TriggerType, TimestampTrigger } from "@notifee/react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

// 기기 고유 ID (앱 재설치해도 유지)
async function getPermanentDeviceId() {
  if (Platform.OS === "android") {
    return await DeviceInfo.getAndroidId();
  } else if (Platform.OS === "ios") {
    return await DeviceInfo.getVendorId();
  } else {
    return DeviceInfo.getUniqueId();
  }
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

        // ✅ FCM 토큰 발급
        const token = await messaging().getToken();
        setFcmToken(token);

        // ✅ 기기 고유 ID
        const deviceId = await getPermanentDeviceId();

        // ✅ 서버 등록
        await axios.post(`${API_BASE_URL}/api/notifications/tokens`, {
          token,
          deviceId,
        });

        setPushEnabled(true);
        console.log("✅ 토큰 등록 완료:", { token, deviceId });
      } catch (err) {
        console.error("❌ FCM 초기화 실패:", err);
      }
    };

    initFCM();
  }, []);

  // ✅ 알림 예약 (아침 8시, 저녁 10시)
  const scheduleDailyNotifications = async () => {
    const now = new Date();

    // 아침 8시
    const morning = new Date(now);
    morning.setHours(8, 0, 0, 0);
    if (morning <= now) morning.setDate(morning.getDate() + 1);

    const morningTrigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: morning.getTime(),
      repeatFrequency: "DAILY",
    };

    await notifee.createTriggerNotification(
      {
        title: "굿모닝 ☀️",
        body: "아침 8시 알림입니다!",
      },
      morningTrigger
    );

    // 저녁 10시
    const evening = new Date(now);
    evening.setHours(22, 0, 0, 0);
    if (evening <= now) evening.setDate(evening.getDate() + 1);

    const eveningTrigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: evening.getTime(),
      repeatFrequency: "DAILY",
    };

    await notifee.createTriggerNotification(
      {
        title: "굿나잇 🌙",
        body: "저녁 10시 알림입니다!",
      },
      eveningTrigger
    );
  };

  // ✅ 스위치 on/off
  const togglePush = async (value: boolean) => {
    setPushEnabled(value);
    if (value) {
      if (fcmToken) {
        const deviceId = await getPermanentDeviceId();
        await axios.post(`${API_BASE_URL}/api/notifications/tokens`, {
          token: fcmToken,
          deviceId,
        });
        console.log("✅ 푸시 알림 활성화:", fcmToken);

        // 알림 스케줄링 실행
        await scheduleDailyNotifications();
      }
    } else {
      if (fcmToken) {
        await axios.delete(`${API_BASE_URL}/api/notifications/tokens/${fcmToken}`);
        console.log("❌ 푸시 알림 비활성화:", fcmToken);

        // notifee의 예약 알림 취소
        await notifee.cancelAllNotifications();
      }
    }
  };

  return (
    <View className="flex-1 bg-[#F7F3EB]">
      <TopBar
        title="알림 설정"
        bgColor="#F7F3EB"
        style={{ marginTop: 37 }}
        onBackPress={() => router.back()}
      />

      <View className="p-4">
        <View className="bg-[#F7F7F7] rounded-2xl p-5 mb-4 flex-row justify-between items-center">
          <Text style={{ fontFamily: "Inter", fontWeight: "500", fontSize: 17 }}>
            푸시 알림
          </Text>
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

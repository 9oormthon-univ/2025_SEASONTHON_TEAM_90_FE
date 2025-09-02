import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface TopBarProps {
  title?: string;
  rightTitle?: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  bgColor?: string;
}

export default function TopBar({
  title = "",
  rightTitle,
  onBackPress,
  onRightPress,
  style,
  bgColor = "#fff",
}: TopBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  /** 기본 뒤로가기 */
  const handleBack = () => {
    if (onBackPress) return onBackPress();
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };
  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: bgColor }, 
      ]}
    >
      <View style={[styles.container, style]}>
        <TouchableOpacity onPress={handleBack} style={styles.leftButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        {rightTitle ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            <Text style={styles.title}>{rightTitle}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
  },
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "transparent", 
  },
  leftButton: { marginRight: 16 },
  rightButton: { marginLeft: "auto" },
  title: { fontSize: 18, fontWeight: "700" },
});

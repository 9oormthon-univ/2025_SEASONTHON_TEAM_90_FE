import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface TopBarProps {
  title?: string;
  rightTitle?: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
}

export default function TopBar({
  title = "",
  rightTitle,
  onBackPress,
  onRightPress,
  style,
}: TopBarProps) {
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "white" }}>
      <View style={[styles.container, style]}>
        {/* 왼쪽: 뒤로가기 */}
        <TouchableOpacity onPress={onBackPress} style={styles.leftButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* 가운데: 타이틀 (실제로는 왼쪽 옆에 위치) */}
        <Text style={styles.title}>{title}</Text>

        {/* 오른쪽: 버튼 */}
        {rightTitle ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            <Text style={styles.title}>{rightTitle}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    marginTop:45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
  },
  leftButton: {
    marginRight: 32, // 버튼과 타이틀 사이 간격
  },
  rightButton: {
    marginLeft: "auto", // 오른쪽 끝으로 밀기
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});

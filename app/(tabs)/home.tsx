import { View, Text } from "react-native";
import Colors from "@/constants/Colors";
import { CalendarView } from "@/features/calendar";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
      }}
    >
      <Text style={{ color: Colors.brandPrimary, fontSize: 18 }}>홈 화면</Text>\
    </View>
  );
}

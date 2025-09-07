// features/routine/components/RoutineBottomSheet.tsx
import React, { forwardRef, useMemo } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import RoutineCard from "./RoutineCard";
import type { Routine } from "../types";

type Props = {
  routines: Routine[];
  onPressComplete?: (id: number) => void | Promise<void>;
  onPressAdd: () => void;
  onPressEdit: (r: Routine) => void;
  initialIndex?: number;
  snapPoints?: (string | number)[];
  headerDateText?: string;
  headerSubtitle?: string;
};

const RoutineBottomSheet = forwardRef<BottomSheet, Props>(
  (
    {
      routines,
      onPressAdd,
      onPressEdit,
      initialIndex = 0,
      snapPoints,
      headerDateText,
      headerSubtitle,
    },
    ref,
  ) => {
    const points = useMemo(() => snapPoints ?? ["18%", "56%", "92%"], [snapPoints]);

    return (
      <BottomSheet
        ref={ref}
        index={initialIndex}
        snapPoints={points}
        enablePanDownToClose={false}
        handleIndicatorStyle={{ width: 60, backgroundColor: "#e5e7eb" }}
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          {(headerDateText || headerSubtitle) && (
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 }}>
              {!!headerDateText && (
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#3F3429" }}>
                  {headerDateText}
                </Text>
              )}
              {!!headerSubtitle && (
                <Text style={{ marginTop: 4, fontSize: 14, color: "#877C70" }}>
                  {headerSubtitle}
                </Text>
              )}
            </View>
          )}

          <FlatList
            data={routines}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, rowGap: 12, paddingBottom: 36 }}
            renderItem={({ item }) => <RoutineCard routine={item} onPressEdit={onPressEdit} />}
            ListFooterComponent={
              <View style={{ alignItems: "center", marginTop: 14, marginBottom: 10 }}>
                <Pressable
                  onPress={onPressAdd}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#F4F1EA",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.07)",
                  }}
                >
                  <Ionicons name="add" size={22} color="#6B5B4A" />
                </Pressable>
              </View>
            }
          />
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default RoutineBottomSheet;
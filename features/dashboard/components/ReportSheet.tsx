import { View, Text, TouchableOpacity } from "react-native";
import LeftArrow from "@/features/dashboard/assets/left-arrow.svg";
import RightArrow from "@/features/dashboard/assets/right-arrow.svg";
import { BlurView } from "expo-blur";

export interface ReportSheetProps {
    visible: boolean;
    label: string;
    canPrev: boolean;
    canNext: boolean;
    onPrev?: () => void;
    onNext?: () => void;
}

export default function ReportSheet({
    visible, label, canPrev, canNext, onPrev, onNext,
}: ReportSheetProps) {
    if (!visible) return null;

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 100,
                alignItems: "center",
                zIndex: 50,
            }}
        >
            <BlurView
                intensity={12}
                tint="light"
                style={{
                    width: "100%",
                    height: 64,
                    overflow: "hidden",
                    backgroundColor: "rgba(244, 239, 227, 0.80)",
                }}
            >
                <View className="flex items-center self-stretch justify-center h-16 ">
                    <View className="flex-row items-center gap-[70px]">
                        {canPrev ? (
                            <TouchableOpacity onPress={onPrev} className="">
                                <View className="h-[24px] w-[24px] bg-[#816E57CC] rounded-full flex justify-center items-center">
                                    <LeftArrow />
                                </View>
                            </TouchableOpacity>
                        ) : <View className="w-5" />}

                        <Text className="text-xl ">{label}</Text>

                        {canNext ? (
                            <TouchableOpacity onPress={onNext} className="ml-2">
                                <View className="h-[24px] w-[24px] bg-[#816E57CC] rounded-full flex justify-center items-center">
                                    <RightArrow />
                                </View>
                            </TouchableOpacity>
                        ) : <View className="w-5" />}
                    </View>
                    {/* 우측 날짜 등 필요 시 삽입 */}
                </View>
            </BlurView>
        </View>
    );
}

import { View } from "react-native";
import Step0 from "@features/calendar/assets/day-step0.svg";
import Step50 from "@features/calendar/assets/day-step50.svg";
import Step75 from "@features/calendar/assets/day-step75.svg";
import Step100 from "@features/calendar/assets/day-step100.svg";

type Props = {
  value: number | null; // 0~100, null은 미기록
  hasRecord: boolean;
  size?: number;
};

const Dot = ({ size = 8 }: { size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size }} className="bg-neutral-300" />
);

export default function DayCompletionIcon({ value, hasRecord, size = 20 }: Props) {
  if (!hasRecord || value == null) {
    return <Dot size={8} />; // 미기록: 점 표시 유지
  }
  const v = Math.max(0, Math.min(100, Math.round(value)));
  if (v === 0) return <Step0 />;
  if (v <= 50) return <Step50 />;
  if (v <= 75) return <Step75 />;
  return <Step100 />;
}

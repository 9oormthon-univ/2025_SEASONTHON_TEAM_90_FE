// 1) 현재 주 시작(월요일) ISO 계산 유틸
import { startOfWeek, format } from "date-fns";

const getCurrentWeekStartISO = () =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

// 2) 상태 초기값: mockCurrentWeek 대신 실시간 현재 주 사용
const [weekStartISO, setWeekStartISO] = useState<string>(() => getCurrentWeekStartISO());

// 3) canNext 비교 기준도 실시간 현재 주로
const currentWeekISO = useMemo(() => getCurrentWeekStartISO(), []);
const canNext = useMemo(
    () => parseISO(weekStartISO) < parseISO(currentWeekISO),
    [weekStartISO, currentWeekISO]
);

// 4) 라벨 계산은 그대로
const weekLabel = getWeekLabel(weekStartISO);
const reportLabel = getReportLabel(weekStartISO);

import React, { useMemo } from 'react';
import { View } from 'react-native';
import DayCell from './DayCell';
import WeekdayHeader from './WeekdayHeader';
import { todayYMD } from '../utils/date';

type Meta = {
    ymd: string;
    inMonth: boolean;
    isToday: boolean;
    aggregate?: { avgCompletion: number | null; hasRecord: boolean };
};

type Props = {
    matrix: Date[][];
    getDayMeta: (d: Date) => Meta;
    onSelectDate: (ymd: string) => void;
    variant?: 'month' | 'week'; // ← [추가] 모달 등 축소 환경에서 'week'
};

/** 캘린더 그리드 렌더 */
const CalendarGrid: React.FC<Props> = ({ matrix, getDayMeta, onSelectDate, variant = 'month' }) => {
    // 주간 모드: 오늘이 포함된 주만 렌더
    const filtered = useMemo(() => {
        if (variant === 'month') return matrix;
        const today = todayYMD();
        const row = matrix.find((week) => week.some((d) => {
            const meta = getDayMeta(d);
            return meta.ymd === today;
        }));
        return row ? [row] : matrix.slice(0, 1); // 오늘 주 없으면 1행만
    }, [matrix, variant, getDayMeta]);
    // 모달로 띄울 시 아래 같이 사용하시면 한 행만 띄울 수 있습니다.
    // <Modal> 
    //     <CalendarView variant="week" />
    // </Modal>

    return (
        <View className="px-[16px]">
            <WeekdayHeader />
            {filtered.map((week, wi) => (
                <View key={wi} className="flex-row my-1">
                    {week.map((d, di) => {
                        const meta = getDayMeta(d);
                        return (
                            <DayCell
                                key={di}
                                day={d}
                                ymd={meta.ymd}
                                inMonth={meta.inMonth}
                                isToday={meta.isToday}
                                completion={meta.aggregate?.avgCompletion ?? null}
                                hasRecord={!!meta.aggregate?.hasRecord}
                                onPress={onSelectDate}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
};


export default CalendarGrid;
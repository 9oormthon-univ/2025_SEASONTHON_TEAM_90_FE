import React from 'react';
import { View } from 'react-native';
import DayCell from './DayCell';


interface Props {
    matrix: Date[][];
    getDayMeta: (d: Date) => { ymd: string; inMonth: boolean; aggregate?: any };
    onSelectDate?: (ymd: string) => void;
}


/** 6x7 그리드 렌더 (FlatList 최적화는 Step 2/3에서 고려) */
const CalendarGrid: React.FC<Props> = ({ matrix, getDayMeta, onSelectDate }) => {
    return (
        <View>
            {matrix.map((week, wi) => (
                <View key={wi} className="flex-row">
                    {week.map((d, di) => {
                        const meta = getDayMeta(d);
                        return (
                            <View key={di} className="flex-1">
                                <DayCell
                                    ymd={meta.ymd}
                                    day={d.getDate()}
                                    inMonth={meta.inMonth}
                                    aggregate={meta.aggregate}
                                    onPress={onSelectDate}
                                />
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};


export default CalendarGrid;
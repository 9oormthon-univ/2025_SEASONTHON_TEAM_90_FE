/** 날짜/달 계산 유틸 (로컬 타임존 기준) */
/** 0 padding */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** YYYY-MM */
export const toMonth = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

/** YYYY-MM-DD */
export const toYMD = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** parse YYYY-MM -> Date(로컬 1일) */
export const monthToDate = (month: string): Date => {
    const [y, m] = month.split('-').map((v) => parseInt(v, 10));
    return new Date(y, m - 1, 1);
};

export const addMonths = (month: string, delta: number): string => {
    const base = monthToDate(month);
    return toMonth(new Date(base.getFullYear(), base.getMonth() + delta, 1));
};

/**
* 6x7 달력 매트릭스 (앞/뒤 달 포함).
* weekStartsOn: 0=Sun, 1=Mon
*/
export const getMonthMatrix = (month: string, weekStartsOn: 0 | 1 = 0): Date[][] => {
    const first = monthToDate(month);
    const firstWeekday = first.getDay();
    const lead = (firstWeekday - weekStartsOn + 7) % 7; // 앞쪽 채우기 개수


    const matrix: Date[][] = [];
    let cursor = new Date(first.getFullYear(), first.getMonth(), 1 - lead);


    for (let w = 0; w < 6; w++) {
        const week: Date[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        matrix.push(week);
    }
    return matrix;
};

export const isSameMonth = (month: string, d: Date): boolean => {
    const [y, m] = month.split('-').map((v) => parseInt(v, 10));
    return d.getFullYear() === y && d.getMonth() + 1 === m;
};


export const todayYMD = (): string => toYMD(new Date());
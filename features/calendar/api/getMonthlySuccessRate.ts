import type { MonthlySuccessRateDto, GetMonthlySuccessRateResponse } from '../types';
import client from '@/shared/api/client'; // ← [REAL] 사용 시 주석 해제

// // --- [REAL API] 실제 서버 사용 시 이 함수로 교체 ---
// export const getMonthlySuccessRate = async (
//     month: string,
//     signal?: AbortSignal
// ): Promise<MonthlySuccessRateDto> => {
//     const res = await client.get('/api/records/monthly-success-rate', { params: { month }, signal });
//     return (res.data as GetMonthlySuccessRateResponse).data;
// };


// --- MOCK helpers ---
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const daysIn = (month: string) => {
    const [y, m] = month.split('-').map((v) => parseInt(v, 10));
    return new Date(y, m, 0).getDate();
};
const pattern = [0, 50, 75, 100];

const makeMonthlySuccessRateMock = (month: string): MonthlySuccessRateDto => {
    const n = daysIn(month);
    return {
        month,
        daily_success_rates: Array.from({ length: n }, (_, i) => ({
            date: `${month}-${pad2(i + 1)}`,
            success_rate: pattern[i % pattern.length],
        })),
    };
};

// RN(Android)에는 DOMException이 없으므로 대체 에러 팩토리 사용
const abortError = () => {
    const err = new Error('Aborted');
    err.name = 'AbortError';
    return err;
};

// abort 신호를 지원하는 sleep 유틸
const sleepWithAbort = (ms: number, signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        if (signal?.aborted) return reject(abortError());
        const t = setTimeout(resolve, ms);
        if (signal) {
            const onAbort = () => {
                clearTimeout(t);
                reject(abortError());
            };
            signal.addEventListener('abort', onAbort, { once: true });
        }
    });

// --- [현재 활성] MOCK 호출 ---
export const getMonthlySuccessRate = async (
    month: string,
    signal?: AbortSignal
): Promise<MonthlySuccessRateDto> => {
    // [수정] DOMException 대신 sleepWithAbort 사용
    await sleepWithAbort(200, signal);
    return makeMonthlySuccessRateMock(month);
};





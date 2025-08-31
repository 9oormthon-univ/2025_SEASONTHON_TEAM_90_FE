// MOCK-first 구현 (실 서버 준비되면 맨 아래 REAL 버전으로 스왑)
// ※ 실제 API 코드는 주석으로 포함되어 있음

import type { MonthlySuccessRateDto, GetMonthlySuccessRateResponse } from '../types';
// import client from '@/shared/api/client'; // ← [REAL] 사용 시 주석 해제

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

// --- [현재 활성] MOCK 호출 ---
export const getMonthlySuccessRate = async (
    month: string,
    signal?: AbortSignal
): Promise<MonthlySuccessRateDto> => {
    await new Promise<void>((r, j) => {
        const t = setTimeout(r, 200);
        if (signal) {
            const onAbort = () => {
                clearTimeout(t);
                j(new DOMException('Aborted', 'AbortError'));
            };
            if (signal.aborted) return onAbort();
            signal.addEventListener('abort', onAbort, { once: true });
        }
    });
    return makeMonthlySuccessRateMock(month);
};

/*
//// --- [REAL API] 실제 서버 사용 시 이 함수로 교체 ---
export const getMonthlySuccessRate = async (
  month: string,
  signal?: AbortSignal
): Promise<MonthlySuccessRateDto> => {
  const res = await client.get('/records/monthly-success-rate', { params: { month }, signal });
  return (res.data as GetMonthlySuccessRateResponse).data;
};
*/

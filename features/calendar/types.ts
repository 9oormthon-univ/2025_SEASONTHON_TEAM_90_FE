/**
* Calendar domain types (feature-scoped). 공용 재사용 필요 시 entities/로 승격.
*/
export type Emotion = 'HAPPY' | 'NEUTRAL' | 'SAD' | 'ANGRY';


/**
* 서버 레코드 DTO. (GET /v1/records?month=YYYY-MM)
*/
export interface RecordDto {
    id: string;
    routineId: string;
    /** YYYY-MM-DD (로컬 타임존 기준) */
    date: string;
    emotion: Emotion;
    /** 0~100 (0: 미완료, 1~99: 부분, 100: 완료) */
    completion: number;
    note: string;
}


export type DayStatus = 'UNRECORDED' | 'INCOMPLETE' | 'PARTIAL' | 'FULL';


export interface DayAggregate {
    /** YYYY-MM-DD */
    date: string;
    topEmotion: Emotion | null;
    status: DayStatus;
    /** 해당 날짜에 레코드가 있었는지 (미기록 점 표시 용) */
    hasRecord: boolean;
    /** 평균 완성률 (UI 참고용) */
    avgCompletion: number | null;
}


export interface MonthData {
    /** YYYY-MM */
    month: string;
    days: Record<string, DayAggregate>;
}


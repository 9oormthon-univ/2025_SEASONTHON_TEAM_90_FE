// features/retrospect/types.ts

// 서버 명세와 맞춘 감정 키 (null 허용)
export type Mood = "HAPPY" | "SOSO" | "SAD" | "MAD" | null;

// 루틴 수행 상태
export type RoutineStatus = "NONE" | "PARTIAL" | "DONE";

// 앱에서 쓰는 카테고리 라벨(디자인 라벨). 필요시 자유 확장되도록 string 포함
export type CategoryLabel = "운동" | "학업" | "문화" | "기타" | string;

// 루틴 카드/회고 리스트 한 항목
export type RetrospectRoutineItem = {
  id: number;
  title: string;
  category: CategoryLabel;
  status: RoutineStatus;
};

// 회고 도메인 루트
export type Retrospect = {
  date: string; // yyyy-MM-dd
  routines: RetrospectRoutineItem[];
  note: string;
  mood: Mood;
  submitted: boolean; // 저장/제출 완료 여부
};

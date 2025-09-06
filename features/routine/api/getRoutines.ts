// features/routine/api/getRoutines.ts
import { fetchRoutines } from "./routines";
import type { Routine } from "../types";

export type GetRoutinesResult = {
  routines: Routine[];
  totalCount: number;
};

/**
 * 특정 날짜의 루틴 조회
 * - 현재는 목/실서버 모두 "사용자 전체 루틴"을 반환
 * - 날짜별 필터링이 필요해지면 이 함수에서 규칙을 추가
 */
export async function getRoutines(date: string): Promise<GetRoutinesResult> {
  const list = await fetchRoutines();

  // 🔧 (선택) 날짜 기준 필터 예시:
  // const routines = list.filter((r) => {
  //   // ex) date 조건에 따라 활성만 노출
  //   return true;
  // });

  const routines = list;
  return { routines, totalCount: routines.length };
}

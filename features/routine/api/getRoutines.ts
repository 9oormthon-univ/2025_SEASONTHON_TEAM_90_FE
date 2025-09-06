// features/routine/api/getRoutines.ts
import { fetchRoutines } from "./routines";
import type { Routine } from "../types";

export type GetRoutinesResult = {
  routines: Routine[];
  totalCount: number;
};

/**
 * 특정 날짜의 루틴 조회
 * - 현재는 목 데이터라 전체 루틴을 반환
 * - 필요 시 날짜별 필터링 규칙을 여기에 추가
 */
export async function getRoutines(date: string): Promise<GetRoutinesResult> {
  const list = await fetchRoutines();

  // 🔧 (선택) 날짜 기준 필터 예시:
  // const routines = list.filter((r) => {
  //   // ex) 항상 활성 루틴 노출
  //   return true;
  // });

  const routines = list;
  return { routines, totalCount: routines.length };
}

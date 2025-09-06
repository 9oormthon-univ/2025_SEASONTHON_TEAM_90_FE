import { fetchRoutines } from "./routines";
import type { Routine } from "../types";

export type GetRoutinesResult = {
  routines: Routine[];
  totalCount: number;
};

/**
 * 특정 날짜의 루틴 조회
 * - v3.1 명세에선 날짜 파라미터 없이 전체 "내 루틴"을 반환
 * - 필요 시 서버 측 필터/쿼리 파라미터가 추가되면 여기서 넘기면 됨
 */
export async function getRoutines(_date: string): Promise<GetRoutinesResult> {
  const list = await fetchRoutines();
  return { routines: list, totalCount: list.length };
}

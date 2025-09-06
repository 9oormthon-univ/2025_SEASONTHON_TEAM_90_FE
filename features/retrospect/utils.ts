// features/retrospect/date-utils.ts
export const ymd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const cmpYmd = (a: string, b: string) => a.localeCompare(b); // YYYY-MM-DD 형식 전제
export const isFuture = (date: string, today = ymd()) => cmpYmd(date, today) > 0;
export const isToday = (date: string, todayStr = ymd()) => date === todayStr;
export const isPast = (date: string, todayStr = ymd()) => cmpYmd(date, todayStr) < 0;

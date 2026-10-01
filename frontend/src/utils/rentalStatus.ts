import type { Rental } from '../types';

export type RentalState = 'active' | 'overdue' | 'returned' | 'late-returned';

/** 로컬 기준 오늘 날짜 (YYYY-MM-DD) — 백엔드 date 문자열과 직접 비교용 */
export const todayStr = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** 'YYYY-MM-DDTHH:MM:SS' 형태의 일시에서 날짜 부분만 */
export const datePart = (dt: string): string => dt.slice(0, 10);

/** 일시를 'YYYY-MM-DD HH:MM'으로 표시 — 시간 도입 전 기록(자정)은 날짜만 */
export const formatDateTime = (dt: string | null): string => {
  if (!dt) return '-';
  const time = dt.slice(11, 19);
  return !time || time === '00:00:00' ? datePart(dt) : `${datePart(dt)} ${time.slice(0, 5)}`;
};

/** 두 YYYY-MM-DD 문자열 사이의 일수 (b - a) */
export const daysBetween = (a: string, b: string): number =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export const getRentalState = (r: Rental, today: string = todayStr()): RentalState => {
  if (r.is_returned) {
    return r.return_date && datePart(r.return_date) > r.rental_end ? 'late-returned' : 'returned';
  }
  return r.rental_end < today ? 'overdue' : 'active';
};

export const STATE_LABEL: Record<RentalState, string> = {
  active: '대여 중',
  overdue: '연체',
  returned: '반납 완료',
  'late-returned': '지연 반납',
};

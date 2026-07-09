export function formatDate(date: Date, format: 'YYYY-MM-DD' | 'DD/MM/YYYY' = 'YYYY-MM-DD'): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return format === 'YYYY-MM-DD' ? `${yyyy}-${mm}-${dd}` : `${dd}/${mm}/${yyyy}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function today(): Date {
  return new Date();
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

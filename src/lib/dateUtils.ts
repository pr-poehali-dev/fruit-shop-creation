const TIMEZONE = 'Asia/Krasnoyarsk';

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + (dateStr.includes('Z') || dateStr.includes('+') ? '' : 'Z'));
  return date.toLocaleDateString('ru-RU', { ...options, timeZone: TIMEZONE });
}

export function formatDateTime(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + (dateStr.includes('Z') || dateStr.includes('+') ? '' : 'Z'));
  return date.toLocaleString('ru-RU', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    ...options, 
    timeZone: TIMEZONE 
  });
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + (dateStr.includes('Z') || dateStr.includes('+') ? '' : 'Z'));
  return date.toLocaleTimeString('ru-RU', { timeZone: TIMEZONE });
}

export function toDate(dateStr: string): Date {
  return new Date(dateStr + (dateStr.includes('Z') || dateStr.includes('+') ? '' : 'Z'));
}

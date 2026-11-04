import { formatShortDate } from '@/lib/public-entity';

export function formatEventWhen(
  startDate?: string | null,
  startAt?: string | null
) {
  if (startAt) {
    const date = new Date(startAt);
    if (!Number.isNaN(date.getTime())) {
      const time = date
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        .toLowerCase();
      const day = date
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/[\u00A0\u202F]/g, ' ');
      return `${time} · ${day}`;
    }
  }

  if (!startDate) return null;
  const [year, month, day] = startDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return formatShortDate(startDate);
  return new Date(year, month - 1, day)
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace(/[\u00A0\u202F]/g, ' ');
}

export function formatEventRange(
  startDate?: string | null,
  endDate?: string | null,
  startAt?: string | null
) {
  const start = formatEventWhen(startDate, startAt);
  const end = endDate ? formatEventWhen(endDate) : null;
  if (start && end && end !== start) return `${start} – ${end}`;
  return start;
}

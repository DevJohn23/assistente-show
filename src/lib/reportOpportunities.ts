import type { Opportunity } from '@/types';

export function shiftDate(date: string, days: number) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

/** Snapshot of the open portfolio, independently of when each lead was registered. */
export function summarizeOpportunities(opportunities: Opportunity[], referenceDate: string) {
  const all = opportunities.filter(o => ['active', 'renewed', 'expired'].includes(o.status))
    .sort((a, b) => a.expiration_date.localeCompare(b.expiration_date) || a.client_name.localeCompare(b.client_name, 'pt-BR') || a.id.localeCompare(b.id));
  const start = shiftDate(referenceDate, 1);
  const end = shiftDate(referenceDate, 8);
  return {
    all, start, end,
    upcoming: all.filter(o => o.status !== 'expired' && o.expiration_date >= start && o.expiration_date < end),
    overdue: all.filter(o => o.status === 'expired' || o.expiration_date < referenceDate),
    today: all.filter(o => o.status !== 'expired' && o.expiration_date === referenceDate),
    daysRemaining: (date: string) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${referenceDate}T00:00:00Z`)) / 86400000),
  };
}

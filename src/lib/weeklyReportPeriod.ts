/** Closed calendar weeks, Sunday through Saturday, in the business timezone. */
export function weeklyReportPeriod(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (key: string) => parts.find(p => p.type === key)!.value;
  const end = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - end.getUTCDay());
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 7);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

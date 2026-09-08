export function getLocalDateString(date: Date = new Date()): string {
  // Ajusta o timezone local para evitar que o .toISOString() converta para UTC
  // e altere o dia dependendo da hora local.
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split('T')[0];
}

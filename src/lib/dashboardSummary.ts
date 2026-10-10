import type { Commission } from '@/types';
import { getLocalDateString } from './dateUtils';

export function getMonthlyCommissionSummary(commissions: Commission[], today = new Date()) {
  const month = getLocalDateString(today).slice(0, 7);
  const monthlyCommissions = commissions.filter((commission) => commission.sale_date.slice(0, 7) === month);
  return {
    salesCount: monthlyCommissions.length,
    expectedCommission: monthlyCommissions.reduce((total, commission) => total + commission.commission_amount, 0),
  };
}

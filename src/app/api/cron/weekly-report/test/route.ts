import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { reportEmailConfigured, sendWeeklyReportEmail } from '@/lib/emailServices';
import { weeklyReportPeriod } from '@/lib/weeklyReportPeriod';
import { shiftDate } from '@/lib/reportOpportunities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Operator-only smoke test. No recipient or user records can be supplied by callers. */
export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized Cron Invocation' }, { status: 401 });
  }
  if (process.env.WEEKLY_REPORT_PROVIDER !== 'gmail' || !reportEmailConfigured() || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Teste Gmail não configurado.' }, { status: 503 });
  }
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await db.from('weekly_report_deliveries').select('status').limit(1);
    if (error) return NextResponse.json({ error: 'Registro de envios indisponível.' }, { status: 503 });
    const period = weeklyReportPeriod();
    await sendWeeklyReportEmail(process.env.GMAIL_USER!, 'Teste de configuração — dados fictícios', [{
      id: 'sample', user_id: 'sample', client_name: 'Cliente fictício', sale_amount: 6930, commission_amount: 346.5,
      sale_date: period.start, installer_option: 'me', registration_type: 'own', status: 'pending', notes: 'Teste de envio; não representa uma venda real.',
    }], [{
      id: 'sample', user_id: 'sample', client_name: 'Oportunidade fictícia', cpf_cnpj: '', phone: '', type: 'PJ',
      registration_date: period.start, expiration_date: shiftDate(period.end, 2), status: 'active', notes: 'Dados fictícios para teste.',
    }], period, 'configuration-test');
    return NextResponse.json({ success: true, accepted: 1, database: 'ok', syntheticData: true });
  } catch {
    return NextResponse.json({ error: 'O provedor não confirmou o envio de teste.' }, { status: 503 });
  }
}

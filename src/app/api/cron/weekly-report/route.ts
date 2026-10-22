import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { sendWeeklyReportEmail, reportEmailConfigured } from '@/lib/emailServices';
import { weeklyReportPeriod } from '@/lib/weeklyReportPeriod';
import type { Commission, Opportunity } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

// Filter at the database boundary: never load another user's report records.
async function rows<T>(db: SupabaseClient, table: string, dateColumn: string | null, userId: string, period: { start: string; end: string }): Promise<T[]> {
  const result: T[] = [];
  let after: string | undefined;
  for (;;) {
    let query = db.from(table).select('*').eq('user_id', userId).order('id').limit(500);
    if (dateColumn) query = query.gte(dateColumn, period.start).lt(dateColumn, period.end);
    else query = query.in('status', ['active', 'renewed', 'expired']);
    if (after) query = query.gt('id', after);
    const { data, error } = await query;
    if (error || !data) throw new Error('report_query_failed');
    result.push(...data as T[]);
    if (data.length < 500) return result;
    after = data[data.length - 1].id;
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized Cron Invocation' }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !reportEmailConfigured()) {
    return NextResponse.json({ error: 'Relatório automático não configurado. Verifique as credenciais do provedor de envio.' }, { status: 503 });
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const period = weeklyReportPeriod();
  const deadline = Date.now() + 240_000;
  let accepted = 0, skipped = 0, failed = 0;
  try {
    for (let page = 1; ; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw new Error('users_query_failed');
      for (const user of data.users) {
        if (!user.email) { skipped++; continue; }
        if (Date.now() >= deadline) return NextResponse.json({ success: false, accepted, skipped, failed, incomplete: true }, { status: 503 });
        const { data: existing, error: lookupError } = await db.from('weekly_report_deliveries')
          .select('status').eq('user_id', user.id).eq('period_start', period.start).maybeSingle();
        if (lookupError) throw new Error('delivery_log_unavailable');
        if (existing) {
          if (existing.status === 'accepted') skipped++; else failed++;
          continue;
        }
        try {
          const commissions = await rows<Commission>(db, 'commissions', 'sale_date', user.id, period);
          const opportunities = await rows<Opportunity>(db, 'opportunities', null, user.id, period);
          // A unique key is an atomic claim across concurrent cron invocations.
          // An uncertain delivery is never automatically resent after Resend's 24h window.
          const { error: claimError } = await db.from('weekly_report_deliveries').insert({ user_id: user.id, period_start: period.start, period_end: period.end, status: 'processing' });
          if (claimError?.code === '23505') { failed++; continue; }
          if (claimError) throw new Error('delivery_claim_failed');
          try {
            const name = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : 'Vendedor';
            const providerId = await sendWeeklyReportEmail(user.email, name, commissions, opportunities, period, user.id);
            const { data: saved, error: saveError } = await db.from('weekly_report_deliveries')
              .update({ status: 'accepted', provider_id: providerId, updated_at: new Date().toISOString() })
              .eq('user_id', user.id).eq('period_start', period.start).select('user_id').single();
            if (saveError || !saved) throw new Error('delivery_confirmation_not_saved');
            accepted++;
          } catch {
            await db.from('weekly_report_deliveries').update({ status: 'needs_review', updated_at: new Date().toISOString() })
              .eq('user_id', user.id).eq('period_start', period.start);
            failed++;
          }
          // Respect the provider's default request rate, including failed requests.
          await new Promise(resolve => setTimeout(resolve, 600));
        } catch { failed++; }
      }
      if (data.users.length < 100) break;
    }
    return NextResponse.json({ success: failed === 0, accepted, skipped, failed, period }, { status: failed ? 503 : 200 });
  } catch {
    return NextResponse.json({ error: 'Falha ao processar relatório semanal.', accepted, skipped, failed }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWeeklyReportEmail } from '@/lib/emailServices';
import { Commission } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwuheljjsviakffyeqmx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3BT0YX4E-N_w2fJincToLw_pASIEC2b';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Optional Vercel Cron auth check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'assistente_show_cron_secret_2026';

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
      // Allow Vercel Cron headers or secret parameter
      const urlSecret = request.nextUrl.searchParams.get('secret');
      if (urlSecret !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized Cron Invocation' }, { status: 401 });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch commissions
    const { data: commissionsData, error: commError } = await supabase
      .from('commissions')
      .select('*');

    if (commError) {
      console.error('Error fetching commissions in Cron:', commError);
    }

    const commissions: Commission[] = (commissionsData as Commission[]) || [];

    // Target email recipient (Can be configured or extracted from logged users)
    // Default fallback to registered email
    const targetEmail = request.nextUrl.searchParams.get('email') || 'devjohn23@gmail.com';
    const recipientName = 'Vendedor Show';

    // Dispatch weekly report email via Resend
    const resendResult = await sendWeeklyReportEmail(targetEmail, recipientName, commissions);

    return NextResponse.json({
      success: true,
      message: `Relatório semanal enviado com sucesso para ${targetEmail}`,
      resendId: resendResult.data?.id || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error executing weekly report cron:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao executar relatório semanal' },
      { status: 500 }
    );
  }
}

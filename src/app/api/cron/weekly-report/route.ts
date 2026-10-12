import { getLocalDateString } from "@/lib/dateUtils";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWeeklyReportEmail } from '@/lib/emailServices';
import { Commission } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Authenticate in every environment; query-string secrets are not accepted.
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized Cron Invocation' }, { status: 401 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Relatório automático não configurado.' }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Fetch all commissions
    const { data: commissionsData, error: commError } = await supabase
      .from('commissions')
      .select('*');

    if (commError) {
      console.error('Error fetching commissions in Cron:', commError);
      throw new Error(commError.message);
    }

    const allCommissions: Commission[] = (commissionsData as Commission[]) || [];

    // Filter to last 7 days only
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = getLocalDateString(sevenDaysAgo);
    const recentCommissions = allCommissions.filter(c => c.sale_date >= sevenDaysAgoStr);

    let sentCount = 0;
    const errors: any[] = [];

    {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        throw new Error(`Failed to list users: ${authError.message}`);
      }

      const users = authData.users || [];

      for (const user of users) {
        // Find commissions for this specific user
        const userCommissions = recentCommissions.filter(c => c.user_id === user.id);
        
        // Only send if they had sales in the last 7 days
        if (userCommissions.length > 0 && user.email) {
          try {
            const userName = user.user_metadata?.full_name || 'Vendedor Show';
            await sendWeeklyReportEmail(user.email, userName, userCommissions);
            sentCount++;
          } catch (err: any) {
            console.error(`Failed to send email to ${user.email}:`, err);
            errors.push({ email: user.email, error: err.message });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Relatório semanal processado. E-mails enviados: ${sentCount}.`,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error executing weekly report cron:', error);
    return NextResponse.json(
      { error: 'Falha ao executar relatório semanal' },
      { status: 500 }
    );
  }
}

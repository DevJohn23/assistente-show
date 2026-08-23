import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWeeklyReportEmail } from '@/lib/emailServices';
import { Commission } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwuheljjsviakffyeqmx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3BT0YX4E-N_w2fJincToLw_pASIEC2b';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Optional Vercel Cron auth check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'assistente_show_cron_secret_2026';

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
      const urlSecret = request.nextUrl.searchParams.get('secret');
      if (urlSecret !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized Cron Invocation' }, { status: 401 });
      }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to anon key.');
    }

    // Use Service Role to get access to auth.users if available, otherwise fallback to anon
    const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

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
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const recentCommissions = allCommissions.filter(c => c.sale_date >= sevenDaysAgoStr);

    let sentCount = 0;
    const errors: any[] = [];

    // If we have a service role, fetch real users. Otherwise, fallback for testing.
    if (serviceRoleKey) {
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
    } else {
      // Fallback: Group by user_id but we don't have their email. We send a single summary to fallback email.
      const fallbackEmail = request.nextUrl.searchParams.get('email') || 'devjohn23@gmail.com';
      if (recentCommissions.length > 0) {
        await sendWeeklyReportEmail(fallbackEmail, 'Administrador (Fallback)', recentCommissions);
        sentCount = 1;
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
      { error: error.message || 'Falha ao executar relatório semanal' },
      { status: 500 }
    );
  }
}

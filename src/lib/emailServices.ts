import { summarizeOpportunities, shiftDate } from './reportOpportunities';
import { createTransport } from 'nodemailer';
import { Resend } from 'resend';
import * as XLSX from 'xlsx';
import type { Commission, Opportunity } from '@/types';

export function validReportSender(sender = process.env.WEEKLY_REPORT_FROM || '') {
  const address = sender.match(/<([^<>]+)>$/)?.[1] || sender;
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address) && !/@(?:[^@]*\.)?(?:resend\.dev|vercel\.app)$/i.test(address);
}

export function reportEmailConfigured() {
  const provider = process.env.WEEKLY_REPORT_PROVIDER || 'resend';
  if (provider === 'gmail') return /^[^\s@]+@gmail\.com$/i.test(process.env.GMAIL_USER || '') && /^[a-z]{16}$/.test((process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, ''));
  return provider === 'resend' && Boolean(process.env.RESEND_API_KEY) && validReportSender();
}

export function generateWeeklyExcelBuffer(commissions: Commission[], opportunities: Opportunity[] = []): Buffer {
  const workbook = XLSX.utils.book_new();
  const sales = commissions.map(c => ({
    Cliente: c.client_name, 'Valor Venda (R$)': Number(c.sale_amount), 'Comissão (R$)': Number(c.commission_amount),
    Data: c.sale_date, Situação: c.status === 'paid' ? 'Paga' : 'Pendente',
    'Quem Implantou': c.installer_option === 'me' ? 'Eu' : c.other_installer_name || 'Outro',
    'Tipo de Registro': c.registration_type === 'own' ? 'Venda própria' : c.registration_type === 'implanted_for_other' ? 'Implantei para outro' : 'Outro implantou para mim',
    Observações: c.notes || '',
  }));
  const leads = opportunities.filter(o => ['active', 'renewed', 'expired'].includes(o.status)).sort((a, b) => a.expiration_date.localeCompare(b.expiration_date) || a.client_name.localeCompare(b.client_name, 'pt-BR')).map(o => ({ Cliente: o.client_name, Empresa: o.company_name || '',
    'CPF/CNPJ': o.cpf_cnpj, Telefone: o.phone, Cadastro: o.registration_date, Vencimento: o.expiration_date,
    Situação: ({ active: 'Ativa', renewed: 'Renovada', expired: 'Expirada', won: 'Ganha', lost: 'Perdida' })[o.status], Observações: o.notes || '' }));
  const sheets = [
    { name: 'Comissões', rows: sales, headers: ['Cliente', 'Valor Venda (R$)', 'Comissão (R$)', 'Data', 'Situação', 'Quem Implantou', 'Tipo de Registro', 'Observações'] },
    { name: 'Oportunidades', rows: leads, headers: ['Cliente', 'Empresa', 'CPF/CNPJ', 'Telefone', 'Cadastro', 'Vencimento', 'Situação', 'Observações'] },
  ];
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows, { header: sheet.headers });
    ws['!cols'] = sheet.headers.map(() => ({ wch: 24 }));
    if (sheet.name === 'Comissões') for (let row = 2; row <= sales.length + 1; row++) {
      for (const column of ['B', 'C']) ws[`${column}${row}`].z = '"R$" #,##0.00';
    }
    XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
  }
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendWeeklyReportEmail(toEmail: string, recipientName: string, commissions: Commission[], opportunities: Opportunity[], period: { start: string; end: string }, userId: string) {
  if (!reportEmailConfigured()) throw new Error('email_not_configured');
  const lastDay = new Date(`${period.end}T00:00:00Z`);
  lastDay.setUTCDate(lastDay.getUTCDate() - 1);
  const format = (date: string) => date.split('-').reverse().join('/');
  const range = `${format(period.start)} a ${format(lastDay.toISOString().slice(0, 10))}`;
  const summary = summarizeOpportunities(opportunities, period.end);
  const line = (o: Opportunity) => `• ${o.client_name} — ${format(o.expiration_date)} (${summary.daysRemaining(o.expiration_date)} dia(s) restantes)`;
  const upcoming = summary.upcoming.length ? summary.upcoming.map(line).join('\n') : 'Nenhuma oportunidade vence na próxima semana.';
  const overdue = summary.overdue.length ? `\n\nVencidas — revisar (${summary.overdue.length}):\n${summary.overdue.map(o => `• ${o.client_name} — ${format(o.expiration_date)}`).join('\n')}` : '';
  const today = summary.today.length ? `\n\nVencem no domingo de referência (${summary.today.length}):\n${summary.today.map(line).join('\n')}` : '';
  const text = `Olá ${recipientName},\n\nSeu relatório de comissões de ${range} está anexado, com ${commissions.length} registro(s).${!commissions.length ? '\nNão houve movimentação de comissões no período.' : ''}\n\nOportunidades que vencem de ${format(summary.start)} a ${format(shiftDate(summary.end, -1))}:\n${upcoming}${today}${overdue}\n\nA planilha inclui ${summary.all.length} oportunidade(s) ainda em acompanhamento, ordenadas por vencimento. Ganhas e perdidas não estão incluídas.\nDias restantes calculados em relação a ${format(period.end)}.\n\nAssistente Omnilink`;
  const message = {
    from: process.env.WEEKLY_REPORT_FROM!, to: [toEmail], subject: `Relatório semanal — ${range}`,
    text, html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b"><h2>Relatório semanal</h2><p>${escapeHtml(text).replace(/\n/g, '<br>')}</p></div>`,
    attachments: [{ filename: `Relatorio_${period.start}.xlsx`, content: generateWeeklyExcelBuffer(commissions, summary.all) }],
  };
  if (process.env.WEEKLY_REPORT_PROVIDER === 'gmail') {
    const transport = createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: process.env.GMAIL_USER!, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s/g, '') },
      connectionTimeout: 15_000, greetingTimeout: 10_000, socketTimeout: 20_000,
      disableFileAccess: true, disableUrlAccess: true,
      logger: false, debug: false,
    });
    try {
      const result = await transport.sendMail({ ...message,
        from: { name: 'Assistente Omnilink — Relatórios', address: process.env.GMAIL_USER! },
      });
      if (!result.messageId || result.rejected.length || result.accepted.length !== 1) throw new Error('email_provider_rejected_or_unconfirmed');
      return result.messageId;
    } catch { throw new Error('email_provider_rejected_or_unconfirmed'); }
    finally { transport.close(); }
  }
  const response = await new Resend(process.env.RESEND_API_KEY).emails.send(message, { idempotencyKey: `weekly/${userId}/${period.start}` });
  if (response.error || !response.data?.id) throw new Error('email_provider_rejected_or_unconfirmed');
  return response.data.id;
}

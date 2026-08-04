import { Resend } from 'resend';
import * as XLSX from 'xlsx';
import { Commission } from '@/types';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

/**
 * Generates Excel buffer for the last 7 days of commissions
 */
export function generateWeeklyExcelBuffer(commissions: Commission[]): Buffer {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const recentCommissions = commissions.filter(c => c.sale_date >= sevenDaysAgoStr);

  const salesData = recentCommissions.map((c) => ({
    Cliente: c.client_name,
    'Valor Venda (R$)': c.sale_amount,
    'Comissão (R$)': c.commission_amount,
    Data: c.sale_date,
    'Quem Implantou': c.registration_type === 'implanted_for_other' ? 'Eu' : c.other_installer_name || 'Outro',
    'Vendedor Envolvido': c.other_installer_name || 'N/A',
    'Tipo de Registro': 
      c.registration_type === 'own'
        ? 'Venda Própria'
        : c.registration_type === 'implanted_for_other'
        ? 'Implantei p/ Outro (Repassar)'
        : 'Outro Implantou p/ Mim (Receber)',
    Observações: c.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(salesData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório 7 Dias');

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

/**
 * Dispatches weekly email report via Resend with .xlsx attachment
 */
export async function sendWeeklyReportEmail(
  toEmail: string,
  recipientName: string,
  commissions: Commission[]
) {
  const excelBuffer = generateWeeklyExcelBuffer(commissions);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Relatorio_Semanal_Show_${dateStr}.xlsx`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px;">
      <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Assistente Show • Relatório Semanal</h1>
        <p style="color: #38bdf8; font-size: 12px; margin: 5px 0 0 0;">Show Tecnologia • Omnilink</p>
      </div>

      <p style="font-size: 14px; line-height: 1.5;">Olá <strong>${recipientName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.5;">Seu backup e relatório automático das comissões registradas nos <strong>últimos 7 dias</strong> já está pronto!</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #0284c7; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #334155;">
          📎 <strong>Anexo em Excel:</strong> ${filename}<br>
          📅 <strong>Período:</strong> Últimos 7 dias de operações
        </p>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        Este e-mail é gerado automaticamente todo domingo à noite para garantir a segurança e backup dos seus dados comerciais.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">
        © ${new Date().getFullYear()} Assistente Show • Show Tecnologia. Todos os direitos reservados.
      </p>
    </div>
  `;

  const response = await resend.emails.send({
    from: 'Assistente Show <onboarding@resend.dev>',
    to: [toEmail],
    subject: `📊 Seu Relatório Semanal de Comissões - Show Tecnologia (${dateStr})`,
    html: htmlContent,
    attachments: [
      {
        filename,
        content: excelBuffer,
      },
    ],
  });

  return response;
}

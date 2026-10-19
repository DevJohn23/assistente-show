import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import { money, quoteBenefits, QuoteSnapshot } from '@/lib/quotePresentation';

export interface ProposalDetails { client: string; issued: string; validUntil: string; includeSeller: boolean; seller: string; contact: string; notes: string }
const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 44, paddingHorizontal: 34, fontFamily: 'Helvetica', fontSize: 9, color: '#172b4d', lineHeight: 1.35 },
  logoCrop: { width: 155, height: 52, overflow: 'hidden', marginBottom: 8 }, logo: { width: 155, height: 52, objectFit: 'cover', objectPositionY: 0 },
  title: { fontSize: 23, lineHeight: 1.2, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  muted: { color: '#5d6b80', fontSize: 8 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, dates: { textAlign: 'right', paddingTop: 4, gap: 5 }, subtitle: { color: '#5d6b80', fontSize: 8, marginBottom: 10 },
  client: { backgroundColor: '#edf5fc', padding: 10, borderRadius: 3, marginBottom: 9 },
  heading: { lineHeight: 1.2, fontFamily: 'Helvetica-Bold', fontSize: 12, marginTop: 10, marginBottom: 6 },
  row: { flexDirection: 'row', borderBottomWidth: .5, borderBottomColor: '#dce4ee', paddingVertical: 7, paddingHorizontal: 6 },
  th: { backgroundColor: '#edf5fc', fontFamily: 'Helvetica-Bold' },
  description: { width: '48%', paddingRight: 6 }, qty: { width: '8%', textAlign: 'center' }, value: { width: '22%', textAlign: 'right' },
  summary: { marginTop: 9, marginLeft: '35%' }, amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, gap: 10 },
  total: { fontSize: 12, lineHeight: 1.2, fontFamily: 'Helvetica-Bold', color: '#0759ed', borderTopWidth: .5, borderTopColor: '#dce4ee', paddingTop: 6 },
  monthly: { backgroundColor: '#edf5fc', padding: 9, marginTop: 9, borderRadius: 3 },
  payment: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: .5, borderBottomColor: '#e7edf4' },
  financeRow: { flexDirection: 'row' },
  financeCell: { width: '50%', paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: .5, borderBottomColor: '#e7edf4' },
  financeLeft: { paddingRight: 16 }, financeRight: { paddingLeft: 16, borderLeftWidth: .7, borderLeftColor: '#cbd5e1' },
  financeHeader: { fontSize: 8, color: '#5d6b80', paddingBottom: 5 },
  bold: { fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', top: 805, left: 34, right: 34, fontSize: 8, lineHeight: 1.2, color: '#5d6b80' },
});
const date = (s: string) => s.split('-').reverse().join('/');
export function ProposalDocument({ quote: q, details: d, logo = '/brand/omnilink-original.png' }: { quote: QuoteSnapshot; details: ProposalDetails; logo?: string }) {
  return <Document title="Proposta comercial" author={d.includeSeller && d.seller.trim() ? d.seller.trim() : 'Show Tecnologia'} language="pt-BR"><Page size="A4" style={styles.page}>
    <View fixed style={{ height: 16 }} /><View style={styles.header} wrap={false}><View style={styles.logoCrop}><Image src={logo} style={styles.logo} /></View><View style={styles.dates}><Text>Emissão: {date(d.issued)}</Text>{Boolean(d.validUntil) && <Text style={styles.muted}>Válida até: {date(d.validUntil)}</Text>}</View></View>
    <Text style={styles.title}>Proposta comercial</Text><Text style={styles.subtitle}>Equipamentos e serviços</Text>
    {Boolean(d.client.trim()) && <View style={styles.client} wrap={false}><Text style={styles.muted}>Cliente</Text><Text style={styles.bold}>{d.client.trim()}</Text></View>}
    <Text style={styles.heading} minPresenceAhead={45}>Equipamentos</Text>
    <View style={[styles.row, styles.th]} wrap={false}><Text style={styles.description}>Descrição</Text><Text style={styles.qty}>Qtd.</Text><Text style={styles.value}>Valor unitário</Text><Text style={styles.value}>Subtotal</Text></View>
    {q.lines.map((line, i) => <View key={`${line.id}-${i}`} style={styles.row} wrap={false}><Text style={styles.description}>{line.name}</Text><Text style={styles.qty}>{line.quantity}</Text><Text style={styles.value}>R$ {money(line.unitPrice)}</Text><Text style={styles.value}>R$ {money(line.total)}</Text></View>)}
    <View style={styles.summary} wrap={false}><View style={styles.amountRow}><Text>Subtotal dos equipamentos</Text><Text>R$ {money(q.subtotal)}</Text></View>
      {q.discount > 0 && <View style={styles.amountRow}><Text>Desconto especial · {q.discountPercent}%</Text><Text>- R$ {money(q.discount)}</Text></View>}
      <View style={[styles.amountRow, styles.total]}><Text>Total dos equipamentos</Text><Text>R$ {money(q.total)}</Text></View>
      {q.entry > 0 && <><View style={styles.amountRow}><Text>Entrada</Text><Text>R$ {money(q.entry)}</Text></View><View style={styles.amountRow}><Text>Saldo após entrada</Text><Text>R$ {money(q.balance)}</Text></View></>}
    </View>
    {q.monthly > 0 && <View style={styles.monthly} wrap={false}><View style={styles.amountRow}><Text style={styles.bold}>Mensalidade do serviço</Text><Text style={styles.bold}>R$ {money(q.monthly)}/mês</Text></View><Text style={styles.muted}>Cobrança recorrente, separada do valor dos equipamentos.</Text></View>}
    {q.payments.length > 0 && <View wrap={false}><Text style={styles.heading}>Condições de pagamento</Text><Text style={styles.muted}>{q.entry ? 'Alternativas para o saldo após a entrada.' : 'Alternativas para os equipamentos.'}</Text>
      {q.payments.map(p => <View key={p.label} style={styles.payment}><Text>{p.label}</Text><Text style={styles.bold}>{p.installments ? `${p.installments}x de ` : ''}R$ {money(p.amount)}</Text></View>)}
    </View>}
    {q.financing.length > 0 && <View wrap={false}>
      <Text style={styles.heading}>Opções de financiamento</Text>
      <View style={styles.financeRow}>{[0, 1].map(column => <View key={column} style={[styles.financeCell, column ? styles.financeRight : styles.financeLeft, styles.financeHeader]}><Text>Prazo</Text><Text>Parcela mensal</Text></View>)}</View>
      {Array.from({ length: Math.ceil(q.financing.length / 2) }, (_, row) => <View key={row} style={styles.financeRow}>
        {[0, 1].map(column => {
          const option = q.financing[row * 2 + column];
          return <View key={column} style={[styles.financeCell, column ? styles.financeRight : styles.financeLeft]}>{option ? <><Text>{option.installments} meses</Text><Text style={styles.bold}>R$ {money(option.amount)}</Text></> : null}</View>;
        })}
      </View>)}
      {q.entry > 0 && <Text style={[styles.muted, { marginTop: 6 }]}>Valores calculados sobre o saldo após a entrada.</Text>}
    </View>}
    <View wrap={false}><Text style={styles.heading}>Benefícios incluídos</Text>{quoteBenefits.map(b => <Text key={b}>• {b}</Text>)}</View>
    {Boolean(d.notes.trim()) && <><Text style={styles.heading} minPresenceAhead={30}>Observações</Text><Text>{d.notes.trim()}</Text></>}
    {d.includeSeller && Boolean(d.seller.trim() || d.contact.trim()) && <View wrap={false}><Text style={[styles.heading, { fontSize: 10, marginTop: 8, marginBottom: 4 }]}>Responsável comercial</Text><View style={{ flexDirection: 'row', gap: 12 }}>{Boolean(d.seller.trim()) && <Text style={[styles.bold, { flex: 1 }]}>{d.seller.trim()}</Text>}{Boolean(d.contact.trim()) && <Text style={{ flex: 1 }}>{d.contact.trim()}</Text>}</View></View>}
    <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Show Tecnologia · Omnilink                                                   ${pageNumber} / ${totalPages}`} />
  </Page></Document>;
}
export async function generateProposal(quote: QuoteSnapshot, details: ProposalDetails, logo: string) {
  return pdf(<ProposalDocument quote={quote} details={details} logo={logo} />).toBlob();
}

import 'server-only';
import {
  divider,
  escapeHtml,
  h1,
  kicker,
  p,
  pMuted,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export interface AdvisoryApplicationAdminNotificationProps {
  applicationId: string;
  nome: string;
  email: string;
  whatsapp: string;
  cargo?: string | null;
  empresa: string;
  site_empresa?: string | null;
  faturamento_mensal_range: string;
  setor: string;
  tamanho_time?: number | null;
  anos_no_mercado?: number | null;
  dor_principal_md: string;
  urgencia: number;
  timeline_esperada: string;
  tentou_consultoria_antes: string;
  qual_consultoria?: string | null;
  disponibilidade_semanal_horas?: number | null;
  formato_interesse: string;
}

const FORMATO_LABEL: Record<string, string> = {
  sprint: 'Sprint 30 Dias',
  conselho: 'Conselho Executivo',
  ambos: 'Sprint + Conselho (a definir)',
};

const URGENCIA_LABEL: Record<number, string> = {
  1: 'Explorando',
  2: 'Planejando',
  3: 'Decidindo',
  4: 'Urgente',
  5: 'Apagando incêndio',
};

export function advisoryApplicationAdminNotification(
  props: AdvisoryApplicationAdminNotificationProps
): RenderedEmail {
  const formatoLabel = FORMATO_LABEL[props.formato_interesse] ?? props.formato_interesse;
  const urgenciaLabel = URGENCIA_LABEL[props.urgencia] ?? `${props.urgencia}/5`;
  const subject = `[Advisory · ${formatoLabel}] ${props.nome} (${props.empresa})`;

  const dorHtml = escapeHtml(props.dor_principal_md).replace(/\n/g, '<br>');
  const siteRow = props.site_empresa
    ? p(
        `<strong style="color:#C6FF00;">Site:</strong> <a href="${escapeHtml(props.site_empresa)}" style="color:#FF3B0F;" target="_blank" rel="noopener">${escapeHtml(props.site_empresa)}</a>`
      )
    : '';
  const cargoRow = props.cargo
    ? p(`<strong style="color:#C6FF00;">Função:</strong> ${escapeHtml(props.cargo)}`)
    : '';
  const timeRow =
    props.tamanho_time != null
      ? p(`<strong style="color:#C6FF00;">Time:</strong> ${props.tamanho_time} pessoas`)
      : '';
  const anosRow =
    props.anos_no_mercado != null
      ? p(`<strong style="color:#C6FF00;">Anos de mercado:</strong> ${props.anos_no_mercado}`)
      : '';
  const dispRow =
    props.disponibilidade_semanal_horas != null
      ? p(
          `<strong style="color:#C6FF00;">Disponibilidade:</strong> ${props.disponibilidade_semanal_horas}h/semana`
        )
      : '';
  const consultoriaAntes =
    props.tentou_consultoria_antes === 'sim'
      ? p(
          `<strong style="color:#C6FF00;">Já tentou consultoria:</strong> Sim${props.qual_consultoria ? ` — ${escapeHtml(props.qual_consultoria)}` : ''}`
        )
      : p(`<strong style="color:#C6FF00;">Já tentou consultoria:</strong> Não`);

  const body = `
${kicker(`NOVA APLICAÇÃO ADVISORY · ${formatoLabel.toUpperCase()}`)}
${h1(`${escapeHtml(props.nome)} · ${escapeHtml(props.empresa)}`)}
${p(`<strong style="color:#C6FF00;">Formato:</strong> ${escapeHtml(formatoLabel)}`)}
${p(`<strong style="color:#C6FF00;">Email:</strong> <a href="mailto:${escapeHtml(props.email)}" style="color:#FF3B0F;">${escapeHtml(props.email)}</a>`)}
${p(`<strong style="color:#C6FF00;">WhatsApp:</strong> ${escapeHtml(props.whatsapp)}`)}
${cargoRow}
${siteRow}
${divider()}
${kicker('QUALIFICAÇÃO ICP')}
${p(`<strong style="color:#C6FF00;">Faturamento:</strong> ${escapeHtml(props.faturamento_mensal_range)}/mês`)}
${p(`<strong style="color:#C6FF00;">Setor:</strong> ${escapeHtml(props.setor)}`)}
${timeRow}
${anosRow}
${divider()}
${kicker('MOMENTO + INTENT')}
${p(`<strong style="color:#C6FF00;">Urgência:</strong> ${props.urgencia}/5 · ${escapeHtml(urgenciaLabel)}`)}
${p(`<strong style="color:#C6FF00;">Timeline:</strong> ${escapeHtml(props.timeline_esperada)}`)}
${dispRow}
${consultoriaAntes}
${divider()}
${kicker('DOR PRINCIPAL')}
${p(dorHtml)}
${divider()}
${pMuted(`Aplicação ID: <code style="color:#d4d4d4;">${escapeHtml(props.applicationId)}</code> · status: aguardando triagem.`)}
`;

  const text = `Nova aplicação Advisory — ${formatoLabel}

Nome: ${props.nome}
Empresa: ${props.empresa}${props.cargo ? ` (${props.cargo})` : ''}
Email: ${props.email}
WhatsApp: ${props.whatsapp}
${props.site_empresa ? `Site: ${props.site_empresa}\n` : ''}
[ICP]
Faturamento: ${props.faturamento_mensal_range}/mês
Setor: ${props.setor}
${props.tamanho_time != null ? `Time: ${props.tamanho_time} pessoas\n` : ''}${props.anos_no_mercado != null ? `Anos de mercado: ${props.anos_no_mercado}\n` : ''}
[Momento]
Urgência: ${props.urgencia}/5 (${urgenciaLabel})
Timeline: ${props.timeline_esperada}
${props.disponibilidade_semanal_horas != null ? `Disponibilidade: ${props.disponibilidade_semanal_horas}h/semana\n` : ''}Já tentou consultoria: ${props.tentou_consultoria_antes === 'sim' ? `Sim${props.qual_consultoria ? ` — ${props.qual_consultoria}` : ''}` : 'Não'}

[Dor]
${props.dor_principal_md}

App ID: ${props.applicationId}`;

  return {
    subject,
    html: renderLayout({
      body,
      title: subject,
      preheader: `${props.nome} aplicou pra ${formatoLabel}. Faturamento ${props.faturamento_mensal_range}.`,
    }),
    text,
  };
}

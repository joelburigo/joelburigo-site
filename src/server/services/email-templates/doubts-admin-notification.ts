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

export interface DoubtsAdminNotificationProps {
  nome: string;
  email: string;
  whatsapp: string;
  duvida: string;
  produto_interesse: 'vss' | 'advisory' | 'ambos';
  landing_page: string;
}

const PRODUCT_LABEL: Record<DoubtsAdminNotificationProps['produto_interesse'], string> = {
  vss: 'VSS',
  advisory: 'Advisory',
  ambos: 'VSS + Advisory',
};

export function doubtsAdminNotification(
  props: DoubtsAdminNotificationProps
): RenderedEmail {
  const subject = `[Dúvida ${PRODUCT_LABEL[props.produto_interesse]}] ${props.nome}`;

  const duvidaHtml = escapeHtml(props.duvida).replace(/\n/g, '<br>');

  const body = `
${kicker('NOVA DÚVIDA · LEAD FRIO')}
${h1(`${props.nome} mandou uma dúvida`)}
${p(`<strong style="color:#C6FF00;">Produto:</strong> ${escapeHtml(PRODUCT_LABEL[props.produto_interesse])}`)}
${p(`<strong style="color:#C6FF00;">Email:</strong> <a href="mailto:${escapeHtml(props.email)}" style="color:#FF3B0F;">${escapeHtml(props.email)}</a>`)}
${p(`<strong style="color:#C6FF00;">WhatsApp:</strong> ${escapeHtml(props.whatsapp)}`)}
${p(`<strong style="color:#C6FF00;">Landing:</strong> <code style="color:#d4d4d4;">${escapeHtml(props.landing_page)}</code>`)}
${divider()}
${kicker('DÚVIDA')}
${p(duvidaHtml)}
${divider()}
${pMuted('Já virou opportunity no pipeline e contact no CRM. Responde direto pelo email/WhatsApp acima.')}
`;

  const text = `Nova dúvida — ${PRODUCT_LABEL[props.produto_interesse]}

Nome: ${props.nome}
Email: ${props.email}
WhatsApp: ${props.whatsapp}
Landing: ${props.landing_page}

Dúvida:
${props.duvida}

— já criou opportunity + contact no CRM.`;

  return {
    subject,
    html: renderLayout({
      body,
      title: subject,
      preheader: `${props.nome} mandou dúvida sobre ${PRODUCT_LABEL[props.produto_interesse]}.`,
    }),
    text,
  };
}

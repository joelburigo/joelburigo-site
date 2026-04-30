import 'server-only';
import {
  divider,
  escapeHtml,
  h1,
  kicker,
  p,
  signature,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export interface DoubtsConfirmationProps {
  name: string;
}

export function doubtsConfirmation(
  props: DoubtsConfirmationProps
): RenderedEmail {
  const first = props.name.trim().split(' ')[0] ?? props.name.trim();
  const subject = 'Recebemos sua mensagem · Joel responde em até 24h';

  const body = `
${kicker('MENSAGEM RECEBIDA')}
${h1(`Tô no teu radar, ${escapeHtml(first)}`)}
${p('Recebi tua dúvida. <strong style="color:#C6FF00;">Joel responde em até 24h</strong> direto no teu email ou WhatsApp.')}
${p('Não precisa fazer nada — só ficar de olho na caixa de entrada.')}
${divider()}
${signature()}
`;

  const text = `Recebemos sua mensagem, ${first}.

Joel responde pessoalmente em até 24h pelo seu email ou WhatsApp.

Não precisa fazer nada — só ficar de olho.

— Joel`;

  return {
    subject,
    html: renderLayout({
      body,
      title: subject,
      preheader: 'Joel responde em até 24h.',
    }),
    text,
  };
}

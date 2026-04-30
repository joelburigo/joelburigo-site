import 'server-only';
import {
  divider,
  escapeHtml,
  h1,
  kicker,
  p,
  pMuted,
  signature,
  renderLayout,
} from './_layout';
import type { RenderedEmail } from './magic-link';

export interface AdvisoryApplicationConfirmationProps {
  name: string;
  formato: string; // 'sprint' | 'conselho' | 'ambos'
}

const FORMATO_LABEL: Record<string, string> = {
  sprint: 'Sprint 30 Dias',
  conselho: 'Conselho Executivo',
  ambos: 'Advisory',
};

export function advisoryApplicationConfirmation(
  props: AdvisoryApplicationConfirmationProps
): RenderedEmail {
  const first = props.name.trim().split(' ')[0] ?? props.name.trim();
  const formatoLabel = FORMATO_LABEL[props.formato] ?? 'Advisory';
  const subject = `Aplicação recebida · ${formatoLabel}`;

  const body = `
${kicker('APLICAÇÃO RECEBIDA')}
${h1(`Recebido, ${escapeHtml(first)}.`)}
${p(`Sua aplicação pra <strong style="color:#C6FF00;">${escapeHtml(formatoLabel)}</strong> caiu na minha caixa.`)}
${p('Eu mesmo leio cada aplicação — sem fila, sem intermediário. Reviso em até <strong style="color:#C6FF00;">48h</strong> e respondo direto pelo email ou WhatsApp que você informou.')}
${divider()}
${p('Se houver fit, chamo no WhatsApp pra alinhar. Se não houver, indico VSS ou recurso gratuito — não empurro venda forçada.')}
${pMuted('Enquanto isso, não precisa fazer nada. Só ficar de olho na caixa de entrada e WhatsApp.')}
${signature()}
`;

  const text = `Aplicação recebida · ${formatoLabel}

Recebido, ${first}.

Eu mesmo leio cada aplicação — sem fila, sem intermediário.
Reviso em até 48h e respondo direto pelo email ou WhatsApp que você informou.

Se houver fit, chamo pra alinhar. Se não houver, indico alternativa honesta.

— Joel`;

  return {
    subject,
    html: renderLayout({
      body,
      title: subject,
      preheader: `Joel reviso pessoalmente em até 48h. Sem fila.`,
    }),
    text,
  };
}

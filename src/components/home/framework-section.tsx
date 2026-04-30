import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';
import s from './framework-section.module.css';

const ps = [
  {
    id: 'P1',
    name: 'Posicionamento',
    subtitle: 'Por quê?',
    desc: 'Como você se diferencia. Base estratégica que define por que você existe.',
  },
  {
    id: 'P2',
    name: 'Público',
    subtitle: 'Pra quem?',
    desc: 'ICP definido = comunicação certeira. Leads qualificados e quantificados.',
  },
  {
    id: 'P3',
    name: 'Produto',
    subtitle: 'O quê?',
    desc: 'Oferta irresistível. Produto bem embalado se vende sozinho.',
  },
  {
    id: 'P4',
    name: 'Programas',
    subtitle: 'Como vender?',
    desc: 'CRM, funis e automação. Sistema pra atrair e converter com previsibilidade.',
  },
  {
    id: 'P5',
    name: 'Processos',
    subtitle: 'Como operar?',
    desc: 'Documentado e escalável. Funciona sem depender de uma pessoa.',
  },
  {
    id: 'P6',
    name: 'Pessoas',
    subtitle: 'Quem executa?',
    desc: 'Time alinhado que entrega. Dono sai da operação.',
  },
];

export function FrameworkSection() {
  return (
    <section className="section bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <div className={s.sectionHead}>
          <div className="kicker">// 02_FRAMEWORK</div>
          <div className={cn('mono', s.sectionHeadMeta)}>OS 6PS DAS VENDAS ESCALÁVEIS</div>
        </div>
        <div className="hair-divider" />

        <div className={s.fwIntro}>
          <h2 className={s.fwTitle}>
            FRAMEWORK <span className="text-acid">6PS</span>
            <br />
            DAS <span className="stroke-text">VENDAS</span> ESCALÁVEIS.
          </h2>
          <p className={s.fwLede}>
            Seis engrenagens. Uma Máquina de Crescimento. Testada em 140+ empresas em 20+ nichos.
            Pula um P e trava o crescimento — é assim que funciona.
          </p>
        </div>

        <div className={s.psGrid}>
          {ps.map((p) => (
            <article key={p.id} className={s.pCard}>
              <div className={s.pNum}>{p.id}</div>
              <div className={s.pBody}>
                <div className={cn('mono', s.pSubtitle)}>{p.subtitle}</div>
                <h3 className={s.pName}>{p.name}</h3>
                <p className={s.pDesc}>{p.desc}</p>
              </div>
              <div className={s.pScanline} />
            </article>
          ))}
        </div>

        <div className={s.fwFooter}>
          <p className={cn('mono', s.fwAssinatura)}>
            <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
            <span className="text-fire">&gt;</span> IMPROVISO
          </p>
          <ButtonLink href="/framework-6ps" variant="primary">
            <span>Ver framework completo</span>
            <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

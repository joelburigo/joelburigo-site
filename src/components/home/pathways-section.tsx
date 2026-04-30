import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';
import s from './pathways-section.module.css';

const pathways = [
  {
    tag: 'PRODUTO PRINCIPAL',
    title: 'VSS — Vendas Sem Segredos',
    subtitle: 'Quer implementar com método próprio?',
    description:
      'DIY perpétuo. Você recebe o Framework 6Ps completo, 15 módulos, 48 mentorias ao vivo com Joel no ano e Growth CRM incluso. Implementa com autonomia em 90 dias guiados.',
    price: '12× R$ 166,42',
    priceNote: 'ou R$ 1.997 à vista · acesso vitalício',
    bullets: [
      '15 módulos implementáveis (90 dias)',
      '48 mentorias ao vivo com Joel · 1/semana',
      'Growth CRM incluído (12 meses)',
      'Comunidade exclusiva',
    ],
    link: '/vendas-sem-segredos',
    cta: 'Ver VSS completo',
    ideal: 'MPE R$ 10–100k/mês · hands-on',
    feat: true,
  },
  {
    tag: 'EXCLUSIVO · POR CONVITE',
    title: 'Advisory — Acesso direto ao Joel',
    subtitle: 'Quer minha mente no seu negócio?',
    description:
      'Premium 1:1. Três formatos: Sessão avulsa, Sprint 30 dias ou Conselho Executivo. Acesso WhatsApp prioritário. Não faço por você — decido com você.',
    price: 'R$ 997–15.000/mês',
    priceNote: 'sessão, sprint ou conselho · avaliação prévia',
    bullets: [
      'Sessão Estratégica · R$ 997 · 90 min',
      'Sprint 30 dias · R$ 7.500 · 4 sessões',
      'Conselho Executivo · R$ 12.500–15k/mês',
      'Garantia: 1ª sessão ou reembolso',
    ],
    link: '/advisory',
    cta: 'Solicitar Advisory',
    ideal: 'R$ 200k+/mês · momento crítico',
    feat: false,
  },
];

export function PathwaysSection() {
  return (
    <section className="section bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <div className={s.sectionHead}>
          <div className="kicker">// 04_CAMINHOS</div>
          <div className={cn('mono', s.sectionHeadMeta)}>2 FORMAS DE TRABALHAR COMIGO</div>
        </div>
        <div className="hair-divider" />

        <div className={s.pwIntro}>
          <h2 className={s.pwTitle}>
            DOIS <span className="stroke-text">CAMINHOS</span>.
            <br />
            <span className="text-acid">ZERO</span> MEIO-TERMO.
          </h2>
          <p className={s.pwLede}>
            Ou você pega o método e implementa com apoio em grupo (VSS). Ou você quer acesso direto
            pra decidir junto comigo (Advisory). Não existe terceirização — eu não faço POR você.
          </p>
        </div>

        <div className={s.pwGrid}>
          {pathways.map((p) => (
            <article
              key={p.title}
              className={cn(p.feat ? 'card-feat' : 'card', s.pwCard, p.feat && s.pwCardFeat)}
            >
              {p.feat && <div className={s.pwRibbon}>★ PRINCIPAL</div>}

              <div className={cn('mono', s.pwTag)}>{p.tag}</div>
              <h3 className={s.pwCardTitle}>{p.title}</h3>
              <p className={s.pwSubtitle}>{p.subtitle}</p>
              <p className={s.pwDesc}>{p.description}</p>

              <ul className={s.pwBullets}>
                {p.bullets.map((b) => (
                  <li key={b} className={s.pwBullet}>
                    <span className={s.pwCheck} aria-hidden="true">
                      ▶
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className={s.pwPriceWrap}>
                <div className={cn(s.pwPrice, p.feat ? 'text-acid' : 'text-cream')}>{p.price}</div>
                <div className={cn('mono', s.pwPriceNote)}>{p.priceNote}</div>
              </div>

              <ButtonLink
                href={p.link}
                variant={p.feat ? 'primary' : 'secondary'}
                className={s.pwCta}
              >
                <span>{p.cta}</span>
                <span aria-hidden="true">→</span>
              </ButtonLink>

              <div className={cn('mono', s.pwIdeal)}>
                Pra quem: <span className={s.pwIdealVal}>{p.ideal}</span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

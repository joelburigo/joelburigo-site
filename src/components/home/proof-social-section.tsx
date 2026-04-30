import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';
import { cases } from '@/data/cases';
import s from './proof-social-section.module.css';

const miniCases = cases
  .filter((c) => c.badge === 'Destaque')
  .slice(0, 3)
  .map((c) => ({
    empresa: c.empresa,
    nicho: c.nicho,
    antes: c.antes,
    depois: c.depois,
    tempo: c.tempo,
    destaque: c.crescimento,
  }));

export function ProofSocialSection() {
  return (
    <section className="section bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <div className={s.sectionHead}>
          <div className="kicker">// 03_PROVA</div>
          <div className={cn('mono', s.sectionHeadMeta)}>RESULTADOS EM 20+ NICHOS VALIDADOS</div>
        </div>
        <div className="hair-divider" />

        <div className={s.proofIntro}>
          <h2 className={s.proofTitle}>
            NÚMERO NÃO <span className="text-fire">MENTE.</span>
            <br />
            <span className="stroke-text">MARKETING</span> BONITO, SIM.
          </h2>
          <p className={s.proofLede}>
            17+ anos. 140+ clientes atendidos pessoalmente.{' '}
            <strong className="text-cream">~R$ 1 bilhão</strong> em vendas estruturadas. Base dos
            6Ps aplicada — não é teoria, é cicatriz.
          </p>
        </div>

        <div className={s.proofStats}>
          <div className={s.proofStat}>
            <div className={cn(s.proofStatNum, 'text-acid')}>17+</div>
            <div className={s.proofStatLabel}>Anos estruturando vendas</div>
          </div>
          <div className={s.proofStat}>
            <div className={cn(s.proofStatNum, 'text-acid')}>140+</div>
            <div className={s.proofStatLabel}>Clientes atendidos</div>
          </div>
          <div className={s.proofStat}>
            <div className={cn(s.proofStatNum, 'text-acid')}>~R$ 1BI</div>
            <div className={s.proofStatLabel}>Em vendas estruturadas</div>
          </div>
          <div className={s.proofStat}>
            <div className={cn(s.proofStatNum, 'text-acid')}>20+</div>
            <div className={s.proofStatLabel}>Nichos validados</div>
          </div>
        </div>

        <div className={s.proofCasesHead}>
          <h3 className={s.proofCasesTitle}>
            TRANSFORMAÇÕES <span className="text-acid">REAIS</span>
          </h3>
          <div className={cn('mono', s.proofCasesMeta)}>DADOS · SEM RETOQUE</div>
        </div>

        <div className={s.proofCasesGrid}>
          {miniCases.map((c) => (
            <article key={c.empresa} className={s.proofCase}>
              <div className={cn('mono', s.proofCaseNicho)}>// {c.nicho}</div>
              <h4 className={s.proofCaseEmpresa}>{c.empresa}</h4>

              <div className={s.proofCaseFlow}>
                <div className={s.proofCaseRow}>
                  <span className={cn('mono', s.proofCaseRowlabel)}>Antes</span>
                  <span className={s.proofCaseVal}>{c.antes}</span>
                </div>
                <div className={s.proofCaseArrow} aria-hidden="true">
                  ▼
                </div>
                <div className={cn(s.proofCaseRow, s.proofCaseRowAfter)}>
                  <span className={cn('mono', s.proofCaseRowlabel)}>Depois</span>
                  <span className={s.proofCaseVal}>{c.depois}</span>
                </div>
              </div>

              <div className={s.proofCaseFoot}>
                <span className={cn(s.proofCaseDelta, 'text-acid')}>{c.destaque}</span>
                <span className={cn('mono', s.proofCaseTempo)}>em {c.tempo}</span>
              </div>
            </article>
          ))}
        </div>

        <div className={s.proofFooter}>
          <ButtonLink href="/cases" variant="secondary">
            <span>Ver todos os cases</span>
            <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

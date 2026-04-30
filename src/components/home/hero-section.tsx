import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';
import s from './hero-section.module.css';

export function HeroSection() {
  return (
    <section className={cn(s.heroSection, 'bg-ink relative overflow-hidden')}>
      <div className="grid-overlay" />
      <div className={s.heroGlow} aria-hidden="true" />

      <Container className="relative z-10">
        <div className={s.heroGrid}>
          <div className={s.heroContent}>
            <div className={cn('kicker', s.heroKicker)}>
              // FRAMEWORK 6PS · 17+ ANOS · 140+ MPES
            </div>

            <h1 className={s.heroH1}>
              <span className={s.line1}>VENDAS</span>
              <span className={s.line2}>
                <span className="stroke-text">PREVISÍVEIS</span> PRA QUEM
              </span>
              <span className={s.line3}>
                CANSOU DE <span className="text-fire">IMPROVISO</span>.
              </span>
            </h1>

            <p className={s.heroLede}>
              17+ anos estruturando vendas escaláveis pra MPE.{' '}
              <strong className="text-cream">140+ clientes</strong>.{' '}
              <strong className="text-cream">~R$ 1 bilhão</strong> em vendas estruturadas. Framework
              6Ps. Zero fórmula mágica.
            </p>

            <div className={s.heroCtas}>
              <ButtonLink href="/vendas-sem-segredos" variant="primary" prefetch>
                <span>Ver VSS completo</span>
                <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink href="/advisory" variant="secondary">
                <span>Falar com Joel (Advisory)</span>
                <span aria-hidden="true">→</span>
              </ButtonLink>
            </div>

            <div className={cn('mono', s.heroSignature)}>
              <span className="text-acid">★</span>&nbsp;&nbsp;SISTEMA{' '}
              <span className="text-fire">&gt;</span> IMPROVISO
            </div>

            <div className={s.heroStats}>
              <div className={s.heroStat}>
                <div className={cn(s.heroStatNum, 'text-acid')}>~R$ 1BI</div>
                <div className={s.heroStatLabel}>Estruturado</div>
              </div>
              <div className={s.heroStat}>
                <div className={cn(s.heroStatNum, 'text-acid')}>140+</div>
                <div className={s.heroStatLabel}>Clientes</div>
              </div>
              <div className={s.heroStat}>
                <div className={cn(s.heroStatNum, 'text-acid')}>17+</div>
                <div className={s.heroStatLabel}>Anos</div>
              </div>
            </div>
          </div>

          <aside className={s.heroTerminal} aria-hidden="true">
            <div className={s.termChrome}>
              <span className={s.termDot} style={{ background: 'var(--jb-fire)' }} />
              <span className={s.termDot} style={{ background: '#FFB800' }} />
              <span className={s.termDot} style={{ background: 'var(--jb-acid)' }} />
              <span className={s.termTitle}>jb_core — diagnóstico.exe</span>
            </div>
            <div className={s.termBody}>
              <div className={s.termLine}>
                <span className={s.termPrompt}>$</span> ./executar_diagnostico --6ps
              </div>
              <div className={cn(s.termLine, s.termDim)}>&gt; scanning P1 posicionamento...</div>
              <div className={s.termLine}>
                <span className="text-acid">▶</span> P1 · OK
              </div>
              <div className={s.termLine}>
                <span className="text-acid">▶</span> P2 · OK
              </div>
              <div className={s.termLine}>
                <span className="text-fire">●</span> P3 · GARGALO DETECTADO
              </div>
              <div className={s.termLine}>
                <span className="text-fire">●</span> P4 · GARGALO DETECTADO
              </div>
              <div className={s.termLine}>
                <span className="text-acid">▶</span> P5 · OK
              </div>
              <div className={s.termLine}>
                <span className="text-acid">▶</span> P6 · OK
              </div>
              <div className={cn(s.termLine, s.termDim)}>&gt; score: 18/30</div>
              <div className={s.termLine}>
                <span className={s.termPrompt}>$</span> ligar_maquina
                <span className={s.termCursor}>_</span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}

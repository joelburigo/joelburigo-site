import Image from 'next/image';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/utils';
import s from './quem-sou-section.module.css';

export function QuemSouSection() {
  return (
    <section className="section bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <div className={s.sectionHead}>
          <div className="kicker">// 00_QUEM-SOU</div>
          <div className={cn('mono', s.sectionHeadMeta)}>ORIGEM · PALHOÇA/SC · 1987 →</div>
        </div>
        <div className="hair-divider" />

        <div className={s.qsGrid}>
          <div className={s.qsPhotoWrap}>
            <div className={s.qsPhoto}>
              <Image
                src="/images/joel-burigo-vendas-sem-segredos-2-800w.webp"
                alt="Joel Burigo"
                width={800}
                height={1000}
                sizes="(max-width: 768px) 100vw, 40vw"
                loading="lazy"
                className={s.qsImg}
              />
              <div className={s.qsPhotoOverlay} />
            </div>
            <div className={cn('mono', s.qsPhotoCaption)}>
              ● JOEL BURIGO · <span className="text-acid">RIBEIRÃO DA ILHA / SC</span>
            </div>
          </div>

          <div className={s.qsContent}>
            <h2 className={s.qsTitle}>
              <span className="stroke-text">EXECUTOR</span> QUE QUEBROU,
              <br />
              RECONSTRUIU E <span className="text-fire">SISTEMATIZOU</span>.
            </h2>

            <p className={s.qsLede}>
              Sou Joel Burigo. Nasci em 1987, Palhoça/SC, filho de marceneiro e vendedora de loja.
              Quebrei minha primeira empresa aos 25, em 2012 — calote de sócio. Seis meses num
              barraco em Ribeirão das Neves/MG, R$ 1.400/mês nos Correios pra colocar encomenda na
              esteira.
            </p>

            <p className={s.qsBody}>
              Reconstruí batendo porta em 100+ empresas.{' '}
              <strong className="text-cream">17+ anos depois</strong>: 140+ clientes atendidos
              pessoalmente. ~R$ 1 bilhão em vendas estruturadas. A base dos 6Ps nasceu do erro real
              e virou método formalizado em 2025.
            </p>

            <p className={s.qsBody}>
              Não sou guru motivacional. Não sou consultor de terno que some depois do PowerPoint.
              Sou <strong className="text-cream">mentor-executor</strong>: ensino o método e
              implemento junto. É o que funciona pra MPE brasileira.
            </p>

            <div className={s.qsMeta}>
              <div className={s.qsMetaItem}>
                <div className={cn('mono', s.qsMetaLabel)}>Origem</div>
                <div className={s.qsMetaVal}>Palhoça/SC · 1987</div>
              </div>
              <div className={s.qsMetaItem}>
                <div className={cn('mono', s.qsMetaLabel)}>Quebra</div>
                <div className={s.qsMetaVal}>Mar/2012 · 25 anos</div>
              </div>
              <div className={s.qsMetaItem}>
                <div className={cn('mono', s.qsMetaLabel)}>Base hoje</div>
                <div className={s.qsMetaVal}>Ribeirão da Ilha / SC</div>
              </div>
              <div className={s.qsMetaItem}>
                <div className={cn('mono', s.qsMetaLabel)}>Foco</div>
                <div className={s.qsMetaVal}>Vendas Escaláveis pra MPE</div>
              </div>
            </div>

            <ButtonLink href="/sobre" variant="secondary" className={s.qsCta}>
              <span>História completa</span>
              <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

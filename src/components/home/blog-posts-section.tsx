import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/patterns/container';
import { ButtonLink } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { getPublishedPosts } from '@/server/services/blog';
import { blogImageUrl } from '@/lib/blog-image';
import s from './blog-posts-section.module.css';

export async function BlogPostsSection() {
  const allPosts = await getPublishedPosts();
  const recentPosts = allPosts.slice(0, 3);

  return (
    <section id="blog" className="section bg-ink relative overflow-hidden">
      <div className="grid-overlay" />

      <Container className="relative z-10">
        <div className={s.sectionHead}>
          <div className="kicker">// 07_ARQUIVO</div>
          <div className={cn('mono', s.sectionHeadMeta)}>
            PUBLICAÇÕES RECENTES · VENDAS ESCALÁVEIS
          </div>
        </div>
        <div className="hair-divider" />

        <div className={s.blogIntro}>
          <h2 className={s.blogTitle}>
            INSIGHTS SOBRE
            <br />
            <span className="stroke-text">VENDAS</span> ESCALÁVEIS.
          </h2>
          <p className={s.blogLede}>
            Estratégia, processo e cicatriz real. Nada de post bonito sem substância — post bonito
            no Instagram não paga boleto.
          </p>
        </div>

        {recentPosts.length > 0 && (
          <div className={s.blogGrid}>
            {recentPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={s.blogCard} prefetch>
                {post.cover_image_path && (
                  <div className={s.blogThumb}>
                    <Image
                      src={blogImageUrl(post.cover_image_path, { width: 640 })}
                      alt={post.cover_image_alt || post.title}
                      width={640}
                      height={400}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      className={s.blogThumbImg}
                    />
                  </div>
                )}

                <div className={s.blogBody}>
                  {post.published_at && (
                    <time
                      dateTime={post.published_at.toISOString()}
                      className={cn('mono', s.blogDate)}
                    >
                      {formatDate(post.published_at, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }).replace(/\//g, '.')}
                    </time>
                  )}

                  <h3 className={s.blogPostTitle}>{post.title}</h3>

                  {post.excerpt && <p className={s.blogExcerpt}>{post.excerpt}</p>}

                  <div className={s.blogRead}>
                    <span>Ler artigo</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className={s.blogFooter}>
          <ButtonLink href="/blog" variant="secondary">
            <span>Ver arquivo completo</span>
            <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

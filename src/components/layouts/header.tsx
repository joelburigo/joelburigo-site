'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui';
import { Container } from '@/components/patterns/container';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { StatusBarTop } from './status-bar-top';
import { MobileMenu } from './mobile-menu';

interface HeaderProps {
  transparent?: boolean;
  showStatusBar?: boolean;
}

const navLinks = [
  { name: 'Vendas Sem Segredos', path: '/vendas-sem-segredos' },
  { name: 'Advisory', path: '/advisory' },
  { name: 'Blog', path: '/blog' },
];

const secondaryLinks = [
  { name: 'Sobre', path: '/sobre' },
  { name: 'Cases', path: '/cases' },
];

export function Header({ transparent = false, showStatusBar = true }: HeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bg = scrolled || !transparent ? 'bg-ink/90 backdrop-blur-md' : 'bg-transparent';

  return (
    <header
      ref={ref}
      className={cn(
        'sticky top-0 right-0 left-0 z-50 border-b border-[var(--jb-hair)] transition-colors duration-[180ms]',
        bg
      )}
    >
      {showStatusBar && <StatusBarTop />}
      <Container>
        <div className="relative flex items-center justify-between py-4 md:py-5">
          <Link href="/" aria-label="Joel Burigo · Home" className="z-50 shrink-0">
            <Logo size="lg" />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="jb-nav-link text-cream hover:text-acid font-mono text-[12px] font-semibold tracking-[0.22em] uppercase transition-colors duration-[180ms]"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-6 md:flex">
            <ButtonLink href="/diagnostico" variant="primary">
              Diagnóstico <span className="font-mono">→</span>
            </ButtonLink>
          </div>

          <MobileMenu navLinks={navLinks} secondaryLinks={secondaryLinks} />
        </div>
      </Container>
    </header>
  );
}

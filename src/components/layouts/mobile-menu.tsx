'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ButtonLink } from '@/components/ui';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface NavLink {
  name: string;
  path: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  secondaryLinks: NavLink[];
}

export function MobileMenu({ navLinks, secondaryLinks }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="text-cream relative z-50 inline-flex size-11 items-center justify-center md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-ink w-full max-w-full border-l-[var(--jb-hair-strong)] sm:max-w-md"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <div className="flex flex-col gap-8 pt-4">
          <Logo size="lg" asLink />
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.path}>
                <Link
                  href={link.path}
                  className={cn(
                    'font-display text-cream text-2xl font-black tracking-tight uppercase',
                    'hover:text-acid transition-colors'
                  )}
                >
                  {link.name}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="h-px bg-[var(--jb-hair)]" />
          <nav className="flex flex-col gap-3">
            {secondaryLinks.map((link) => (
              <SheetClose asChild key={link.path}>
                <Link
                  href={link.path}
                  className="text-fg-3 hover:text-acid font-mono text-xs tracking-[0.22em] uppercase transition-colors"
                >
                  {link.name}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-4">
            <SheetClose asChild>
              <ButtonLink href="/diagnostico" variant="primary">
                Diagnóstico <span className="font-mono">→</span>
              </ButtonLink>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

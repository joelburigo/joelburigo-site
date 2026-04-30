'use client';
import { Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui';

export function NewPostButton() {
  return (
    <ButtonLink href="/admin/blog/new" variant="primary" size="sm">
      <Plus className="size-4" /> Novo post
    </ButtonLink>
  );
}

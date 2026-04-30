# Mapa de Páginas — joelburigo-site

Inventário completo de todas as rotas do app, categorizadas por acesso. Atualizado: 2026-04-30.

> Nota: rotas em `src/app/api/*` (route handlers) **não estão listadas** aqui — só páginas renderizáveis (`page.tsx`).

---

## 🌐 Públicas — Marketing (sem auth)

Conteúdo institucional + funil de aquisição. Todo mundo vê.

| URL                          | Arquivo                                                        | Descrição                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/`                          | `(marketing)/page.tsx`                                         | **Home** — hero, framework 6Ps, prova social, pathways VSS/Advisory     |
| `/sobre`                     | `(marketing)/sobre/page.tsx`                                   | Sobre Joel Burigo — história + dependência do fundador                  |
| `/cases`                     | `(marketing)/cases/page.tsx`                                   | Estudos de caso aplicados                                                |
| `/contato`                   | `(marketing)/contato/page.tsx`                                 | Form de contato genérico                                                 |
| `/jornada-90-dias`           | `(marketing)/jornada-90-dias/page.tsx`                         | Roadmap dos 90 dias do VSS                                              |
| `/privacidade`               | `(marketing)/privacidade/page.tsx`                             | Política de privacidade (LGPD)                                           |
| `/termos`                    | `(marketing)/termos/page.tsx`                                  | Termos de uso                                                            |

### Blog público

| URL                          | Arquivo                                                        | Descrição                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/blog`                      | `(marketing)/blog/page.tsx`                                    | Lista de posts publicados                                               |
| `/blog/[slug]`               | `(marketing)/blog/[slug]/page.tsx`                             | Post individual (cover + áudio + markdown)                              |

### Produto VSS

| URL                          | Arquivo                                                        | Descrição                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/vendas-sem-segredos`       | `(marketing)/vendas-sem-segredos/page.tsx`                     | **Sales page VSS** — hero + framework 6Ps + stack/preço + checkout      |
| `/vss-aguardando-pagamento`  | `(marketing)/vss-aguardando-pagamento/page.tsx`                | Pós-checkout — pagamento pendente                                       |
| `/vss-analise-credito`       | `(marketing)/vss-analise-credito/page.tsx`                     | Pós-checkout — análise de crédito                                       |
| `/vss-compra-aprovada`       | `(marketing)/vss-compra-aprovada/page.tsx`                     | Pós-checkout — compra aprovada (boas-vindas)                            |

### Produto Advisory

| URL                          | Arquivo                                                        | Descrição                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/advisory`                  | `(marketing)/advisory/page.tsx`                                | **Sales page Advisory** — hero + 3 formatos + cases + filtros           |
| `/advisory-aplicacao`        | `(marketing)/advisory-aplicacao/page.tsx`                      | Form de aplicação Advisory (qualifica antes do convite)                 |
| `/advisory-obrigado`         | `(marketing)/advisory-obrigado/page.tsx`                       | Pós-aplicação Advisory                                                  |
| `/agendamento-sessao`        | `(marketing)/agendamento-sessao/page.tsx`                      | Calendário pra agendar sessão estratégica avulsa (R$ 997)               |
| `/sessao/[id]`               | `(marketing)/sessao/[id]/page.tsx`                             | Página pública de sessão agendada (link compartilhável)                 |
| `/sessao/agendar`            | `(marketing)/sessao/agendar/page.tsx`                          | Fluxo público de agendamento (entrada genérica)                         |

### Diagnóstico (lead capture)

| URL                          | Arquivo                                                        | Descrição                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/diagnostico`               | `(marketing)/diagnostico/page.tsx`                             | Wizard 6Ps — qualifica lead em 5 perguntas                              |
| `/diagnostico-obrigado`      | `(marketing)/diagnostico-obrigado/page.tsx`                    | Pós-submit (genérico)                                                   |
| `/diagnostico-resultado`     | `(marketing)/diagnostico-resultado/page.tsx`                   | Resultado personalizado por nível 6Ps                                   |

### Outros públicos

| URL                          | Arquivo                                                        | Descrição                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/obrigado`                  | `(marketing)/obrigado/page.tsx`                                | Genérica de "obrigado" (form contato etc)                               |
| `/apresentacao`              | `apresentacao/page.tsx`                                        | Slides standalone (sem layout marketing)                                 |
| `/links`                     | `links/page.tsx`                                               | Linktree — link na bio das redes sociais                                 |
| `/checkout/sucesso`          | `checkout/sucesso/page.tsx`                                    | Webhook MP redirect — pagamento aprovado                                |
| `/checkout/pendente`         | `checkout/pendente/page.tsx`                                   | Webhook MP redirect — pagamento pendente                                |
| `/checkout/erro`             | `checkout/erro/page.tsx`                                       | Webhook MP redirect — pagamento falhou                                  |

---

## 🔐 Auth — Magic Link

Fluxo de login. Sem sessão ativa exigida (entrada).

| URL          | Arquivo                          | Descrição                                                  |
| ------------ | -------------------------------- | ---------------------------------------------------------- |
| `/entrar`    | `(auth)/entrar/page.tsx`         | Form de email pra receber magic link                       |
| `/verificar` | `(auth)/verificar/page.tsx`      | Tela "verifica teu email" após enviar magic link           |

> Callback do magic link: `/api/auth/callback` (route handler, redireciona pra `/admin` se admin, `/app/area` se user).

---

## 👤 Privadas — Aluno (autenticado)

Acesso requer JWT válido (`requireUser` no layout). Sob `(app)/app/*`. Path completo no browser: `/app/...`.

| URL                          | Arquivo                                                        | Descrição                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/app/area`                  | `(app)/app/area/page.tsx`                                      | **Dashboard** do aluno VSS — overview de fases + progresso              |
| `/app/onboarding`            | `(app)/app/onboarding/page.tsx`                                | Wizard 6Ps inicial (após primeira compra)                               |
| `/app/fase/[slug]`           | `(app)/app/fase/[slug]/page.tsx`                               | Fase VSS (F1..F7) — lista de destravamentos                             |
| `/app/destravamento/[slug]`  | `(app)/app/destravamento/[slug]/page.tsx`                      | Destravamento individual — workspace com agente IA + artifacts          |
| `/app/sessao/[id]`           | `(app)/app/sessao/[id]/page.tsx`                               | Mentoria ao vivo (CF Stream) ou replay (player + presence tracker)      |
| `/app/advisory/dashboard`    | `(app)/app/advisory/dashboard/page.tsx`                        | Dashboard cliente Advisory — agenda + sessões + WhatsApp                |

> Layout `(app)/app/layout.tsx` chama `requireUser()`. Se não logado: redirect `/entrar?next=/app/...`. Onboarding: `requireOnboarded()` força wizard antes de liberar área (admins têm bypass).

---

## 🛠️ Privadas — Admin (autenticado + role=admin)

Acesso requer JWT + `role === 'admin'` (`requireAdmin` no layout). Sob `(admin)/admin/*`. Path no browser: `/admin/...`.

### Painel principal

| URL                                  | Arquivo                                                       | Descrição                                                              |
| ------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/admin`                             | `(admin)/admin/page.tsx`                                      | **Dashboard admin** — overview geral                                    |
| `/admin/leads`                       | `(admin)/admin/leads/page.tsx`                                | Inbox de leads (diagnóstico, contato, advisory)                         |
| `/admin/users`                       | `(admin)/admin/users/page.tsx`                                | Gestão de alunos (entitlements, status)                                  |

### Mentorias / Calendário

| URL                                  | Arquivo                                                       | Descrição                                                              |
| ------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/admin/mentorias`                   | `(admin)/admin/mentorias/page.tsx`                            | CRUD de mentorias VSS (CF Stream Live Inputs)                           |
| `/admin/agenda`                      | `(admin)/admin/agenda/page.tsx`                               | Agenda interna unificada (Sprint 3)                                     |
| `/admin/disponibilidade`             | `(admin)/admin/disponibilidade/page.tsx`                      | Slots disponíveis pro Advisory/agendamento                              |
| `/admin/integrations/google`         | `(admin)/admin/integrations/google/page.tsx`                  | OAuth Google Calendar (sync 2-vias)                                     |

### Blog CMS

| URL                                  | Arquivo                                                       | Descrição                                                              |
| ------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/admin/blog`                        | `(admin)/admin/blog/page.tsx`                                 | Lista de posts (drafts + publicados)                                    |
| `/admin/blog/new`                    | `(admin)/admin/blog/new/page.tsx`                             | Cria draft mínimo + redirect pro editor                                 |
| `/admin/blog/[id]`                   | `(admin)/admin/blog/[id]/page.tsx`                            | Editor Tiptap + image upload + scheduling                               |

### Operacional

| URL                                  | Arquivo                                                       | Descrição                                                              |
| ------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/admin/agent-usage`                 | `(admin)/admin/agent-usage/page.tsx`                          | Dashboard de uso do agente IA (tokens, custo) — daily rollup            |
| `/admin/refunds`                     | `(admin)/admin/refunds/page.tsx`                              | Reembolsos pendentes (15 dias garantia)                                 |

> Layout `(admin)/layout.tsx` chama `requireAdmin()`. Se não admin: redirect `/app/area`.

---

## 🤖 API & metadata (não renderizam UI)

Apenas pra referência:

| URL                                  | Tipo                                                          | Descrição                                                              |
| ------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/api/*`                             | Route handlers                                                | Endpoints REST — auth, payments, agent, admin, calendar, cron, queue   |
| `/sitemap.xml`                       | `app/sitemap.ts`                                              | Sitemap SEO (gerado dinamicamente)                                      |
| `/robots.txt`                        | `app/robots.ts`                                               | Diretrizes de crawler                                                    |

---

## Resumo numérico

| Categoria              | Páginas | Status                                      |
| ---------------------- | ------- | ------------------------------------------- |
| Públicas — Marketing   | 22      | Maioria portada do Astro · algumas pendentes |
| Públicas — Checkout    | 3       | Funcionais (pós-MP webhook)                  |
| Públicas — Outros      | 2       | apresentação + linktree                      |
| Auth                   | 2       | Sprint 1 ✅                                  |
| Privadas — Aluno       | 6       | Sprint 2 (dashboard + onboarding + workspace) |
| Privadas — Admin       | 12      | Sprint 4 (CMS + agenda + mentorias)          |
| **Total**              | **47**  | —                                           |

---

## Layouts e proteção

```
src/app/
├── layout.tsx                  Root (fonts, toaster, metadata, GTM)
├── (marketing)/layout.tsx      Header + Footer público
├── (auth)/layout.tsx           Layout enxuto p/ login
├── (app)/app/layout.tsx        Sidebar aluno · requireUser/Onboarded
├── (admin)/layout.tsx          Sidebar admin · requireAdmin
└── checkout/layout.tsx         Layout pós-checkout (sem header/footer)
```

Auth aplicada via `src/server/services/session.ts`:
- `requireUser(nextPath?)` — JWT obrigatório
- `requireOnboarded()` — JWT + perfil 6Ps completo (admins bypass)
- `requireAdmin()` — JWT + role=admin

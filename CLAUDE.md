# CLAUDE.md — joelburigo-site

Site público + plataforma VSS/Advisory do Joel Burigo. **Next.js 16 App Router** (React 19, Node 22). Categoria: **interno**.

## Resumo

| Item             | Valor                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Cliente          | Joel Burigo (próprio)                                                                          |
| Produção         | https://joelburigo.com.br · Cloudflare Workers env=prod                                        |
| Homologação      | https://dev.joelburigo.com.br · Cloudflare Workers env=dev (auto-deploy push main)             |
| Stack            | Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui                                     |
| Adapter         | `@opennextjs/cloudflare` 1.19+ · custom-worker.ts adiciona scheduled() + queue()                |
| Banco            | Neon Postgres (branches `dev` + `production`) via Cloudflare Hyperdrive                        |
| ORM              | Drizzle (`postgres` driver, Workers-safe)                                                      |
| Jobs             | Cloudflare Cron Triggers (4 crons) + Cloudflare Queues `joelburigo-jobs` (+ DLQ)               |
| LLM              | Vercel AI SDK · OpenAI default (`gpt-5.2`, `gpt-image-2`) · adapter Anthropic via env          |
| Storage          | Cloudflare R2 (`joelburigo-artifacts` + `joelburigo-next-cache` p/ ISR)                        |
| Imagens          | Cloudflare Image Transformations via `/cdn-cgi/image/...` (`src/lib/blog-image.ts`)            |
| Vídeo            | Cloudflare Stream Live Input (OBS → RTMP → HLS)                                                |
| Pagamento        | Mercado Pago BR (default) + Stripe US (fallback cartão internacional)                          |
| Email            | Brevo API (transacional)                                                                       |
| CI/CD            | GH Actions: ci.yml (PR) · deploy-dev.yml (push main → dev) · deploy-prod.yml (manual + approval) |
| Tunnel dev local | `pnpm dev:tunnel` → `dev.joelburigo.com.br` opcional pra testar webhooks                       |

## Estrutura do repo

```
joelburigo-site/
├── docs/                        ← intocável; fora do build (.dockerignore)
│   ├── conteudo/                FONTE DE VERDADE: estratégia, copy, marca, marketing
│   │   ├── partes/              4 partes núcleo (01-marca · 02-oferta · 03-vss · 04-playbook)
│   │   ├── recursos/            copy-bank · templates · scripts-videos
│   │   ├── brand/               Direção visual Terminal Growth
│   │   ├── marketing/           Produção de peças (posts IG, emails, slides)
│   │   └── _archive/            Desativados reversíveis (ex: Services)
│   └── backend/PROPOSAL.md      Proposta arquitetura (vivo, v0.5)
│
├── src/
│   ├── app/                     Next.js App Router
│   │   ├── (marketing)/         site público (10 rotas)
│   │   ├── (auth)/              magic link (Sprint 1)
│   │   ├── (app)/               área logada (/area, /destravamento, /onboarding) — Sprint 2
│   │   ├── (admin)/             /admin/* role-protected — Sprint 4
│   │   ├── api/                 route handlers (forms, health, payments, agent, admin)
│   │   ├── globals.css          tokens Terminal Growth
│   │   ├── layout.tsx · sitemap.ts · robots.ts · error.tsx · not-found.tsx
│   │
│   ├── components/              5 camadas
│   │   ├── ui/                  primitives shadcn customizados (Button, Card, Dialog, ...)
│   │   ├── patterns/            Container, SectionHeader, StatusBar (domain-agnostic)
│   │   ├── sections/            Hero, ProofBar, Framework6Ps, Pathways, FinalCta
│   │   ├── features/            por domínio (vss/, advisory/, blog/, agent/, admin/, auth/, onboarding/, payments/)
│   │   └── layouts/             Header, Footer, MobileMenu, StatusBarTop
│   │
│   ├── server/                  backend (`import 'server-only'`)
│   │   ├── db/{schema,client,seed}.ts
│   │   ├── services/            blog, payments, auth, vss, agent, ... (incremental por sprint)
│   │   ├── lib/                 adapters: llm (OpenAI/Anthropic) · storage (R2) · kv (pg) · queue (CF Queues)
│   │   └── jobs/                handlers de cron + queue dispatchers
│   │       ├── scheduled.ts     roteia cron expression → handler
│   │       ├── dispatch.ts      roteia job name (vindo da CF Queue) → handler
│   │       ├── types.ts         tipo Job<T> mínimo (legado pg-boss)
│   │       └── *.ts             handlers individuais (advisory, calendar, blog, agent-usage)
│   │
│   ├── lib/                     utils client+server safe (cn, fonts, contact, blog-image, ...)
│   ├── data/                    data estática versionada (cases.ts)
│   ├── content/blog/            posts MD (migrados pra DB via pnpm db:migrate-blog)
│   ├── assets/images/           imagens originais — ver assets/README.md
│   └── env.ts                   Zod env validator
│
├── custom-worker.ts             Worker entry — wrappa OpenNext + scheduled() + queue()
├── wrangler.jsonc               Config CF (envs dev/prod · Hyperdrive · R2 · Queues · Crons)
├── open-next.config.ts          Config @opennextjs/cloudflare
├── public/                      assets estáticos servidos pelo Worker
├── .env.tpl                     1Password CLI references
└── drizzle.config.ts
```

Antes de criar copy ou componente, **consulte `docs/conteudo/README.md`** (índice único de conteúdo + marca). Não invente tom, vocabulário ou cases. `docs/conteudo/` é fonte de verdade humana — `cp` 1:1 pra qualquer copy nova.

## Produtos ativos

- **VSS — Vendas Sem Segredos** (DIY perpétuo, R$ 1.997) — principal
- **Advisory** (1:1 com Joel) — Sessão R$ 997 · Sprint R$ 7.500 · Conselho R$ 15k/mês (manual)

Services foi descontinuado (arquivado em `docs/conteudo/_archive/parte9-services.md`).

## Direção atual

- **Visual:** Terminal Growth — fire `#FF3B0F` + acid `#C6FF00` sobre preto `#050505`, Archivo Black + Archivo + JetBrains Mono. Radius 0, brutalist shadows offset. Tokens `--jb-*` em `src/app/globals.css` (Tailwind v4 `@theme`). Ver `docs/conteudo/brand/README.md`.
- **Migração Astro → Next concluída em 2026-04-24** (Sprint 0). Páginas pendentes (sobre, cases, contato, jornada-90-dias, apresentação, links, advisory-aplicação, advisory-obrigado, agendamento-sessao, diagnostico-obrigado, diagnostico-resultado, vss-analise-credito) serão portadas incrementalmente — referência visual fica no Astro em produção até cutover.
- **Antes de gerar peça** (post, email, slide, anúncio, landing): ler `docs/conteudo/brand/ANTI_DRIFT.md` + `USAGE.md`. Templates copiáveis em `docs/conteudo/brand/templates/`.

> 📘 **Operação completa**: ver `docs/backend/RUNBOOK.md` (deploy, secrets, jobs, troubleshooting, IDs CF, decisão Secrets Store).

## Stack/comandos

```bash
pnpm dev               # http://localhost:4321 (next dev contra Neon dev)
pnpm dev:tunnel        # opcional: tunnel pra testar webhooks externos
pnpm typecheck && pnpm lint
pnpm db:push           # aplica schema Drizzle no Postgres apontado por DATABASE_URL
pnpm db:seed           # admin Joel + 4 products + 7 fases VSS + 15 módulos + 66 destravamentos
pnpm db:studio         # UI Drizzle
pnpm db:migrate-blog   # importa posts MD de docs/blog/ pra blog_posts (idempotente)

# Cloudflare
pnpm cf:build          # roda OpenNext build → .open-next/worker.js
pnpm cf:preview        # wrangler dev (testa scheduled/queue handlers locais)
pnpm cf:deploy:dev     # deploy em joelburigo-site-dev (dev.joelburigo.com.br)
pnpm cf:deploy:prod    # deploy em joelburigo-site (joelburigo.com.br) — manual
```

## Deploy

`git push main` → GH Actions:

1. `ci.yml` — typecheck + lint (também roda em PR)
2. `deploy-dev.yml` — auto-deploy em `dev.joelburigo.com.br` (Cloudflare Workers)
3. `deploy-prod.yml` — manual via `workflow_dispatch` + GH environment `production` com required reviewer

Cada commit de main vai pra dev automaticamente. Pra prod, abre Actions → Deploy production → digita `PROD` no input → aprova review → deploy.

## Secrets

**Locais (.env)**: 1Password CLI references em `.env.tpl`.

**Cloudflare** (subidos via `node scripts/cf-secrets-from-env.mjs <dev|prod>`):
- App: JWT_SECRET, OPENAI_API_KEY, MP_*, BREVO_*, R2_*, etc
- Worker-only: CRON_SECRET (separado dev/prod, gerado com `openssl rand -base64 32`)

**GitHub Actions**:
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `DATABASE_URL_DEV`, `DATABASE_URL_PROD` (Neon connection strings)

## Cron Triggers ativos

Definidos em `wrangler.jsonc[env.<env>.triggers.crons]`:

- `0 3 * * *` — agent-usage-rollup (diário 03:00 UTC)
- `*/30 0-3,9-23 * * *` — calendar pull Google · 30min · pausa 1-6h BRT (4-8h UTC)
- `0 4 * * *` — calendar webhook renew (diário 04:00 UTC)
- `*/30 0-3,9-23 * * *` — publish-due-posts blog · 30min · pausa 1-6h BRT (4-8h UTC)

**Por que `*/30` + janela de pausa**: Neon free tier conta CU-hr (compute-hours).
Cron `*/5` mantinha o compute acordado 24/7 (auto-suspend só dispara em 5min idle)
→ ~720 CU-hr/mês mesmo sem 1 visita. Com `*/30` + 5h de pausa de madrugada, o
compute consegue suspender entre execuções e a janela 1-6h BRT garante 5h corridas
de zero atividade. Resultado: ~78 invocações/dia (era 386), -80%. Trade-off: posts
agendados pra madrugada publicam só às 6h BRT (aceitável — ninguém lê às 3h).

## Roadmap

Detalhe completo em `docs/backend/PROPOSAL.md` (v0.5). Sprints:

- **Sprint 0** ✅ — Migração Astro → Next + design system + Drizzle + Docker (concluído 2026-04-24, ver `SPRINT-0-DELIVERY.md`)
- **Sprint 1** — Foundation + checkout Mercado Pago + magic link + forms + migração 12 posts blog
- **Sprint 2** — Onboarding conversacional + área VSS + workspace com agente (`gpt-5.2`)
- **Sprint 3** — Advisory (3 modalidades) + agenda interna unificada (`/admin/agenda`) com sync 2-vias Google Calendar — consolida advisory, mentorias, aulas, activities, eventos externos
- **Sprint 4** — Mentorias (CF Stream Live Input via OBS) + admin + blog CMS Tiptap
- **Sprints 5+** — Resto dos 56 destravamentos VSS (incremental)

# Plano de Reformulação — Site + CRM all-in-one

Plano consolidado pra transformar joelburigo-site num **sistema all-in-one**: vender pelo site → trabalhar leads no CRM → entregar produtos. Atualizado 2026-04-30.

---

## Diagnóstico do estado atual (auditoria)

✅ **Já existe:**
- Schema CRM completo: `contacts`, `opportunities`, `pipelines`, `stages`, `activities`, `payment_events`
- `form_submissions` (contato + advisory_aplicacao em JSONB) e `diagnostico_submissions` (estruturada)
- `/admin/leads` com KanbanBoard funcional (sem drag-drop ativo)
- Páginas atuais VSS + Advisory com seções razoáveis
- Auth + checkout MP funcionando
- Cron Triggers + CF Queues (foundation pra conversões offline)

❌ **Faltando:**
- Captura de UTM/gclid/fbclid em forms
- Conversões offline → Google Ads + Meta CAPI
- Auto-criação de `contact + opportunity` em todo form (hoje tem só estrutura, falta wire)
- Drag-drop entre stages no kanban
- Popup "ainda tem dúvidas?"
- Páginas VSS/Advisory com fluxo psicológico cold-to-checkout
- Forms diferenciados por formato Advisory (sessão direto / sprint+conselho aplicação)
- Eventos GTM/Meta nos pontos de conversão (lead, purchase, qualified)

---

## Objetivos da reformulação

1. **Conversão**: páginas VSS + Advisory levando ICP cru ao checkout/aplicação por fluxo lógico
2. **Captura completa**: todo lead (qualquer fonte) com tracking marketing pronto pra atribuição
3. **CRM operável**: pipeline kanban com stages, drag-drop, atividades, conversões offline disparadas
4. **All-in-one**: lead chega → marketing tracked → vira contato+opportunidade → admin trabalha → conversão volta pro Google/Meta → cliente entregue
5. **Limpeza**: remover legado órfão (`/jornada-90-dias`, `/contato`)

---

## Decisões fechadas (2026-04-30)

| # | Decisão |
|---|---|
| 1 | Advisory: **mesmo pipeline**, stages diferentes (Sessão direta vs Sprint/Conselho aplicação) |
| 2 | Tabelas **separadas por tipo** de lead (mais fácil expandir + qualificação específica). Validators + máscaras (BR tel, CPF, datas) obrigatórios |
| 3 | Google Ads Enhanced Conversions: **sim** |
| 4 | Meta CAPI: Joel pega credenciais |
| 5 | Conselho Executivo: público com aplicação |
| 6 | Cases: **tabela única `testimonials`** alimentando `/cases` + cards na VSS/Advisory (1 fonte de verdade) |
| 7 | Owner: **tudo pro Joel** |
| 8 | Email transacional: sim, **gerenciado via Config Hub no admin** |

**Decisão ⭐ adicional**: criar **Config Hub** centralizado em `/admin/config` com tudo que é editável (preços, ofertas, copy promo, garantia, email templates, feature toggles, webhook URLs). Source of truth no DB, não hardcoded.

---

## 10 Fases (ordem de dependência)

### Fase 1 — Schema + captura de marketing tracking *(foundation)*
**Esforço: ~8h**

Backend pronto pra receber attribution + tabelas separadas por tipo de lead + validators.

**1.1 Tabela centralizada `lead_attribution`** (FK opcional pra qualquer lead):
```sql
CREATE TABLE lead_attribution (
  id text PRIMARY KEY,
  contact_id text REFERENCES contacts(id) ON DELETE CASCADE,
  -- UTM
  utm_source text, utm_medium text, utm_campaign text,
  utm_term text, utm_content text,
  -- Click IDs
  gclid text, fbclid text, msclkid text, ttclid text,
  -- Page context
  referrer text, first_landing_page text, last_landing_page text,
  -- Device
  device text, browser text, os text,
  -- Geo (resolvido server-side via CF headers)
  country text, region text, city text,
  -- Meta CAPI
  fbp text, fbc text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_attribution_contact ON lead_attribution(contact_id);
CREATE INDEX idx_lead_attribution_gclid ON lead_attribution(gclid) WHERE gclid IS NOT NULL;
```

**1.2 Tabelas de leads separadas por tipo** (decisão #2):
- `diagnostico_submissions` (já existe — mantém)
- `lead_doubts` **NOVA** — popup "ainda tem dúvidas?" (campos: nome, email, whatsapp, duvida, produto_interesse vss/advisory)
- `advisory_applications` **NOVA** — formulário Sprint/Conselho com campos qualificação:
  - faturamento_mensal_range (enum: <100k / 100-200k / 200-500k / 500k-1M / >1M)
  - setor, tamanho_time, anos_no_mercado
  - dor_principal_md (textarea), urgencia (1-5)
  - tentou_consultoria_antes (bool), qual_consultoria (text)
  - timeline_esperada (3m/6m/12m+)
  - formato_interesse (sprint/conselho)
  - disponibilidade_semanal_horas

Cada uma tem `attribution_id` FK pra `lead_attribution`.

**1.3 Server service** `src/server/services/marketing-attribution.ts`:
- `parseAttributionFromRequest(req, body)` → extrai UTM/clids/referrer/CF geo headers
- `persistAttribution(data) → attribution_id`
- `linkAttributionToContact(contactId, attributionId)`

**1.4 Client capture** `src/lib/attribution.ts`:
- Hook `useAttribution()` lê `window.location.search` no mount
- Persiste em cookie `__jb_attr` (90d) — **first-touch wins**, atualiza last-touch
- Captura também `_fbp` / `_fbc` cookies do Meta Pixel
- Componente `<AttributionFields />` invisível em todo form (hidden inputs auto-preenchidos)

**1.5 Validators + máscaras client-side** (`src/lib/validators.ts`):
- Telefone BR: `(11) 99999-9999` máscara + Zod schema (`/^\(\d{2}\) \d{5}-\d{4}$/`)
- CPF/CNPJ máscara + check-digit validator
- Date inputs: locale BR `dd/mm/yyyy`
- Email: Zod email + DNS check opcional server-side

Componentes `<MaskedPhoneInput>`, `<MaskedCpfInput>`, `<MaskedDateInput>` reusáveis.

**1.6 Wire forms existentes** — diagnóstico/contato/advisory-aplicacao leem cookie + chamam `parseAttributionFromRequest` no submit.

---

### Fase 2 — Conversões offline (Google Ads + Meta CAPI)
**Esforço: ~8h**

Cada lead/oportunidade ganha event server-side pra ROAS dos anúncios.

**2.1 Service `src/server/services/conversions.ts`:**
- `sendGoogleAdsConversion({ gclid, conversionAction, value, currency })` — Google Ads Enhanced Conversions API
- `sendMetaCAPI({ event_name, event_id, fbclid, user_data, custom_data })` — Meta Conversion API

**2.2 Trigger points (queue jobs via CF Queue):**
| Evento | Disparado em | Google Ads | Meta CAPI |
|---|---|---|---|
| `lead_diagnostico` | submit `/diagnostico` | conversionAction "Lead" | event_name "Lead" |
| `lead_contato` | popup "Dúvidas?" | "Lead" | "Lead" |
| `lead_advisory` | submit aplicação Sprint/Conselho | "Lead Qualified" | "Lead" |
| `purchase_vss` | webhook MP success | "Purchase" + value 1997 | "Purchase" + value 1997 |
| `purchase_advisory_session` | webhook MP success | "Purchase" + value 997 | "Purchase" |
| `opportunity_won` | admin marca won | "Sales" + value (manual) | (opcional) |

**2.3 Dashboard `/admin/conversions`:**
- Tabela últimos 50 eventos enviados
- Status: enviado / falhou / pendente retry
- Filtros: source, evento, período

---

### Fase 3 — Reformulação `/vendas-sem-segredos` (cold MPE → checkout)
**Esforço: ~12h**

Estrutura nova em **15 seções** com fluxo psicológico:

| # | Seção | Conteúdo | Objetivo |
|---|---|---|---|
| 1 | **Hero** | Promise: "De vendas aleatórias para previsíveis. Em 90 dias." + CTA "Como funciona ↓" | Engaja em 3s |
| 2 | **Problema** | "Faturando R$ 10-100k mas..." 3 dores: vendas instáveis · refém · marketing sem ROI | Identifica leitor |
| 3 | **Quem é Joel** | 17 anos · 140+ empresas · 1bi vendas · da quebrada ao bilhão · foto + breve | Credibilidade |
| 4 | **O que é VSS** ⭐ | "Não é app, não é curso solto. É sistema implementável." Explica: portal logado + mentorias ao vivo + Growth CRM + comunidade | Anti-objeção formato |
| 5 | **Os 6Ps** | Framework explicado (já existe) | Método tangível |
| 6 | **As 7 fases (90 dias)** | Roadmap consolida `/jornada-90-dias` | Timeline + previsibilidade |
| 7 | **Stack empilhada** | R$ 17.287 | Justifica preço |
| 8 | **Prova social** | Cases + depoimentos + métricas | Confiança |
| 9 | **Pra quem é / não é** | Filtro honesto | Auto-qualificação |
| 10 | **FAQ objeções** | "R$ 1997 caro?" "Sem tempo?" "Meu nicho?" "Sem tráfego pago?" "Já tentei curso?" "E se não der?" | Quebra objeções |
| 11 | **Garantia 15 dias** | Badge + reforço | Reduz risco |
| 12 | **CTA Final** | Bloco preço + CheckoutButton (já existe) | Conversão |
| 13 | **Ainda tem dúvidas?** ⭐ | Popup form (Fase 6) | Captura passiva |
| 14 | Footer | — | — |

**Cada seção** ganha:
- `id` ancorável
- Mini-CTA recorrente "Ver investimento ↓" no fim das seções 5, 8, 11

---

### Fase 4 — Reformulação `/advisory` (enterprise → fluxos diferenciados)
**Esforço: ~8h**

Igual VSS mas ICP enterprise + 3 CTAs distintos por formato.

**Estrutura:**
1. **Hero** (já feito) — punch line + selos + Ver formatos
2. **Problema** — refém da operação · vendas que não escalam · tech vira gambiarra
3. **Quem é Joel** — versão enterprise (140+ empresas + 1bi)
4. **3 Formatos** com CTAs diferenciados:
   - **Sessão Avulsa R$ 997** → CTA `[Comprar agora]` → CheckoutButton MP direto
   - **Sprint 30 dias R$ 7.500** → CTA `[Aplicar pra Sprint]` → form aplicação → Pipeline Advisory stage "Aplicação"
   - **Conselho R$ 12.5-15k/mês** → CTA `[Aplicar pro Conselho]` → form aplicação → mesmo fluxo
5. **Cases enterprise** — depoimentos com NDA-friendly (R$ X em pipeline, não nome)
6. **Como é trabalhar com Joel** — não DFY, é cabeça, sem PowerPoint
7. **FAQ** — objeções específicas advisory
8. **Ainda tem dúvidas?** — popup
9. Footer

**Form aplicação Sprint/Conselho** (`/advisory-aplicacao` reformulado):
- Faturamento atual mensal (range)
- Setor / segmento
- Maior dor estratégica hoje (textarea)
- Já tentou consultoria antes? (sim/não + qual)
- Disponibilidade (sprint exige 4 sessões em 30 dias)
- Timeline esperada
- nome / email / whatsapp / cargo

Submit → cria contact + opportunity (pipeline=advisory, stage="Aplicação aguardando triagem"), envia email pro Joel + dispara conversão "Lead Qualified".

---

### Fase 5 — Pipeline / CRM admin completo
**Esforço: ~16h**

Auto-criação + drag-drop + atividades + integração.

**5.1 Auto-criação `contact + opportunity` em todo form:**
- Service `src/server/services/lead-intake.ts`:
  - `intakeFromForm({ source, email, name, whatsapp, payload, attribution })` → 
    1. upsert contact (por email)
    2. cria opportunity no pipeline correto
    3. cria activity 'form'
    4. enqueue conversion event
- Hooks em:
  - `/api/forms/diagnostico` → pipeline=vss, stage="Diagnóstico"
  - `/api/forms/contato` (popup dúvidas) → pipeline=vss, stage="Lead frio"
  - `/api/forms/advisory-aplicacao` → pipeline=advisory, stage="Aplicação"
  - Webhook MP success VSS → pipeline=vss, stage="Comprado", cria entitlement
  - Webhook MP success Advisory Sessão → pipeline=advisory, stage="Sessão paga"

**5.2 Stages padrão por pipeline (db:seed):**
- **VSS** (`vss`): `Lead frio` → `Diagnóstico feito` → `Em conversa` → `Proposta enviada` → `Comprado` → (won) / `Lost`
- **Advisory** (`advisory`): `Aplicação aguardando` → `Em triagem` → `Aprovado` → `Sessão marcada` → `Em execução` → (won) / `Lost`

**5.3 Kanban admin completo:**
- Drag-drop entre stages com mutate via API
- Filtros: pipeline · owner · source · período · valor
- Busca: nome / email / whatsapp
- Detail panel ao clicar card:
  - Histórico activities (timeline)
  - Botões: criar nota, criar task, marcar won/lost, mandar email/WhatsApp
  - Campos: contact data, attribution origem, último touch
- Bulk actions: mover N cards, atribuir owner

**5.4 Dashboard `/admin`:**
- Tile leads/mês · conversion rate · MRR projetado
- Funnel chart por pipeline (open/won/lost por stage)
- Lista das 10 últimas atividades

---

### Fase 6 — Popup "Ainda tem dúvidas?"
**Esforço: ~3h**

Componente reusável capturando lead frio passivo.

**6.1 Componente `<DoubtsPopup productSlug="vss" />`:**
- Abre via:
  - Botão CTA na seção 13 das landings
  - Trigger automático: scroll-end (~85% da página, fire 1x por sessão)
- Form: nome · email · whatsapp · dúvida (textarea)
- Submit → POST `/api/forms/duvidas` → `intakeFromForm({ source: 'duvidas_vss' })` (Fase 5)
- Confirmação inline: "Joel responde em até 24h. Já tá no nosso radar."

**6.2 Endpoint `/api/forms/duvidas`** + Zod validation + rate-limit IP.

---

### Fase 7 — ⭐ Config Hub no admin
**Esforço: ~10h**

Centralizar tudo que é editável (preços, copy promocional, condições, templates) em DB + admin UI.

**7.1 Tabela `app_config`** (key-value tipado por namespace):
```sql
CREATE TABLE app_config (
  namespace text NOT NULL,    -- 'pricing', 'offer', 'email', 'feature', 'integration'
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by text REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (namespace, key)
);
```

**7.2 Namespaces iniciais:**

| Namespace | Keys exemplos |
|---|---|
| `pricing` | `vss.price_cents`, `vss.installments_count`, `advisory.session_price_cents`, `advisory.sprint_price_cents`, `advisory.council_price_min_cents`, `advisory.council_price_max_cents` |
| `offer` | `vss.guarantee_days`, `vss.stack_total_cents`, `vss.value_props[]`, `advisory.benefits[]`, `vss.bonus_items[]` |
| `email` | `from_transactional`, `from_personal`, `template.diagnostico_thanks`, `template.advisory_application`, `template.welcome_vss` |
| `feature` | `popup_doubts.enabled`, `auto_email_admin.enabled`, `popup_doubts.scroll_threshold` |
| `integration` | `n8n.webhook_url`, `meta_capi.enabled`, `google_ads.customer_id`, `evolution.instance_name` |

**7.3 Service `src/server/services/config.ts`:**
- `getConfig<T>(namespace, key, fallback)` → cached
- `setConfig(namespace, key, value, userId)` → invalida cache + log audit
- Cache: KV in-memory + revalidate 5min

**7.4 Admin UI `/admin/config`:**
- Tabs por namespace
- Form por chave (input tipado conforme schema do value)
- Audit log: quem mudou o quê e quando
- Diff viewer (valor antigo vs novo)

**7.5 Wire em todo lugar que hoje é hardcoded:**
- `src/components/sections/vss-page.tsx` — preço, stack, garantia
- `src/components/sections/advisory-page.tsx` — preços formatos
- Email templates pegam de `getConfig('email', ...)`
- Feature toggles em layout: `if (await getConfig('feature', 'popup_doubts.enabled')) ...`

**7.6 Default seeds** em `src/server/db/seed.ts` (cria registros iniciais com valores atuais).

---

### Fase 8 — ⭐ Depoimentos centralizados (`testimonials`)
**Esforço: ~4h**

Source of verdade única alimentando `/cases` + cards em VSS/Advisory.

**8.1 Tabela `testimonials`:**
```sql
CREATE TABLE testimonials (
  id text PRIMARY KEY,
  client_name text NOT NULL,
  client_role text,
  client_company text,
  client_segment text,           -- 'consultoria', 'b2b', 'saude', etc
  client_revenue_range text,     -- '10-100k', '200k+', '1M+'
  quote_md text NOT NULL,
  result_metric text,            -- '3x faturamento em 6m', 'R$ 2M em pipeline'
  product_used text,             -- 'vss' / 'advisory'
  case_title text,               -- pra /cases
  case_md text,                  -- markdown longo opcional
  cover_image_path text,
  client_photo_path text,
  featured boolean DEFAULT false,
  published boolean DEFAULT true,
  position int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_testimonials_product_featured ON testimonials(product_used, featured) WHERE published;
```

**8.2 Migrar dados existentes** de `/cases` (hoje em `src/data/cases.ts`) pro DB via script `scripts/seed-testimonials.ts`.

**8.3 Admin UI `/admin/testimonials`:**
- CRUD list + editor
- Upload de fotos (R2 via Stream Live Input pattern)
- Toggle featured, publish, position
- Filter por product_used

**8.4 Components que consomem:**
- `<TestimonialCarousel productSlug="vss" featured />` — VSS prova social
- `<TestimonialCarousel productSlug="advisory" featured />` — Advisory cases enterprise
- `/cases/page.tsx` — server component lista todos publicados

---

### Fase 9 — Cleanup do legado
**Esforço: ~2h**

**Remover:**
- `src/app/(marketing)/jornada-90-dias/page.tsx` (conteúdo migra pra seção 6 da nova VSS)
- `src/app/(marketing)/contato/page.tsx` (substituído pelo popup)
- Componentes específicos não usados após migração

**Configurar 301 redirects em `next.config.ts`:**
```ts
{ source: '/jornada-90-dias', destination: '/vendas-sem-segredos#fases', permanent: true }
{ source: '/contato', destination: '/diagnostico', permanent: true }
```

**Atualizar:**
- `src/app/sitemap.ts` (remove URLs órfãs)
- `docs/PAGINAS.md`

---

### Fase 10 — Documentação
**Esforço: ~3h**

- `docs/CRM-PIPELINE.md` — modelo de pipeline + stages + automações
- `docs/MARKETING-ATTRIBUTION.md` — captura UTM/clids + conversões offline
- `docs/PAGINAS.md` atualizado
- `docs/conteudo/partes/02-oferta.md` — alinhar com nova estrutura de fluxos

---

## Sprint plan (ordem sugerida)

| Sprint | Fases | Esforço | Deliverable |
|---|---|---|---|
| **S1 — Foundation** | 1 + 2 | 16h | Schema + tracking + tabelas tipadas + validators + conversões offline |
| **S2 — Backend infra** | 7 + 8 | 14h | Config Hub + tabela testimonials populada |
| **S3 — UI Front** | 3 + 6 + 4 | 23h | Páginas reformuladas com 6Ps/cases puxados do DB + popup |
| **S4 — Admin Ops** | 5 | 16h | CRM completo (drag-drop kanban + intake + activities) |
| **S5 — Cleanup** | 9 + 10 | 5h | Legado removido + docs |
| **Total** | — | **~74h** | — |

> Sprint 2 (Config Hub + testimonials) **antes** de Sprint 3 (UI) é proposital: páginas novas vão consumir do DB desde o início, evitando hardcode → refactor depois.

---

## Backlog futuro (fora do plano atual)

- Email automation sequence pós-diagnóstico (drip 5 emails em 7 dias)
- WhatsApp automation via Evolution API (webhook → mensagem template)
- A/B testing de hero VSS (2 variantes punch line)
- Integração com Google Calendar pra Sessão Avulsa (auto-cria evento após pagamento)
- Quiz interativo "Quanto tô perdendo por improviso?" como lead magnet

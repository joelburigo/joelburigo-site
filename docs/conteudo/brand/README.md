# Joel Burigo — Design System

**Especialista em vendas escaláveis para MPEs brasileiras. Criador dos 6Ps das Vendas Escaláveis.**
Direção: **Terminal Growth** — tech/growth/sales brutalismo. Fogo `#FF3B0F` (urgência) + acid `#C6FF00` (growth) sobre preto puro `#050505` + cream `#F5F1E8`. DNA de terminal de trading encontra empreendedor da quebrada.

---

## Índice

### Guias operacionais (ler nesta ordem antes de produzir peça)

- [`SKILL.md`](SKILL.md) — quickstart Claude Code
- [`ANTI_DRIFT.md`](ANTI_DRIFT.md) — **regras duras** (palavras proibidas, provas exatas, assinaturas canônicas, vocabulário)
- [`USAGE.md`](USAGE.md) — decision tree "pediu X → usa Y"
- [`EXAMPLES.md`](EXAMPLES.md) — 8 pares BAD vs GOOD comentados
- [`MOBILE.md`](MOBILE.md) — safe zones, breakpoints, adaptações por device, armadilhas
- [`MIGRATION.md`](MIGRATION.md) — checklist pra migrar produção `src/` pro Terminal Growth

### Referências visuais

- `master.html` — **referência canônica** (hero com terminal + 6Ps console + growth chart + cases + tiers + manifesto + CTA)
- `homepage.html` — landing institucional
- `ig_posts.html` — 8 posts Instagram (540×540) — manifesto / mega número / case / quote / 6Ps / depoimento / capa carrossel / terminal
- `colors_and_type.css` — todos os tokens (vars CSS `--jb-*`) + elementos semânticos (fogo + acid + cyan + mono)

### Templates copiáveis (`templates/`)

Skeletons por canal — copie o arquivo, edite copy seguindo ANTI_DRIFT, entregue.

- `templates/ig-feed.html` — Instagram feed 1080×1080 (4 variantes: manifesto · mega-número · antes/depois · citação)
- `templates/ig-story.html` — Instagram Story 1080×1920 (4 variantes: teaser · stat · pergunta · case flash)
- `templates/ig-carrossel.html` — Carrossel IG 1080×1350 (8 slides: capa + P1–P6 + CTA)
- `templates/linkedin.html` — Post LinkedIn 1200×1200 (3 variantes: reflexão · case · anúncio Advisory)
- `templates/email.html` — Email marketing 620px dark-safe (3 variantes: nurture · pitch VSS · reativação)
- `templates/slide-apresentacao.html` — Deck 1920×1080 (5 layouts: capa · stat · 6P · case · CTA)
- `templates/yt-thumb.html` — Thumbnail YouTube 1280×720 (3 variantes: provocação · mega-número · terminal)
- `templates/ad-meta.html` — Anúncio Meta (2 VSS + 2 Advisory, feed + story) com caption pronta pro Ads Manager

### Assets

- `assets/logo.svg` — wordmark `JOEL|BURIGO`
- `assets/logo-mark.svg` — mark "JB" quadrado (fire)
- `assets/logo-mark-acid.svg` — variante mark acid

### Preview do design system

- `preview/index.html` — galeria navegável de todos os 25 cards
- `preview/` — cards individuais:
  - **Brand:** `brand-logo.html`
  - **Colors:** `colors-core.html` · `colors-accents.html` (fire+acid+cyan) · `colors-neutrals.html`
  - **Type:** `type-display.html` (stroke+glitch) · `type-body.html` · `type-mono.html`
  - **Spacing:** `spacing-scale.html` · `spacing-radii.html` · `spacing-shadows.html`
  - **Components base:** `components-buttons.html` · `components-badges.html` · `components-cards.html` · `components-inputs.html` · `components-6ps.html` · `components-stats.html` · `components-navbar.html`
  - **Components assinatura:** `components-terminal.html` · `components-ticker.html` · `components-statusbar.html` · `components-eyebrow.html` · `components-section-head.html` · `components-case-slab.html` · `components-manifesto.html` · `components-chart.html`

---

## CONTENT FUNDAMENTALS

**Voz:** brasileira direta, provocadora, parceira. Autoridade técnica + raiz de quebrada. Pitada tech/terminal ("executar diagnóstico", "ligar a máquina", "módulo", "pipeline").

**Arquétipos:** MENTOR + CONSTRUTOR — sábio que ensina + executor que implementa junto.

**Casing:**

- Títulos display: **UPPERCASE** (Archivo Black), com pedaços em `outline-stroke` pra criar ritmo.
- Sub-títulos e corpo: frase normal.
- Micro-copy (ticker, eyebrows, bylines, status): UPPERCASE MONO com separadores `·` prefixos `//` e `★`.

**Pronome:** **"você"** predominante (formal coloquial). **"Tu"** cirúrgico pra momento de autenticidade sul-catarinense — especialmente em frases-bandeira como _"se tua empresa depende de ti, tu não tem empresa — tu tem emprego"_. Evitar mistura aleatória no mesmo parágrafo.

**Assinaturas canônicas:**

- "Sistema > Improviso"
- "Bora pra cima"
- "Let's grow" / "Let's grow, CARALHO!" (versão autêntica)
- "Ligar a Máquina" (implementar os 6Ps)
- "Da quebrada ao bilhão"
- "Sem enrolação" · "Na moral"
- "Fatura R$ 200k+ e depende de você? Não é empresa. É emprego"
- "Marketing sem vendas é hobby caro"
- "Improviso mata mais empresa que crise"

**Vocabulário proprietário (caixa-alta apenas em título):**

- **6Ps das Vendas Escaláveis** — nome oficial da metodologia. Pode abreviar para **6Ps** quando o contexto estiver claro. P1 Posicionamento · P2 Público · P3 Produto · P4 Programas · P5 Processos · P6 Pessoas. Nome e estrutura formal em 2025; lançamento público no VSS em 2026; base aplicada antes disso sem esse nome.
- **Máquina de Crescimento** — o movimento. Sistema integrado de marketing + vendas + growth.
- **Growth CRM** — plataforma all-in-one proprietária (CRM + funis + automação + landing pages).
- **Vendas Escaláveis** — não "vendas" — vendas que crescem sem você trabalhar 3× mais.

**Produtos (arquitetura 2 caminhos):**

- **VSS — Vendas Sem Segredos** (DIY · principal) · 6Ps em 90 dias · R$ 1.997 à vista ou 12× R$ 166,42 · público R$ 10–100k/mês · divulgação aberta
- **Advisory** (Premium 1:1 · exclusivo) · Sessão · Sprint 30d · Conselho Executivo · R$ 997–15.000/mês · público R$ 200k+/mês · convite/indicação

Não existe meio-termo (serviço terceirizado). _Services (DWY) foi descontinuado — arquivado em `docs/conteudo/_archive/parte9-services.md`._

**Provas de autoridade:** 17+ anos · 140+ clientes atendidos · ~R$ 1 bilhão em vendas estruturadas ao longo de 17+ anos (estimativa agregada, não número auditado) · base dos 6Ps aplicada antes do nome formal.

**Localização canônica:** Ribeirão da Ilha, Florianópolis/SC. Lat. -27.59 · Lng. -48.55.

**Emoji:** só `★`, `▶`, `→`, `●`, `▲ ▼`. Nunca emoji facial.

**Números como elemento gráfico:** use apenas provas oficiais de `ANTI_DRIFT.md §4`: `+433%`, `+250%`, `+65%`, `+60% a +140%`, `17+`, `140+`, `20+`, `~R$ 1 bilhão`, `×8,33`, `1.800+`. Sempre GIGANTES, em fogo (alerta) ou acid (growth). Quando usar `~R$ 1 bilhão`, manter o til e, quando houver espaço, escrever "estimativa agregada em 17+ anos".

**Tech overlays:** "EST. 2008", "SYS ONLINE", coordenadas de Floripa, clock ao vivo. Dá densidade e autoridade técnica.

---

## VISUAL FOUNDATIONS

**Cores** — 5 tokens-core:

- `--jb-ink` `#050505` (base, preto absoluto)
- `--jb-ink-2` `#0B0B0B` (cards/terminal)
- `--jb-cream` `#F5F1E8` (foreground quente)
- `--jb-fire` `#FF3B0F` (cor-sinal · urgência · CTA)
- `--jb-acid` `#C6FF00` (growth · sucesso · highlight tech)

O sistema é **bicolor de acento**: fogo pra urgência/marketing, acid pra growth/sucesso/tech. Cyan `--jb-cyan` `#00E0FF` é reserva pra dados ao vivo. Nunca 3 acentos no mesmo viewport — fogo + acid é o par.

**Variantes de acento (fire/acid)** — cada acento tem família de 6 tokens pra estados:

| Estado           | Fire                       | Acid                       |
| ---------------- | -------------------------- | -------------------------- |
| base             | `--jb-fire` `#FF3B0F`      | `--jb-acid` `#C6FF00`      |
| hot (hover)      | `--jb-fire-hot` `#FF6A3D`  | `--jb-acid-hot` `#D6FF3D`  |
| deep (pressed)   | `--jb-fire-deep` `#D93D12` | `--jb-acid-deep` `#9ACC00` |
| soft (bg 10-12%) | `--jb-fire-soft`           | `--jb-acid-soft`           |
| soft-2 (bg 20%)  | `--jb-fire-soft-2`         | `--jb-acid-soft-2`         |
| border (35%)     | `--jb-fire-border`         | `--jb-acid-border`         |
| glow (35%)       | `--jb-fire-glow`           | `--jb-acid-glow`           |

Texto sobre fire/acid: sempre `--jb-accent-ink` `#050505`. Neutros foreground: `--jb-fg-1` → `--jb-fg-3` → `--jb-fg-muted` `#6B7280`. Hair padrão: `--jb-hair` rgba(white, 0.08); variante forte: `--jb-hair-strong` rgba(white, 0.16).

**Tipografia** — 3 famílias:

- **Archivo Black** (900) — display UPPERCASE, tracking `-0.035` a `-0.045em`
- **Archivo** 400/500/600/700/800 — body + UI
- **JetBrains Mono** 400/500/700/800 — ticker, byline, status, terminal code (o "sotaque" do sistema)

**Escala tipográfica** (`--jb-fs-*`):

| Token  | Tamanho | Uso típico                      |
| ------ | ------- | ------------------------------- |
| `xs`   | 11px    | status bar, labels micro-mono   |
| `sm`   | 13px    | byline, meta, kicker secundário |
| `base` | 15px    | body default                    |
| `md`   | 17px    | body prominente                 |
| `lg`   | 20px    | lede, intros                    |
| `xl`   | 28px    | H4 / card title                 |
| `2xl`  | 40px    | H3                              |
| `3xl`  | 56px    | H2                              |
| `4xl`  | 80px    | H1                              |
| `5xl`  | 120px   | hero display                    |
| `mega` | 180px   | stat gigante, manifesto         |

Line-heights: `--jb-lh-tight` 0.92 (display), `--jb-lh-snug` 1.05 (headlines), `--jb-lh-base` 1.45 (body).

**Escala de espaçamento** (`--jb-sp-*`, múltiplos de 4px):

| Token   | Valor | Uso                                |
| ------- | ----- | ---------------------------------- |
| `sp-1`  | 4px   | gaps micro                         |
| `sp-2`  | 8px   | padding inline em chips            |
| `sp-3`  | 12px  | gap de status bar                  |
| `sp-4`  | 16px  | padding de card small              |
| `sp-5`  | 20px  | gap de grid component              |
| `sp-6`  | 24px  | padding de card default            |
| `sp-8`  | 32px  | section padding mobile             |
| `sp-10` | 40px  | padding horizontal container       |
| `sp-12` | 48px  | block spacing                      |
| `sp-16` | 64px  | section padding desktop (vertical) |
| `sp-20` | 80px  | grid overlay + hero spacing        |
| `sp-24` | 96px  | section-to-section major           |
| `sp-32` | 128px | hero vertical mobile               |

**Breakpoints** (Tailwind v4 padrão, aplicados em produção):

| Breakpoint | Min-width | Uso                                      |
| ---------- | --------- | ---------------------------------------- |
| `sm`       | 640px     | mobile landscape / tablet portrait small |
| `md`       | 768px     | tablet portrait                          |
| `lg`       | 1024px    | tablet landscape / laptop                |
| `xl`       | 1280px    | desktop                                  |
| `2xl`      | 1536px    | desktop large                            |

Container: `max-width: 1360px`, padding horizontal `40px` desktop / `24px` mobile. Grid overlay 80px fixo em desktop, pode reduzir pra 60px em mobile se ficar ruidoso.

**Contraste / acessibilidade (WCAG 2.1)** — pares testados:

| Combinação                          | Ratio   | Status                                                                                    |
| ----------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| cream `#F5F1E8` sobre ink `#050505` | 18.08:1 | ✅ AAA (qualquer tamanho)                                                                 |
| acid `#C6FF00` sobre ink `#050505`  | 17.18:1 | ✅ AAA (qualquer tamanho)                                                                 |
| fire `#FF3B0F` sobre ink `#050505`  | 5.71:1  | ✅ AA texto normal / AAA texto grande                                                     |
| ink `#050505` sobre fire `#FF3B0F`  | 5.71:1  | ✅ AA texto normal / AAA texto grande                                                     |
| ink `#050505` sobre acid `#C6FF00`  | 17.18:1 | ✅ AAA                                                                                    |
| fg-muted `#6B7280` sobre ink        | 4.22:1  | ⚠️ Falha AA para texto normal; usar só em micro-copy decorativa ou trocar por `--jb-fg-3` |

**Regra operacional:** body em cream-default (sempre AAA). Fire pode passar AA em texto normal, mas continua reservado pra display, links curtos, alertas e CTAs pra preservar hierarquia. `--jb-fg-muted` não deve carregar informação essencial em tamanho pequeno.

**Stroke-text** — pedaços de títulos em `-webkit-text-stroke: 2px cream; color: transparent` pra criar ritmo visual (ver hero do master, manifesto).

**Backgrounds** — preto planos + **grid overlay** 80px fixo (opacidade 0.35) como DNA do sistema. Noise 6% opcional pra texturizar. Sem gradientes chapados; só radial sutil no hero.

**Ticker** — fogo sólido, mono bold, slide infinito 38s. Inclusões em acid destacam KPIs.

**Terminal window** — card com chrome macOS (3 lights: fire/yellow/acid), mono code, cursor piscando em acid. Use pra mostrar diagnóstico, processo, pipeline.

**Status bar topo** — mono 11px, dot acid pulsante, "SYS ONLINE · EST. 2008 · FLORIANÓPOLIS/SC · CLOCK".

**Animação** — `180ms` `cubic-bezier(0.2, 0.9, 0.2, 1)`. Ticker 38s. Dot acid pulse 1.6s. Terminal blink 1s. Hover CTA primário: `translate(-2px,-2px)` + sombra offset dura (4/6/8px) em cor oposta (fire→acid, acid→fire). Glitch 3s nos títulos-herói (sutil).

**Hover states** — links: underline acid expande 0→100% em 180ms. Cards 6P: bg `rgba(198,255,0,0.03)` + scanline top 2px acid expandindo + número passa de `rgba(cream,0.12)` pra acid com glow. Cards tier: lift `-2px` + sombra offset 6px em fogo ou acid.

**Borders** — 1px `rgba(255,255,255,0.08)` divisores (`--jb-hair`); acid accent `rgba(198,255,0,0.35)`; fogo accent `rgba(255,59,15,0.35)`. Cards tier em destaque: borda cheia acid + gradient `rgba(acid,0.06)` fundo.

**Shadows (brutalistas)** — só offset duros, sem blur:

- `4px 4px 0 fire` (botão primário)
- `6px 6px 0 acid` (botão fire gigante)
- `6px 6px 0 fire` (card tier no hover)
- `0 40px 80px rgba(0,0,0,0.6)` (terminal)
  Nunca softglow exceto dot pulse (`0 0 10px acid`).

**Corner radii** — `0` por padrão (cantos duros = assinatura). `2px` raríssimo em chips.

**Cards** — `#0B0B0B` + 1px `--jb-hair`. Sem radius. Hover: borda fogo + sombra offset 6px. Variante "feat" (o mais pedido): borda acid + gradient bg `linear-gradient(180deg, rgba(198,255,0,0.06), #0B0B0B)`.

**Layout rules** — grids com borda externa 1px e divisores internos 1px (sem gap). `max-width: 1360px` container. Section head: kicker mono acid `// 01_FRAMEWORK` · título H2 gigante · meta mono à direita. Hair-separators de 1px cream-translúcido.

**Glitch** — efeito RGB shift nos heros (clip-path 48% top/bottom, translate ±3px, cores fogo/cyan). Uso cirúrgico — 1 palavra por página. Ver `master.html`.

**Imagery vibe** — quando houver foto do Joel: b&w alto contraste, grain sutil, nunca colorizada. Possível overlay scanline ou grid.

---

## ICONOGRAPHY

**Sistema padrão:** `★` marcador de prestígio · `→` CTAs e direção · `▶` play/vídeo · `●` status live · `▲ ▼` deltas de stats · `//` prefixo mono técnico · `>` em watermarks ("SISTEMA > IMPROVISO").

**Icon font:** Lucide via CDN quando precisar de conjunto amplo (`<script src="https://unpkg.com/lucide@latest"></script>`, stroke 1.5px).

**SVGs do projeto:**

- `assets/logo.svg` — wordmark completo
- `assets/logo-mark.svg` — mark "JB" fogo
- `assets/logo-mark-acid.svg` — variante mark acid

**Emoji/símbolos permitidos:** `★`, `▶`, `→`, `●`, `▲`, `▼`. Nunca emoji facial, mãos, coração, foguete ou fogo como emoji.

---

## Fonte canônica de conteúdo

Copy, cases, histórias e manifesto vivem em `docs/conteudo/` — estrutura pós-refactor 2.0 (4 partes núcleo + recursos):

| Fonte                        | O que tem                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `partes/01-marca.md`         | História Joel · manifesto · tom de voz · vocabulário · 7 inimigos · movimento Máquina de Crescimento |
| `partes/02-oferta.md`        | 2 produtos (VSS + Advisory) · jornada · projeções · marketing por produto                            |
| `partes/03-programa-vss.md`  | Framework 6Ps · arquitetura dos 15 módulos · 90 dias · Growth CRM · garantia                         |
| `partes/04-playbook-vss.md`  | Playbook implementável · 7 fases · 66 destravamentos                                                 |
| `recursos/copy-bank.md`      | **Frases canônicas · objeções · transformações · urgência · prova social**                           |
| `recursos/scripts-videos.md` | Scripts de vídeo das páginas principais                                                              |
| `recursos/templates.md`      | Canvas · relatórios · playbooks comerciais                                                           |

**Antes de inventar copy, leia sempre:** `01-marca.md` (voz + vocabulário) + `recursos/copy-bank.md` (frases prontas) + este README (regras visuais). Para regras anti-erro-LLM: `ANTI_DRIFT.md`. Para decisão de template por canal: `USAGE.md`. Para exemplos bons vs ruins: `EXAMPLES.md`.

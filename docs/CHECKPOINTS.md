# Checkpoint Log
Full session reports from `/checkpoint`, newest first. The cold-start brief lives in
PLAN.md's Current Focus; this file is the uncapped history behind it.

## 2026-07-03 — 3f9eecd — Brainstorm → BUILDING → core converter shipped; repo public

**What shipped (whole project history — first checkpoint):**
- **Brainstorming closed, phase → BUILDING.** v1 decisions locked: YAML frontmatter + body output; paste → options → preview web UX; options panel = replies toggle (user-set limit) + image mode (embed/link); stats always in frontmatter; v1 keeps threads, images, quotes, replies, X Articles.
- **Research win that reshaped the plan:** FxTwitter's repo moved to **FxEmbed/FxEmbed**, which ships a keyless **v2 API** — `/2/thread/{id}` (whole thread, one call), `/2/conversation/{id}` (real replies, cursor-paginated), `article` object with full Draft.js content blocks inside `/2/status/{id}`. OpenAPI spec: `FxEmbed/FxEmbed/docs/specs/fxtwitter-openapi.json`. This killed two planned workarounds (manual thread walking; syndication reply tricks) — both in PLAN's Rejected Ideas.
- **Core converter** (`src/lib/threadmark.ts`, framework-agnostic) + `scripts/check.ts` (`npm run check`). See `docs/feature-core-converter.md`.
- **Next.js 16.2.10 scaffold** (App Router, TS, Tailwind); scaffold's `AGENTS.md` kept ("Next 16 differs from training data — read `node_modules/next/dist/docs/`").
- **GitHub repo** `raihank43/threadmark` created and later flipped **public**.
- **Minimalism ruleset** updated v1→v2, intensity full, scope changed code+chat → **code-only**; relocated from CLAUDE.md append to `.claude/rules/minimalism.md` so growing-docs template upgrades can't clobber it.

**Verification evidence:**
- `npm run check` green: URL parsing asserts (incl. query strings, `/photo/1` suffix), single post (jack/20), 31-tweet thread (naval), exactly-5-replies limit.
- Live spot-checks: NASA photo post in both image modes (X alt text carried through), quote tweet rendering (`> **Quoted @jack (jack):** …`).
- `env -u NODE_ENV npm run build` + `npm run lint` clean.

**Root cause found (hard-won):** machine-global `NODE_ENV=development` crashes `next build` (React prerender `useContext` null — mismatched dev/prod bundles). Ruled out on the way: duplicate React copies (`npm ls react` clean). Captured in feature doc Gotchas, README, and user-level memory.

**Known blind spots:**
- Poll rendering exists but is not live-verified (polls expire; no stable specimen found).
- X Articles renderer not built yet (Draft.js blocks → Markdown; FxEmbed's `src/helpers/article.ts` is the reference parser).
- Syndication fallback deliberately deferred until FxTwitter fails in practice.
- Web UI not started; `src/app/` is untouched scaffold.

**Violation audit:** no documented rule violated or nearly violated this session.

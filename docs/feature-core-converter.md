# Core Converter

_Last updated: 2026-07-03 — recency signal, not a correctness guarantee. If the code has moved past this, trust the code. Files / Dependencies / API below are **derivable caches** — when stale, regenerate them from the code; hand-maintain only the sections above them (the code can't re-derive those)._

## Description

The heart of threadmark: takes an X/Twitter status URL (or bare ID), fetches it from the keyless FxTwitter v2 API, and renders an LLM-ready Markdown document — YAML frontmatter (author, date, url, stats) + body (thread text, media, quotes, polls, optional replies). Framework-agnostic: the web API route and the future MCP server both call `convert()`.

## Decided design

- **Data source:** FxTwitter v2 (`/2/thread/{id}` for the whole thread in one call; `/2/conversation/{id}` cursor-paginated for replies). _(Rejected: manual thread walking and syndication reply tricks — v2 does both natively; see PLAN.md Rejected Ideas.)_
- **Output:** YAML frontmatter + clean body, tweets separated by `---`. _(Rejected: pure prose — loses machine-parseable metadata; verbose per-tweet blocks — noisy for LLMs.)_
- **Replies:** off by default; `replyLimit` follows cursors until the limit. Reply media always renders as links (mode `link`) to keep the section compact.
- **Image modes:** `embed` (`![alt](url)`, default) or `link` (`[Image: alt](url)`) — user-facing toggle in the web UI.

## Gotchas

- **`NODE_ENV=development` is set machine-wide on this dev box** — breaks `next build` (React prerender crash: `Cannot read properties of null (reading 'useContext')`). Build with `env -u NODE_ENV npm run build`. Ruled out on the way: duplicate React copies (`npm ls react` was clean).
- FxTwitter wraps errors in a JSON `code` field even on HTTP 200 — check both `res.ok` and `data.code`.
- `quote` can be a **tombstone** (deleted/unavailable) with no `author`/`text` — render guards on `s.quote?.author`.
- X alt text (`altText`) is often long and descriptive — it's carried into the Markdown deliberately; great LLM context.
- `/2/thread/{id}` returns `thread: null` (not `[]`) for single posts — fall back to `[status]`.
- `views` can be `null` (old tweets) — omitted from frontmatter rather than printing `null`.
- Poll rendering exists but is **not yet live-verified** (no stable poll tweet found; polls expire).
- The check script runs TS directly via Node ≥23 type stripping — no tsx/ts-node dependency. Imports need explicit `.ts` extensions there, which in turn needs `allowImportingTsExtensions` in tsconfig or `next build`'s typecheck fails.

## Files

- `src/lib/threadmark.ts` — the entire core (URL parse → fetch → render)
- `scripts/check.ts` — runnable check (`npm run check`), hits live FxTwitter

## Dependencies

None beyond global `fetch` (Node ≥18). External service: `api.fxtwitter.com` (keyless). Syndication endpoint fallback deliberately **not** implemented yet — add when FxTwitter actually fails in practice.

## API / Interface

```ts
convert(url: string, opts?: { replyLimit?: number; imageMode?: "embed" | "link" })
  → Promise<{ markdown: string; filename: string }>   // filename: {handle}-{id}.md
parseStatusId(input: string): string                  // throws on non-status URLs
```

## Changelog

- 2026-07-03: Initial implementation — single posts, threads, media (both modes), quotes, polls, cursor-paginated replies. Live-verified on jack/20, naval thread (31 tweets), NASA media post, quote tweet.

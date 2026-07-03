# Project Plan

## Project Phase: BUILDING

> **This marker controls how Claude behaves at the start of every session — read it first.**
> - `BRAINSTORMING` — the vision/roadmap below isn't settled yet. Before building features, help the user complete the Vision and Features sections. Ask, propose, refine. Don't jump into code.
> - `BUILDING` — the roadmap is agreed. Follow the normal build workflow in CLAUDE.md.
>
> Flip this to `BUILDING` once the user confirms the roadmap is solid enough to start building.

## Current Focus

> The 30-second cold-start brief — so a fresh session (or a post-compaction one) can resume *without re-reading everything*. Kept current by `/checkpoint`: **the tight brief only** lives here (~15–30 lines); the full session reports go to `docs/CHECKPOINTS.md` (created by `/checkpoint`, newest first). **Read this first**, then read only the docs the "Start here" line points to.

_Last checkpoint: none yet_

- **Just shipped:** core converter (2026-07-03) — `src/lib/threadmark.ts`, live-verified (threads, media, quotes, replies); Next.js 16 scaffold; GitHub repo `raihank43/threadmark` (private)
- **In flight:** nothing — clean stopping point
- **Next:** web UI (paste → options → preview → copy/download) via an API route calling `convert()`; then X Articles renderer (Draft.js blocks → Markdown)
- **Start here:** `docs/feature-core-converter.md`, this file (Decisions Log)

## Vision

**threadmark** converts a Twitter/X post, thread, or article into a well-structured `.md` document — the original post/thread/article, author metadata, attached images, quote tweets, and (best-effort) replies — formatted to be fed directly to an LLM.

Why it exists: X serves an empty JS shell to non-browser fetchers, so LLM tooling (e.g. Claude Code's WebFetch) gets blocked on X links. threadmark routes around this via keyless public JSON endpoints instead of scraping.

Two delivery surfaces, sharing one core converter:
1. **Web app** (Next.js on Vercel) — paste a link, preview, download/copy the `.md`.
2. **Claude Code plugin / MCP server** (later) — hand an X link to Claude and it gets the Markdown; likely a thin client hitting the deployed API, or a local MCP reusing the core library.

### Feasibility notes (verified live, 2026-07-03)
- **FxTwitter API v2** (`api.fxtwitter.com/2/...`) — free, keyless, and far richer than assumed. Verified against the live API and the [FxEmbed/FxEmbed](https://github.com/FxEmbed/FxEmbed) OpenAPI spec (`docs/specs/fxtwitter-openapi.json`):
  - `/2/status/{id}` — single post: text, author, media, quote, poll, community notes, **and an `article` object** (title, cover, full Draft.js `content.blocks` + `entityMap` with MARKDOWN/MEDIA/TWEET entities) for X Articles.
  - `/2/thread/{id}` — native same-author thread; no manual walking needed.
  - `/2/conversation/{id}` — **actual replies** (verified: 36 replies for status 20) with cursor pagination. Supersedes the earlier "$200/mo X API needed for replies" assumption.
  - Also available if ever needed: `/2/status/{id}/quotes`, `/2/profile/{handle}/articles`, `/2/search`.
- **Twitter syndication endpoint** (`cdn.syndication.twimg.com/tweet-result?id=...&token=a`) — verified working, keyless. Single tweets only, **no replies/threads** — fallback if FxTwitter is down.
- **X Articles**: article body is Draft.js blocks; `entityMap` even carries a `markdown` string per MARKDOWN entity → converter needs a blocks→Markdown renderer (FxEmbed's `src/helpers/article.ts` is a reference implementation for parsing the block format).

## Features

Un-triaged ideas live in `docs/BACKLOG.md` (created on demand) — **this table is canonical**: an idea that graduates gets a row here and is deleted from the backlog.

| Feature | Priority | Status | Doc |
|---------|----------|--------|-----|
| Core converter: X post/thread → Markdown (text, author, media, quote tweets; YAML frontmatter + body) | high | done | [feature-core-converter.md](feature-core-converter.md) |
| Web app: paste link → options → preview → download/copy `.md` | high | planned | — |
| Threads via FxTwitter `/2/thread/{id}` | high | done | [feature-core-converter.md](feature-core-converter.md) |
| Attached images in output (embed links) | high | done | [feature-core-converter.md](feature-core-converter.md) |
| Quote tweets inlined as blockquotes | high | done | [feature-core-converter.md](feature-core-converter.md) |
| Replies via FxTwitter `/2/conversation/{id}` (cursor-paginated) | medium | done | [feature-core-converter.md](feature-core-converter.md) |
| X Articles (Draft.js blocks → Markdown) | medium | planned | — |
| Claude Code plugin / MCP server reusing the converter | medium | planned | — |

Status values: `planned` | `in-progress` | `done` | `cut`

## Decisions Log

Record every significant decision so future-you (or post-compaction-you) knows WHY things are the way they are. Append new rows at the bottom — newest last.

| Decision | Rationale | Date |
|----------|-----------|------|
| Name: **threadmark** | Thread → Markdown; works as a product name across web app, MCP server, future CLI | 2026-07-03 |
| Stack: Next.js (App Router) + React + TypeScript on Vercel | User's preferred stack; API routes handle the fetch/convert server-side | 2026-07-03 |
| Data source: FxTwitter API (primary), syndication endpoint (fallback) — no scraping, no official X API for v1 | Keyless, free, reliable JSON; official API is ~$200/mo and only needed for full reply trees | 2026-07-03 |
| MCP/plugin ships *after* the web app, reusing the same core converter | Validate the conversion quality first; the plugin is then a thin wrapper | 2026-07-03 |
| Use FxTwitter **v2** endpoints (`/2/thread`, `/2/conversation`, `/2/status`) | Verified live: native threads + real replies with cursors, keyless — kills both manual thread-walking and the "paid API for replies" constraint | 2026-07-03 |
| Output format: YAML frontmatter (author, date, URL, stats) + clean Markdown body | Machine-parseable metadata + LLM-friendly prose; user picked over pure-prose and verbose per-tweet blocks | 2026-07-03 |
| Web UX: paste → options (replies? stats? images?) → preview → copy/download | User wants control over what lands in the `.md` before converting | 2026-07-03 |
| v1 scope: threads, images, quote tweets, replies, X Articles all in | All verified feasible on keyless endpoints; nothing needs to be cut for feasibility | 2026-07-03 |
| Options panel: **replies toggle** (off by default, user-set limit w/ cursor-following) + **image mode** (embedded `![alt](url)` vs plain links); engagement stats always in frontmatter, no toggle | Two options users actually vary; stats cost nothing in frontmatter | 2026-07-03 |
| Phase → BUILDING; publish to GitHub | Roadmap confirmed by user; repo requested | 2026-07-03 |

## Rejected Ideas

Record ideas we considered and explicitly decided NOT to do. This prevents re-suggesting them after compaction. Append new rows at the bottom — newest last.

| Idea | Why Rejected | Date |
|------|-------------|------|
| Scraping twitter.com/x.com HTML directly (or via WebFetch) | X serves an empty JS shell to non-browser fetchers; headless-browser scraping is fragile and ToS-risky. Keyless JSON endpoints solve it cleanly | 2026-07-03 |
| Official X API for v1 | ~$200/mo basic tier; only strictly needed for full reply trees, which are scoped best-effort instead | 2026-07-03 |
| Names: xtract, tweet2md | xtract leans on X branding that may age poorly; tweet2md reads as a tool, not a product | 2026-07-03 |
| Syndication-endpoint tricks for replies | Verified: syndication `tweet-result` payload has `conversation_count` but no reply objects. Moot anyway — FxTwitter `/2/conversation/{id}` returns real replies keyless | 2026-07-03 |
| Manual same-author thread walking (fetch reply chain hop by hop) | FxTwitter `/2/thread/{id}` returns the whole thread in one call | 2026-07-03 |

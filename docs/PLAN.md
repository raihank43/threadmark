# Project Plan

## Project Phase: BRAINSTORMING

> **This marker controls how Claude behaves at the start of every session — read it first.**
> - `BRAINSTORMING` — the vision/roadmap below isn't settled yet. Before building features, help the user complete the Vision and Features sections. Ask, propose, refine. Don't jump into code.
> - `BUILDING` — the roadmap is agreed. Follow the normal build workflow in CLAUDE.md.
>
> Flip this to `BUILDING` once the user confirms the roadmap is solid enough to start building.

## Current Focus

> The 30-second cold-start brief — so a fresh session (or a post-compaction one) can resume *without re-reading everything*. Kept current by `/checkpoint`: **the tight brief only** lives here (~15–30 lines); the full session reports go to `docs/CHECKPOINTS.md` (created by `/checkpoint`, newest first). **Read this first**, then read only the docs the "Start here" line points to.

_Last checkpoint: none yet_

- **Just shipped:** project scaffolded from the initial pitch (2026-07-03); name, stack, and data-source approach decided
- **In flight:** nothing — clean stopping point
- **Next:** brainstorm the feature set and flows with the user (BRAINSTORMING phase), then flip to BUILDING
- **Start here:** this file (Vision + Decisions Log), `docs/ARCHITECTURE.md`

## Vision

**threadmark** converts a Twitter/X post, thread, or article into a well-structured `.md` document — the original post/thread/article, author metadata, attached images, quote tweets, and (best-effort) replies — formatted to be fed directly to an LLM.

Why it exists: X serves an empty JS shell to non-browser fetchers, so LLM tooling (e.g. Claude Code's WebFetch) gets blocked on X links. threadmark routes around this via keyless public JSON endpoints instead of scraping.

Two delivery surfaces, sharing one core converter:
1. **Web app** (Next.js on Vercel) — paste a link, preview, download/copy the `.md`.
2. **Claude Code plugin / MCP server** (later) — hand an X link to Claude and it gets the Markdown; likely a thin client hitting the deployed API, or a local MCP reusing the core library.

### Feasibility notes (from initial research, 2026-07-03)
- **FxTwitter API** (`api.fxtwitter.com`) — free, keyless JSON for any tweet: text, author, media URLs, quote tweets; can walk same-author threads. Primary data source.
- **Twitter syndication endpoint** (`cdn.syndication.twimg.com`) — keyless; what Vercel's `react-tweet` uses. Fallback/secondary source.
- **Full reply trees** require the paid official X API (~$200/mo basic tier) — so replies are scoped *best-effort* (same-author thread continuation, not arbitrary replies) unless the user later opts into an API key.

## Features

Un-triaged ideas live in `docs/BACKLOG.md` (created on demand) — **this table is canonical**: an idea that graduates gets a row here and is deleted from the backlog.

| Feature | Priority | Status | Doc |
|---------|----------|--------|-----|
| Core converter: X post/thread → Markdown (text, author, media, quote tweets) | high | planned | — |
| Web app: paste link → preview → download/copy `.md` | high | planned | — |
| Thread walking (same-author continuation via FxTwitter) | high | planned | — |
| Attached images in output (embed links; maybe optional download) | medium | planned | — |
| Replies (best-effort; scope TBD during brainstorming) | medium | planned | — |
| X Articles (long-form posts) support | medium | planned | — |
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

## Rejected Ideas

Record ideas we considered and explicitly decided NOT to do. This prevents re-suggesting them after compaction. Append new rows at the bottom — newest last.

| Idea | Why Rejected | Date |
|------|-------------|------|
| Scraping twitter.com/x.com HTML directly (or via WebFetch) | X serves an empty JS shell to non-browser fetchers; headless-browser scraping is fragile and ToS-risky. Keyless JSON endpoints solve it cleanly | 2026-07-03 |
| Official X API for v1 | ~$200/mo basic tier; only strictly needed for full reply trees, which are scoped best-effort instead | 2026-07-03 |
| Names: xtract, tweet2md | xtract leans on X branding that may age poorly; tweet2md reads as a tool, not a product | 2026-07-03 |

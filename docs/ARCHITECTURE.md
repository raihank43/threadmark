# Architecture

_Last updated: 2026-07-03 — recency signal, not a correctness guarantee. The folder tree and data flow below rot fastest; if they disagree with the repo, trust the repo. They're **derivable caches** — when stale, regenerate them from the repo rather than hand-maintaining them line by line._

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Web app | Next.js (App Router) + React + TypeScript | User's stack; server-side API routes avoid CORS and hide the fetch logic |
| Hosting | Vercel | User's deploy target; free tier fits |
| Tweet data | FxTwitter API **v2** (`api.fxtwitter.com/2/thread/{id}`, `/2/conversation/{id}`, `/2/status/{id}`), fallback: syndication endpoint (`cdn.syndication.twimg.com`, single tweets only) | Keyless, free JSON; v2 gives whole threads, real replies (cursor-paginated), and full X Article content in one payload |
| Core converter | Framework-agnostic TS module (fetch → normalize → Markdown) | Must be reusable by the later MCP server / Claude Code plugin |
| LLM integration (later) | MCP server / Claude Code plugin | Thin wrapper over the deployed API or the core module |

## Folder Structure

```
threadmark/
├── .claude/rules/minimalism.md  # minimalism ruleset (v2, full, code-only) — auto-loaded, kept out of CLAUDE.md
├── docs/                    # growing-docs system (PLAN, RULES, feature docs)
├── scripts/check.ts         # runnable converter check (npm run check)
├── src/
│   ├── app/                 # Next.js App Router (scaffold; UI not built yet)
│   └── lib/threadmark.ts    # core converter — framework-agnostic, no Next imports
└── AGENTS.md                # scaffold-generated: Next 16 differs from training data; read node_modules/next/dist/docs
```

## System Overview

{To be refined during brainstorming.} Rough shape: a Next.js app whose API route accepts an X URL, fetches the post/thread JSON from FxTwitter (falling back to the syndication endpoint), normalizes it into an internal model (post, author, media, quote tweets, thread chain), and renders that model to Markdown. The UI is a paste-a-link page with a preview and download/copy. The converter core lives in its own module so the future MCP server/plugin can reuse it without the web layer.

## Data Flow

{To be refined during brainstorming.} X URL (user paste) + options → API route → FxTwitter `/2/thread/{id}` (or `/2/conversation/{id}` when replies requested; article content arrives inside the status payload) → normalized model (post, author, media, quotes, thread chain, replies, article blocks) → Markdown string (YAML frontmatter + body) → previewed in UI / copied / downloaded as `.md`. No database planned for v1 — stateless conversion.

## Key Patterns

{To be filled — architectural patterns used (e.g., MVC, event-driven, repository pattern) and why.}

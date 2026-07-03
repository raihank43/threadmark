# Architecture

_Last updated: 2026-07-03 — recency signal, not a correctness guarantee. The folder tree and data flow below rot fastest; if they disagree with the repo, trust the repo. They're **derivable caches** — when stale, regenerate them from the repo rather than hand-maintaining them line by line._

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Web app | Next.js (App Router) + React + TypeScript | User's stack; server-side API routes avoid CORS and hide the fetch logic |
| Hosting | Vercel | User's deploy target; free tier fits |
| Tweet data | FxTwitter API (`api.fxtwitter.com`), fallback: syndication endpoint (`cdn.syndication.twimg.com`) | Keyless, free JSON — avoids scraping and the paid X API |
| Core converter | Framework-agnostic TS module (fetch → normalize → Markdown) | Must be reusable by the later MCP server / Claude Code plugin |
| LLM integration (later) | MCP server / Claude Code plugin | Thin wrapper over the deployed API or the core module |

## Folder Structure

```
threadmark/
├── docs/
└── ... (to be filled as the project takes shape)
```

## System Overview

{To be refined during brainstorming.} Rough shape: a Next.js app whose API route accepts an X URL, fetches the post/thread JSON from FxTwitter (falling back to the syndication endpoint), normalizes it into an internal model (post, author, media, quote tweets, thread chain), and renders that model to Markdown. The UI is a paste-a-link page with a preview and download/copy. The converter core lives in its own module so the future MCP server/plugin can reuse it without the web layer.

## Data Flow

{To be refined during brainstorming.} X URL (user paste) → API route → FxTwitter JSON → normalized post model → Markdown string → previewed in UI / downloaded as `.md`. No database planned for v1 — stateless conversion.

## Key Patterns

{To be filled — architectural patterns used (e.g., MVC, event-driven, repository pattern) and why.}

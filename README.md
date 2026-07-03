# threadmark

Convert a Twitter/X post, thread, or article into a clean, LLM-ready Markdown document.

## About

Twitter/X serves an empty JS shell to non-browser fetchers, so tools like Claude Code's WebFetch get blocked on X links. threadmark solves this: paste an X link into the web app (or hand it to the companion MCP server / Claude Code plugin) and get back a well-structured `.md` file containing the original post or thread, author metadata, attached images, quote tweets, and — best-effort — replies. The output is designed to be fed directly to an LLM.

## Features

- **Core converter** (`src/lib/threadmark.ts`) — X status URL → Markdown with YAML frontmatter (author, date, url, stats). Handles whole threads in one call, images (with X's alt text), videos, quote tweets, polls, and optional cursor-paginated replies (`replyLimit`). Image output is switchable: embedded `![alt](url)` or plain links.
- Web UI, X Articles support, and the MCP server are next — see `docs/PLAN.md`.

## Tech Stack

- **Next.js (App Router) + React + TypeScript**, deployed on **Vercel**
- Tweet data via keyless public JSON endpoints (FxTwitter API / Twitter syndication endpoint) — no official X API key required for the core flow
- Later: an MCP server / Claude Code plugin reusing the same core converter

## Getting Started

```bash
npm install
npm run dev        # Next.js dev server (UI not built yet)
npm run check      # converter check against live FxTwitter (needs network)
```

Note: if `NODE_ENV` is set globally in your environment, unset it for `npm run build` — a non-standard value breaks Next.js prerendering.

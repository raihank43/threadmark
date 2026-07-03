# threadmark

Convert a Twitter/X post, thread, or article into a clean, LLM-ready Markdown document.

## About

Twitter/X serves an empty JS shell to non-browser fetchers, so tools like Claude Code's WebFetch get blocked on X links. threadmark solves this: paste an X link into the web app (or hand it to the companion MCP server / Claude Code plugin) and get back a well-structured `.md` file containing the original post or thread, author metadata, attached images, quote tweets, and — best-effort — replies. The output is designed to be fed directly to an LLM.

## Features

{To be filled as features are implemented — see docs/PLAN.md for the roadmap.}

## Tech Stack

- **Next.js (App Router) + React + TypeScript**, deployed on **Vercel**
- Tweet data via keyless public JSON endpoints (FxTwitter API / Twitter syndication endpoint) — no official X API key required for the core flow
- Later: an MCP server / Claude Code plugin reusing the same core converter

## Getting Started

{To be filled once the project has runnable code.}

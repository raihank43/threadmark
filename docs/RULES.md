# Code Rules

## Main Principles

{To be filled as the project develops — overarching philosophies for how code should be written. Process disciplines the team works by — TDD, review rituals, debugging practice — belong here too: they're project conventions, not global truths.}

## Folder Structure Conventions

- **Core logic lives in `src/lib/` and stays framework-agnostic** — no Next.js/React imports there. The web layer (`src/app/`) and the future MCP server are thin callers. This is the load-bearing boundary of the project.
- Runnable checks go in `scripts/` as plain `.ts`, run directly with `node` (Node ≥23 type stripping — no tsx/ts-node). Imports in scripts need explicit `.ts` extensions.
- **Next.js 16 differs from training data** — before writing app-layer code, check `node_modules/next/dist/docs/` (see `AGENTS.md`).

## Naming Conventions

{To be filled — naming rules for files, functions, variables, components, routes, etc.}

## Code Style

{To be filled — formatting, imports, patterns to follow.}

## Comments

Readable code first; comments stay compact. The docs carry the full detail — a comment is a *why* or a pointer (`see docs/feature-x.md`), never a duplicate of what a doc already explains. A one-liner for a non-obvious why is good; a comment restating the code or the docs is noise.

Existing comments: handle **opportunistically** — only when already touching that code. Update if stale. Before compacting a large comment, **verify its why is captured in a doc; if not, move it there first, then compact** (move → verify → remove — compacting is a delete, and uncaptured why is unrecoverable).

## Glossary

The project's domain language — terms code, docs, and conversations should use consistently. Grown organically: add a term when it's coined, or when a naming collision gets resolved (note the "not to be confused with…").

| Term | Meaning |
|------|---------|
| | |

## Anti-Patterns

Things we tried that didn't work. **Do not repeat these.**

| Anti-Pattern | What Went Wrong | Better Approach |
|-------------|----------------|-----------------|
| | | |

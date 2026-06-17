# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-15
**Commit:** 8c76396
**Branch:** develop

## OVERVIEW

Beehive is a pnpm TypeScript monorepo for local-first vault ingestion, wiki/graph generation, CLI workflows, viewer UI, agent installs, and a published ClawHub skill.
Runtime assumptions are Node >=24, ESM packages, Biome formatting, Vitest tests, and a build order of viewer -> engine -> CLI.

## STRUCTURE

```
packages/engine/          # core runtime library, graph/wiki/artifact generation, MCP, agents
packages/cli/             # Commander CLI facade over engine behavior
packages/viewer/          # React/Vite graph workspace viewer and exported viewer library
packages/obsidian-plugin/ # private desktop-only Obsidian plugin, CJS bundle from ESM source
scripts/                  # release gates, smoke lanes, manifest checks, skill publish
smoke/                    # release/live fixture inputs, not product source
skills/beehive/           # published ClawHub/OpenClaw skill artifact
worked/                   # demo vault setups; large-repo is a source-class fixture
docs/                     # live-testing and release/user-facing docs
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Public engine API | `packages/engine/src/index.ts`, `packages/engine/src/types.ts` | `index.ts` is curated; `types.ts` is exported wholesale. |
| Vault compile/graph/wiki flow | `packages/engine/src/vault.ts` | Cross-cutting orchestration hotspot; prefer narrow modules for new behavior. |
| Ingest and extraction | `packages/engine/src/ingest.ts`, `extraction.ts`, `sources.ts` | Boundary for files, URLs, media, inbox, managed sources. |
| Graph navigation and refresh | `packages/engine/src/graph-query-core.ts`, `graph-callers.ts`, `graph-status.ts`, `watch.ts` | Deterministic graph query, exact caller evidence, status checks, per-file graph refresh. |
| Freshness, tiers, migrations | `packages/engine/src/freshness.ts`, `consolidate.ts`, `migrate.ts` | Page decay, insight tier rollups, and vault-version migrations. |
| CLI command surface | `packages/cli/src/index.ts` | Public API; synced with `scripts/cli-surface-smoke.mjs` and README parity checks. |
| Viewer runtime | `packages/viewer/src/App.tsx`, `lib.ts`, `hooks/`, `components/` | UI state, API boundary, Cytoscape graph rendering. |
| Obsidian runtime | `packages/obsidian-plugin/src/main.ts`, `src/commands/`, `src/cli/` | Desktop plugin shells out to the CLI. |
| Release/publish safety | `scripts/release-preflight.mjs`, `release-publish.mjs`, `check-release-sync.mjs` | Dry-run still validates tags/worktrees/version sync. |
| ClawHub skill package | `skills/beehive/SKILL.md`, `README.md`, `examples/`, `references/` | Text-only published skill; frontmatter is checked. |

## CONVENTIONS

- TypeScript source is ESM and uses `.js` import specifiers for local TS modules.
- Biome formatting: 2 spaces, double quotes, semicolons, no trailing commas, 140-column line width.
- Root package version drives engine, CLI, viewer, Obsidian plugin, MCP fallback string, and skill frontmatter version checks.
- Published package manifests must not contain `workspace:` runtime dependency specs.
- CLI is a thin orchestration layer; runtime behavior belongs in engine modules unless it is parsing or presentation.
- Generated vault roots are resolved through engine path helpers because `BEEHIVE_OUT` can move `raw/`, `wiki/`, `state/`, `agent/`, and `inbox/` outside the project.
- Tests avoid live cloud APIs and real YouTube/Neo4j; use fakes, temp providers, local HTTP fixtures, and restored env vars.
- Markdown/wiki/graph outputs are compatibility surfaces: preserve page IDs, frontmatter, graph IDs, relation labels, and artifact paths unless migration is intentional.
- Graph-first hooks and `graph update --file` rely on tracked repo manifests, `calls` edges, and declaration line ranges; keep those contracts aligned across analysis, CLI, MCP, and docs.
- Vault migrations and consolidation flows should be dry-run inspectable before writing and must operate through resolved workspace artifact paths.

## ANTI-PATTERNS

- Do not add business logic to `packages/cli/src/index.ts` when an engine function should own it.
- Do not broaden test fixtures into live network/API-key dependencies.
- Do not edit generated vault artifacts under `raw/`, `wiki/`, or `state/` as source-of-truth changes.
- Do not treat release `--dry-run` as a no-op plan; it still validates versions, tags, and worktrees.
- Do not update command paths or aliases without updating `scripts/cli-surface-smoke.mjs` and stability/docs where relevant.
- Do not remove `packages/viewer/vite.config.ts` `emptyOutDir: false`; app and library builds share `dist`.
- Do not convert skill `metadata` from a quoted JSON string into nested YAML.
- Do not turn graph caller lookup into repo-wide search; it must stay bounded by graph `calls` edges and return file:line evidence.

## COMMANDS

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm check
pnpm live:cli-surface
pnpm --filter @beehive/engine test
pnpm --filter @beehive/cli test
pnpm --filter @beehive/viewer test
pnpm --filter @beehive/obsidian-plugin test
```

## NOTES

- Child `AGENTS.md` files exist only where local contracts differ: engine internals/tests, CLI package, viewer UI/components, Obsidian package/src/tests, scripts, smoke fixtures, and ClawHub skill package.
- When changing release flow, check both `docs/live-testing.md` and script behavior; sibling repos `/Volumes/Data/oss/oc/web` and `/Volumes/Data/oss/oc/desktop` appear in release scripts.
- `worked/large-repo` is a source-class demonstration fixture; keep class expectations in its config and README coherent, but root guidance covers the worked examples.

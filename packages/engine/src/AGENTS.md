# ENGINE SOURCE KNOWLEDGE BASE

## OVERVIEW

This directory is the engine's contract-heavy core: vault orchestration, ingest/extraction, graph/query/export, generated wiki pages, MCP, watch, agents, memory, context packs, consolidation, and migration.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Compile orchestration | `vault.ts` | Largest hotspot; coordinates manifests, pages, graph, approvals, candidates, freshness, and consolidation hooks. |
| Shared contracts | `types.ts`, `config.ts` | Public types, zod enums, defaults, profiles, artifact roots. |
| Ingest pipeline | `ingest.ts`, `extraction.ts`, `sources.ts` | Files, dirs, URLs, media, inbox, managed source sync. |
| Code intelligence | `code-analysis.ts`, `code-tree-sitter.ts` | TS/compiler extraction plus multi-language tree-sitter parsing. |
| Graph behavior | `graph-tools.ts`, `graph-query-core.ts`, `graph-callers.ts`, `graph-export.ts`, `graph-enrichment.ts`, `markdown.ts` | Query, caller evidence, validation, export, hyperedges, wiki rendering. |
| Freshness and migrations | `freshness.ts`, `consolidate.ts`, `migrate.ts`, `pages.ts` | Decay metadata, tier rollups, supersession, vault version upgrades. |
| Integration boundaries | `agents.ts`, `mcp.ts`, `watch.ts`, `viewer.ts`, `schedule.ts` | External agents, MCP tools, refresh loops, viewer server. |
| Retrieval/search | `search.ts`, `retrieval.ts`, `embeddings.ts`, `context-packs.ts` | Node sqlite search, retrieval scoring, token-bounded packs. |

## CONVENTIONS

- Prefer adding narrow modules or helpers over expanding `vault.ts`; use `vault.ts` for cross-cutting orchestration only.
- Preserve generated artifact paths, page IDs, source IDs, frontmatter, graph IDs, relation names, and confidence semantics.
- Config and path logic must respect `BEEHIVE_OUT`; never construct `raw/`, `wiki/`, `state/`, `agent/`, or `inbox/` paths by string guesswork.
- URL ingest keeps SSRF/private-network protections; tests opt in with `BEEHIVE_ALLOW_PRIVATE_URLS=1`.
- Directory ingest respects `.beehiveignore`, `.beehiveinclude`, VCS/hard ignores, nested matchers, and repo-relative paths.
- Optional media/code tools must degrade with warnings or diagnostics: vision providers, whisper, ffmpeg, yt-dlp, tree-sitter grammars.
- Swift tree-sitter is gated by `BEEHIVE_ENABLE_SWIFT_TREE_SITTER`.
- `watch.ts` shrink guard aborts graph drops over 25% unless `force` or `BEEHIVE_FORCE_UPDATE=1/true` is set.
- `syncTrackedFiles` powers `beehive graph update --file`; keep per-file refresh scoped to tracked roots and generated-artifact excludes.
- Graph caller lookup must follow graph `calls` edges first, then scan only caller source files for capped file:line evidence.
- Consolidation never deletes lower-tier insight pages; use `supersededBy`, `tier`, and `consolidatedFromPageIds` for traceability.
- CLI migrations are dry-run by default; apply through `runMigration` and record vault version state under the resolved `state/` root.

## ANTI-PATTERNS

- Do not make graph ranking/export/markdown changes without checking CLI output, viewer payload assumptions, and fixture tests.
- Do not bypass shared JSON/filesystem helpers in `utils.ts` when atomic writes or path-aware errors matter.
- Do not let code-only refresh silently erase semantic graph data; it marks non-code pending semantic refresh.
- Do not return unbounded MCP payloads; handlers need safe wrappers, zod validation, and bounded text.
- Do not make `lint --web` run without deep lint expectations.
- Do not widen graph callers, per-file graph refresh, or context-pack selection into broad repo scans when graph/manifests already bound the candidate set.

## LOCAL TESTS

```bash
pnpm --filter @beehive/engine test
pnpm --filter @beehive/engine typecheck
pnpm live:cli-surface
```

## NOTES

- `providers/` and `hooks/` have their own local rules; read those child files before editing there.
- Many graph/query/export functions require a compiled graph; keep failure messages explicit when called too early.
- `mcp.ts`, `agents.ts`, `watch.ts`, and `viewer.ts` are integration boundaries, not internal-only helpers.

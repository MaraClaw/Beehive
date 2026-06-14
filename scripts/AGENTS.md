# SCRIPTS KNOWLEDGE BASE

## OVERVIEW

Scripts are operational release, validation, live-smoke, manifest, ClawHub skill, perf, and docs helpers; several perform external or publishing side effects.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Release preflight | `release-preflight.mjs` | Ordered gates, tarball packing, browser/corpus lanes, summary artifacts. |
| Release publish | `release-publish.mjs` | Version validation, npm publish, skill publish, desktop repo, GitHub release. |
| Release summary | `release-preflight-summary.mjs`, `.test.mjs` | `.release-preflight` markdown/json summary. |
| Version sync | `check-release-sync.mjs` | Root/package/plugin/MCP/skill/CLI fallback version contract. |
| Published manifests | `check-published-manifests.mjs` | No `workspace:` runtime deps, exact published versions. |
| README parity | `check-readme-parity.mjs` | User-facing docs consistency. |
| ClawHub skill | `check-clawhub-skill.mjs`, `publish-clawhub-skill.mjs` | Skill file set, metadata, publish/inspect. |
| Live smoke | `live-smoke.mjs`, `live-oss-corpus.mjs`, `cli-surface-smoke.mjs` | Installed CLI, provider lanes, pinned repos, Commander surface. |
| Assets/perf | `copy-engine-grammar-assets.mjs`, `sync-docs-screenshots.mjs`, `check-perf-budget.mjs`, `perf-budgets.json` | Build artifacts and docs helpers. |

## CONVENTIONS

- Preflight order: root check, test, build, direct CLI surface smoke, sibling web build, ClawHub skill dry-run, pack engine/CLI, tarball smoke, browser smoke, OSS corpus.
- Publish order: validate versions/deps, require clean OSS worktree unless `--allow-dirty`, require local and remote `v<version>` tags, preflight, publish viewer->engine->CLI, live smoke, skill publish/inspect, desktop refresh/tag/push, GitHub release.
- `release-publish --dry-run` still validates versions, clean worktrees, and local tag; it only skips selected remote/npm checks.
- `--skip-build` in preflight also skips direct CLI surface smoke.
- Smoke/corpus artifacts are deleted only on success unless keep flags/env vars are set.
- Live smoke loads env from `/Volumes/Data/oss/oc/.env.local` and repo `.env.local`.

## ANTI-PATTERNS

- Do not bypass preflight because `prepublishOnly` exists.
- Do not update versions partially; root version sync reaches CLI, engine, viewer, Obsidian, MCP server, skill, and fallback strings.
- Do not add unknown Obsidian manifest keys or `workspace:` runtime dependency specs.
- Do not assume viewer tarball install is directly smoked; viewer coverage is via root build/version and engine bundling.
- Do not rely on corpus branch heads; corpus uses pinned 40-char SHAs.
- Do not delete failed smoke/corpus artifacts before diagnosis.

## COMMANDS

```bash
pnpm check
pnpm live:cli-surface
pnpm skill:publish -- --dry-run
node scripts/release-preflight.mjs
node scripts/release-publish.mjs --dry-run
```

## NOTES

- Browser smoke needs Playwright Chromium.
- `sync-docs-screenshots.mjs` copies the latest existing screenshot to sibling web docs; it does not capture a new one.
- Perf checks import built `packages/engine/dist/index.js`, so build first.

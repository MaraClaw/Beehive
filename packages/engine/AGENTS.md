# ENGINE PACKAGE KNOWLEDGE BASE

## OVERVIEW

`@beehive/engine` is the public runtime library behind ingest, compile, graph/wiki output, search, watch, providers, MCP, and agent installation.

## STRUCTURE

```
src/              # engine implementation and public type surface
src/providers/    # provider adapters and registry
src/hooks/        # standalone graph-first hook scripts bundled separately
package.json      # ESM package, exports only "."
tsup.config.ts    # library build
tsup.hooks.config.ts # standalone hook build
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Public exports | `src/index.ts` | Only package export target; treat additions as public API. |
| Public types | `src/types.ts` | Re-exported with `export type *`; broad compatibility surface. |
| Build pipeline | `package.json`, `tsup.config.ts`, `tsup.hooks.config.ts` | Builds viewer if missing, engine ESM+dts, hooks bundle, grammar assets. |
| Viewer bundle | `src/viewer.ts`, `dist/viewer` | Engine packages viewer assets for graph serving/export. |
| Tests | `test/` | Package script sets private URL allowance and 30s timeout. |

## CONVENTIONS

- Node >=24 is assumed; `node:sqlite` is used by search/storage code.
- Package exports only `.` from `dist/index.js` and `dist/index.d.ts`; do not add deep exports casually.
- New config fields need schema/default/type/docs/CLI awareness, not just an interface edit.
- Use engine path helpers such as `loadVaultConfig`, `resolvePaths`, and `resolveArtifactRootDir` for artifact roots.
- Keep `packages/viewer` build compatibility in mind; engine build can bundle viewer `dist` output.

## ANTI-PATTERNS

- Do not expose internal modules through package exports to solve an app-local import.
- Do not duplicate provider, graph, or ingest behavior in CLI or viewer packages.
- Do not assume generated artifacts live under the repo root when `BEEHIVE_OUT` is set.
- Do not weaken SSRF/private URL protections; tests enable local/private URLs with `BEEHIVE_ALLOW_PRIVATE_URLS=1`.

## COMMANDS

```bash
pnpm --filter @beehive/engine build
pnpm --filter @beehive/engine test
pnpm --filter @beehive/engine typecheck
```

## NOTES

- Engine changes often require CLI surface, viewer payload, markdown artifact, and fixture-test checks.
- Hook code under `src/hooks/` has stricter standalone rules than normal engine modules.
- Tests are in a sibling child knowledge base because they encode fixture and env-isolation contracts.

# VIEWER SOURCE KNOWLEDGE BASE

## OVERVIEW

Viewer source is a domain-specific graph/workflow console driven by `/api/*`, hash routes, SSE refresh, global CSS tokens, and Cytoscape rendering.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| App composition | `App.tsx` | Owns layout, graph/page/search/action state, command palette, shortcuts. |
| API boundary | `lib.ts` | Fetch helpers, viewer graph/page/review/task types, embedded export behavior. |
| Workspace data | `hooks/workspaceStore.ts` | `useReducer`, guarded refresh, `Promise.all` API loads. |
| Live updates | `hooks/useEventStream.ts` | `/api/events`, capped event log, reconnect backoff, refresh triggers. |
| Deep links | `hooks/useHashRoute.ts` | `page`, `node`, `approval`, `memory`, `tag`, `tags` hash routes. |
| Theme | `hooks/useTheme.ts` | `swarmvault.viewer.theme`, `data-theme` on root. |
| Styling | `styles.css` | Tokens, shell grid, rails, panels, responsive drawers, reduced motion. |
| Components | `components/AGENTS.md` | Component inventory and GraphCanvas-specific rules. |

## CONVENTIONS

- `App.tsx` is the stateful composition root; components receive props/callbacks and keep only local UI state.
- `workspaceStore.refresh()` deliberately prevents overlapping refreshes with `inFlight.current`.
- Optional workspace areas can fail independently and fall back to empty/null values with recorded errors.
- SSE-triggered refreshes occur for `compile`, `ingest`, `watch`, `approval`, `candidate`, `memory`, and `lint` events.
- Multi-tag route is `#tags?selected=foo,bar`; tag filters are AND semantics across URL, sidebar, app state, and graph filtering.
- Undo is best-effort: `useUndoBuffer` stores one entry for 6 seconds, mainly for inverse review actions.
- Global CSS owns design tokens and shared classes such as `panel`, `card`, `btn`, `input`, `chip`, `text-muted`, and `text-mono`.

## ANTI-PATTERNS

- Do not split state out of `App.tsx` unless it removes real coupling; much state is intentionally route/workspace-coordinated.
- Do not let standalone embedded exports call mutation endpoints.
- Do not change tag filter semantics from AND to OR without updating URL, sidebar, graph, and tests together.
- Do not add broad inline CSS when a shared class or token belongs in `styles.css`.
- Do not forget responsive drawer breakpoints: 1100px app rails, 980px workbench grid, 600px full-width rails/minimap hiding.

## TESTS

```bash
pnpm --filter @swarmvaultai/viewer test
pnpm --filter @swarmvaultai/viewer typecheck
```

## NOTES

- Tests use Vitest `jsdom`, raw React `createRoot`, `act`, `IS_REACT_ACT_ENVIRONMENT`, manual DOM cleanup, and global unstubbing.
- `lib.ts` endpoint helpers cover graph, search, page, reviews, candidates, memory, watch, lint, doctor, workspace, clip, context pack, and task actions.

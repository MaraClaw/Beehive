# VIEWER PACKAGE KNOWLEDGE BASE

## OVERVIEW

`@swarmvaultai/viewer` is both a React/Vite graph workspace app and an exported viewer library consumed by the engine package.

## STRUCTURE

```
src/lib.ts       # package library export and browser API client
src/main.tsx     # Vite app mount
src/App.tsx      # UI composition root
src/hooks/       # route, theme, SSE, workspace store, shortcuts, undo
src/components/  # domain-specific React UI sections
src/styles.css   # global design system and responsive layout
test/            # Vitest jsdom component and hook tests
vite.config.ts   # app build into dist, keeps existing dist files
vitest.config.ts # jsdom test config
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Build/package export | `package.json`, `src/lib.ts` | `build:lib` writes `dist/lib.js` and dts. |
| Vite app build | `vite.config.ts`, `src/main.tsx` | `emptyOutDir: false` is required because lib and app share `dist`. |
| App state/API flow | `src/AGENTS.md` | Read child file before editing `src`. |
| Component behavior | `src/components/AGENTS.md` | Read child file before editing component inventory. |
| Tests | `test/*.test.tsx` | Raw React `createRoot` + `act`, jsdom, Cytoscape mock. |

## CONVENTIONS

- React 19, Vite 7, Cytoscape, `react-markdown`, GFM, slug, and highlight plugins are package-level assumptions.
- Styling is plain global CSS in `src/styles.css`; there is no Tailwind or shadcn convention here.
- Viewer payload types in `src/lib.ts` must stay aligned with engine `viewer.ts` and graph/wiki outputs.
- Mutating API helpers throw in embedded standalone-export mode; keep read-only embedded behavior intact.
- Package tests focus on domain behavior, not snapshots.

## ANTI-PATTERNS

- Do not add package-global UI styling conventions outside `src/styles.css` unless matching an existing small inline exception.
- Do not assume an icon library; current labels use text and a few glyphs.
- Do not add viewer API fields without checking engine server payloads and exported library types.

## COMMANDS

```bash
pnpm --filter @swarmvaultai/viewer build
pnpm --filter @swarmvaultai/viewer test
pnpm --filter @swarmvaultai/viewer typecheck
```

## NOTES

- Engine build may bundle viewer dist; viewer changes can affect `@swarmvaultai/engine` package output.
- Use visual QA for layout, graph rendering, theme, or responsive changes.

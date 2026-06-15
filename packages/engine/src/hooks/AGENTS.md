# ENGINE HOOKS KNOWLEDGE BASE

## OVERVIEW

This directory contains standalone graph-first agent hooks bundled separately from the normal engine library.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Claude hook | `claude.ts` | Must not import engine; standalone hook script. |
| Marker state | `marker-state.ts` | Tmpdir marker state, graph-first mode, staleness, broad-search denial. |
| Shared schemas | local hook files | Agent-specific payload parsing and response text. |
| Git hook installer | `../hooks.ts` | Separate file manages `.git/hooks/post-commit` and `post-checkout` managed blocks. |
| Bundle config | `../../tsup.hooks.config.ts` | Standalone hook build entry. |

## CONVENTIONS

- Standalone hook scripts import Node builtins only; no engine, CLI, viewer, or package-internal runtime imports.
- Graph-first mode priority is environment over config over default context.
- Broad source search is denied once, then retry is allowed; narrow file/artifact searches are exempt.
- Artifact paths under `wiki/`, `raw/`, and `state/`, single-file reads, and piped-output filtering should not be intercepted as broad search.
- Hook output should include actionable deny/context notes, edited files, and staleness information without huge payloads.

## ANTI-PATTERNS

- Do not share normal engine utilities with standalone hooks if that pulls in bundled dependencies.
- Do not overwrite user-owned hook content; managed blocks must preserve surrounding file content.
- Do not make hooks depend on project-local generated files without graceful missing/stale messaging.
- Do not expand broad-search detection in a way that blocks artifact/wiki reads.

## TESTS

```bash
pnpm --filter @beehive/engine test -- claude-hook
pnpm --filter @beehive/engine build
```

## NOTES

- Agent install rules live in `../agents.ts`; git hook file mutation lives in `../hooks.ts`.
- Keep hook bundles small and deterministic; they run in other tools' hook environments.

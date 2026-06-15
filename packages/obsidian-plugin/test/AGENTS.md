# OBSIDIAN PLUGIN TEST KNOWLEDGE BASE

## OVERVIEW

Tests run in Vitest Node with a hand-written Obsidian API mock and focused coverage for CLI runner, workspace root detection, and citation rewriting.

## STRUCTURE

```
fixtures/obsidian.ts    # aliased external obsidian module mock
cli/run.test.ts         # fake child process and CLI output parsing
workspace/resolve-root.test.ts # marker walk-up and maxDepth behavior
workspace/artifacts.test.ts    # workspace id/env and BEEHIVE_OUT artifact roots
citations/rewrite.test.ts      # page_id token to wikilink behavior
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Test config | `../vitest.config.ts` | Node environment, alias `obsidian` to `test/fixtures/obsidian.ts`. |
| Obsidian mock | `fixtures/obsidian.ts` | Minimal imported API surface only. |
| CLI process tests | `cli/run.test.ts` | Fake child process, stream chunking, last-line JSON, ENOENT, abort. |
| Workspace tests | `workspace/resolve-root.test.ts` | Config/schema marker priority, override, maxDepth. |
| Artifact root tests | `workspace/artifacts.test.ts` | Workspace id validation, CLI env, relative/absolute `BEEHIVE_OUT`. |
| Citation tests | `citations/rewrite.test.ts` | Wikilink aliases and IDs with colons/slashes/dots. |

## CONVENTIONS

- Grow the Obsidian mock only when code-under-test imports more API surface.
- CLI runner tests intentionally split stdout/stderr mid-line to verify raw stream preservation and JSON parsing.
- Last-line JSON parsing is a contract; preserve raw streams for diagnostics.
- Workspace root discovery prefers `beehive.config.json` and falls back to `beehive.schema.md` during walk-up.
- Workspace artifact tests must restore `BEEHIVE_OUT` after each case.
- Citation rewriting preserves aliases and supports page IDs that are not simple slugs.

## ANTI-PATTERNS

- Do not replace the local Obsidian mock with a live Obsidian dependency.
- Do not simplify fake child-process behavior if it stops covering chunked streams or abort semantics.
- Do not make tests depend on developer vault paths.
- Do not add UI lifecycle tests here and claim live Obsidian coverage.

## COMMANDS

```bash
pnpm --filter @beehive/obsidian-plugin test
pnpm --filter @beehive/obsidian-plugin typecheck
```

## NOTES

- Keep tests close to the implementation subdomain they protect: `cli`, `workspace`, `citations`.
- If settings or command registration gains complex behavior, add focused mock-based tests rather than broad plugin lifecycle tests.

# CLI PACKAGE KNOWLEDGE BASE

## OVERVIEW

`@beehive/cli` publishes the `beehive` and `vault` bins and should stay a thin Commander facade over engine behavior.

## STRUCTURE

```
src/index.ts     # shebang entry, Commander command tree, output helpers
src/notices.ts   # stderr notices and suppression rules
src/shims.d.ts   # local declarations
test/            # notice behavior tests
README.md        # CLI contract docs
package.json     # exact engine runtime dependency, bin map
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Command tree | `src/index.ts` | `new Command()`, `.name("beehive")`, version, global `--json`. |
| JSON behavior | `emitJson`, `log`, `isJson` in `src/index.ts` | stdout purity in JSON mode. |
| Notices | `src/notices.ts` | `[beehive]` stderr notices and state file. |
| Surface smoke | `../../scripts/cli-surface-smoke.mjs` | Parser-backed command/alias manifest plus JSON behavior checks. |
| Stability | `../../STABILITY.md` | Public CLI compatibility policy. |

## CONVENTIONS

- `enableStructuredJsonOnSubcommands(program)` adds global `--json` to subcommands; `activeCommand` is set in `preAction`.
- Human output goes to stdout; in JSON mode, non-JSON logs/progress/notices must go to stderr or be suppressed.
- `emitJson(data)` is the only JSON stdout path for structured output.
- Command groups include `source`, `context`, `task`, `graph`, `review`, `candidate`, `schedule`, `provider`, `retrieval`, `hook`, `inbox`, `memory`, and `export`.
- Options use Commander `Option(...).choices([...]).default(...)`, repeatable flags via `collectRepeated`, and boolean negation flags where needed.
- Compatibility aliases include `vault`, `scan`, hidden `clone`, `graph refresh`, `graph clusters`, `check-update`, `update`, `tree`, `merge-graphs`, `cluster-only`, `watch-status`, and hidden `memory`.
- Behavior commands need a `SURFACE_MANIFEST` classification and, when stable/non-trivial, a JSON smoke check in `cli-surface-smoke.mjs`.
- Potentially mutating flows such as `candidate auto-promote`, `consolidate`, `migrate --apply`, `provider setup --apply`, hooks, and graph push need explicit flags or safe dry-run defaults.

## ANTI-PATTERNS

- Do not put engine runtime behavior in CLI parsing code.
- Do not change command names, aliases, hidden status, or help behavior without updating `SURFACE_MANIFEST`, docs, and stability notes.
- Do not print progress or notices to stdout when `--json` is active.
- Do not prompt interactively unless TTY and not JSON mode.
- Do not break `quickstart/scan --mcp` startup status JSON-on-stderr behavior.
- Do not implement command behavior in CLI when it belongs in engine, even for small helpers like candidate scoring, migration, or provider setup.

## COMMANDS

```bash
pnpm --filter @beehive/cli test
pnpm --filter @beehive/cli typecheck
pnpm live:cli-surface
```

## NOTES

- `graph validate` intentionally sets `process.exitCode = 1` on validation failure.
- Long-running MCP/server flows need SIGINT cleanup.
- Notice state defaults to `~/.beehive/cli-state.json`; tests can override `BEEHIVE_CLI_STATE_PATH`.

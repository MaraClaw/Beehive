# OBSIDIAN PLUGIN PACKAGE KNOWLEDGE BASE

## OVERVIEW

This package is a private, desktop-only Obsidian plugin that shells out to the SwarmVault CLI and bundles to CommonJS for Obsidian.

## STRUCTURE

```
src/                 # plugin lifecycle, commands, CLI runner, modals, settings, views
test/                # Vitest node tests with a local Obsidian mock
manifest.json        # plugin manifest copied into dist
cli-compat.json      # minimum CLI compatibility, imported/bundled
styles.css           # plugin stylesheet copied into dist
esbuild.config.mjs   # CJS bundle despite package type module
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Plugin lifecycle | `src/main.ts` | `SwarmVaultPlugin extends Plugin`, onload/onunload. |
| Commands/UI source | `src/AGENTS.md` | Read before changing runtime source. |
| Tests/mock | `test/AGENTS.md` | Read before changing tests or mock Obsidian APIs. |
| Build | `esbuild.config.mjs` | Outputs `dist/main.js` CJS and copies manifest/styles. |
| Release sync | `manifest.json`, root `manifest.json`, `cli-compat.json`, `../../scripts/check-release-sync.mjs` | Version and byte-identity checks. |

## CONVENTIONS

- Package is ESM, but Obsidian bundle output is CJS.
- Manifest `isDesktopOnly: true` is required; plugin uses Node APIs and shells out to CLI.
- Root manifest and package manifest must remain byte-identical.
- Manifest allowed keys are enforced by release sync checks.
- `cli-compat.json.minCliVersion` must be <= root package version.
- `versions.json` may lag historical releases; do not treat it as the current version source.

## ANTI-PATTERNS

- Do not add browser/mobile assumptions; this plugin requires desktop Obsidian.
- Do not add unknown manifest keys.
- Do not forget to register long-running CLI processes with managed process cleanup.
- Do not assume `package:release` works without verifying its referenced script exists.

## COMMANDS

```bash
pnpm --filter @swarmvaultai/obsidian-plugin build
pnpm --filter @swarmvaultai/obsidian-plugin test
pnpm --filter @swarmvaultai/obsidian-plugin typecheck
pnpm check
```

## NOTES

- Current tests are unit-level; there is no live Obsidian UI/plugin lifecycle test.
- Settings defaults include unused fields; do not expose behavior that is not wired in source.

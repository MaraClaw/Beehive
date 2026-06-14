# OBSIDIAN PLUGIN SOURCE KNOWLEDGE BASE

## OVERVIEW

Source code handles Obsidian plugin lifecycle, commands, CLI process integration, workspace detection, citation rewriting, modals, settings, status UI, and run-log views.

## STRUCTURE

```
main.ts          # plugin entry and lifecycle
commands/        # addCommand registrations and command implementations
cli/             # shell-out runner, managed processes, version check, Windows shim
workspace/       # marker-based Beehive workspace root resolution
citations/       # page_id token to Obsidian wikilink rewriting
modals/          # query/input modals
settings/        # defaults and settings tab
views/           # run-log ItemView
ui/              # status bar UI
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Startup/shutdown | `main.ts` | Loads settings, view, status, settings tab, commands, workspace freshness, CLI verification. |
| Command registration | `commands/register.ts` | Most commands live here; verify/open run log also appear in `main.ts`. |
| CLI execution | `cli/run.ts`, `cli/managed-processes.ts` | Raw stream preservation, JSON parsing, abort, process cleanup. |
| Workspace root | `workspace/resolve-root.ts` | Requires `FileSystemAdapter`; walks up for `swarmvault.schema.md`. |
| Citation rewrite | `citations/rewrite.ts` | `[[page_id:...]]` to Obsidian wikilinks with aliases. |
| Settings | `settings/defaults.ts`, `settings/SettingsTab.ts` | CLI binary, workspace override, default query output mode, auto-compile. |

## CONVENTIONS

- Commands use Obsidian `addCommand`; notices use `Notice`.
- Modals extend `Modal` and clear `contentEl` before rendering.
- Run log view uses `registerView`, `ItemView`, right leaf, and reveal behavior.
- Markdown integration uses `MarkdownView`, editor selection, `replaceSelection`, and `replaceRange`.
- Vault/file integration uses `TFile`, `vault.create`, and `getAbstractFileByPath`.
- DOM creation should use Obsidian helper methods such as `createEl`, `createSpan`, and `empty`.
- CLI cwd should be detected workspace root when available.

## ANTI-PATTERNS

- Do not leave watch/serve processes outside `managedProcesses.stopAll()` cleanup.
- Do not assume workspace override save refreshes workspace automatically unless code is updated to do it.
- Do not rewrite citation token grammar without updating tests for aliases and IDs containing colons, slashes, and dots.
- Do not call Node-only APIs from code that would run in a mobile/browser Obsidian context; package is desktop-only.

## COMMAND INVENTORY

`swarmvault-init`, `ingest`, `add`, `compile`, `lint`, `query-from-note`, `ask`, `watch-start`, `watch-stop`, `watch-once`, `watch-status`, `serve-start`, `serve-stop`, `verify-cli`, `open-run-log`.

## NOTES

- The run-log view and status bar are UI surfaces; test with Obsidian API mocks where possible.
- Windows CLI fallback behavior belongs in `cli/windows-shim.ts` and related runner tests.

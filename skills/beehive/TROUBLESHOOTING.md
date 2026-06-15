# Troubleshooting

## `beehive` command not found

The ClawHub skill does not bundle the CLI binary by itself. Install the published package and verify it:

```bash
npm install -g @beehive/cli
beehive --version
```

If the binary still is not found, check that npm's global bin directory is on `PATH`.

## Node version too old

Beehive requires Node `>=24`.

```bash
node --version
```

Upgrade Node before troubleshooting provider or compile behavior.

## The vault compiles, but quality is weak

Check whether the vault is still using the built-in `heuristic` provider. That is a valid local/offline default, but its synthesis is intentionally lighter. Add a model provider in `beehive.config.json` when you want richer synthesis quality or optional capabilities such as embeddings, vision, or image generation.

For local semantic graph query, `embeddingProvider` must point at an embedding-capable backend such as `ollama` or another OpenAI-compatible embeddings service. The built-in `heuristic` provider does not generate embeddings.

## Audio or video files ingest, but no transcript appears

Audio and video ingest need `tasks.audioProvider` to point at a provider with `audio` capability. Without that, Beehive still ingests the source and records an extraction warning instead of failing the whole run.

The quickest fully-local fix is `beehive provider setup --local-whisper --apply`, which installs a `local-whisper` provider (whisper.cpp shell-out), downloads the default ggml model into `~/.beehive/models/`, and wires `tasks.audioProvider` at it. If the command reports the binary missing, install whisper.cpp first (`brew install whisper-cpp` on macOS, `sudo apt install whisper.cpp` on Debian/Ubuntu) and re-run. Override binary or model paths with `localWhisper.binaryPath` / `localWhisper.modelPath` in `beehive.config.json` or `BEEHIVE_WHISPER_BINARY` in the environment.

Local video extraction also needs `ffmpeg` on PATH or `BEEHIVE_FFMPEG_BINARY`. Public video URL ingest with `beehive ingest --video <url>` or `beehive add --video <url>` needs `yt-dlp` on PATH or `BEEHIVE_YTDLP_BINARY`.

YouTube transcript ingest does not need a model provider, but it can still fail when the video has no accessible captions or the upstream transcript fetch path is unavailable.

## Source reviews or dashboards did not appear

If you expected a source-scoped guide or review page, use one of these flows:

```bash
beehive ingest <input> --guide
beehive source add <input> --guide
beehive source session <source-id-or-session-id>
```

Then verify:

- `wiki/outputs/source-briefs/`
- `wiki/outputs/source-sessions/`
- `wiki/outputs/source-guides/`
- `wiki/dashboards/index.md`
- `wiki/dashboards/timeline.md`
- `wiki/dashboards/source-sessions.md`
- `wiki/dashboards/source-guides.md`
- `state/approvals/`

## `wiki/graph/report.md`, share kit, or search artifacts are missing

Run:

```bash
beehive next
beehive compile
beehive doctor
```

Then verify:

- `wiki/graph/report.md`
- `wiki/graph/share-card.md`
- `wiki/graph/share-card.svg`
- `wiki/graph/share-kit/`
- `state/graph.json`
- `state/retrieval/`

If the vault lives inside git and you want a quick graph-level delta, run `beehive diff`.

## Artifacts appear in the wrong directory

Check whether `BEEHIVE_OUT` is set:

```bash
echo "$BEEHIVE_OUT"
```

When it is set, generated `raw/`, `wiki/`, `state/`, `agent/`, and `inbox/` directories resolve under that output root. `beehive.config.json` and `beehive.schema.md` remain in the project root.

## Graph status reports stale

Run:

```bash
beehive graph status .
beehive check-update .
```

If it recommends `beehive graph update`, the detected changes are code-only and can use the faster graph refresh path; `beehive update` is the top-level alias for the same refresh. If it recommends `beehive compile`, graph/report artifacts are missing, a non-code tracked source changed, or a pending semantic refresh already exists.

When you know exactly which files changed, `beehive graph update --file <path>` (repeatable) refreshes just those files instead of walking every tracked root. Concurrent per-file refreshes coalesce through a lock plus queue under `state/watch/`, so rapid edit bursts do not stack compiles. Installed Claude Code hooks run this automatically in the background after Edit/Write tools.

`beehive graph update` and `beehive update` abort when the refreshed graph drops more than 25% of nodes or edges. Re-run with `beehive graph update . --force`, `beehive update . --force`, or `BEEHIVE_FORCE_UPDATE=1` only when the shrink is expected, such as after deliberately deleting a large source tree.

Before exporting, merging, pushing, or publishing graph artifacts, run `beehive graph validate --strict` to catch dangling references, duplicate ids, or invalid confidence values.

## Compile fails on a larger note set

If an older CLI fails with heap exhaustion, `Map maximum size exceeded`, or a bare `Unexpected end of JSON input`, upgrade Beehive and rerun compile:

```bash
npm install -g @beehive/cli@latest
beehive compile
```

Current releases bound source-analysis concurrency and graph projection during compile. If the error says `Failed to parse JSON file ...`, remove or restore the named derived state file and compile again; JSON state writes are atomic in current releases to reduce partial-file failures.

## Agent rule files differ

That can be expected. Beehive owns only the managed block between `beehive:managed:start` and `beehive:managed:end`. The managed Beehive block should match across compatible agent rule files, but user-owned text before or after that block is preserved and may differ per tool.

New vaults do not receive agent rule files during `init`, `quickstart`, `scan`, or `clone` unless you pass `--install-agent-rules` with configured `agents`. For one-off setup, run `beehive install --agent <agent>` instead.

## Vault doctor reports warnings

`beehive doctor` is the broad health summary. It checks graph artifacts, retrieval, review queues, watch state, migrations, managed sources, and task ledgers, then prints concrete follow-up commands. The `beehive graph serve` workbench shows the same full check list with details and copyable suggested commands.

If you only need orientation and do not want any prompts, notices, repairs, or writes, run `beehive next` first. It returns `status`, key `paths`, `checks`, and prioritized `recommendations` in human or JSON output.

Safe derived retrieval repairs can be applied with:

```bash
beehive doctor --repair
```

If the graph or wiki pages are missing, run `beehive compile`; if review or candidate counts are high, inspect `beehive review list` and `beehive candidate list`.

## Context pack is empty or missing expected evidence

Context packs are built from compiled graph and search artifacts. Run `beehive compile` first when the vault is new, then build a narrower pack:

```bash
beehive context build "Prepare the next agent" --target ./src --budget 8000
```

Then verify:

- `wiki/context/`
- `state/context-packs/`

If many items are listed as omitted, increase `--budget` or narrow `--target`.

## MCP client reports `[object Undefined]` or `no such column`

First verify the installed CLI version used by the MCP client:

```bash
beehive --version
```

Beehive 3.14.1 and newer normalize optional MCP response fields and retry hyphenated retrieval targets with conservative SQLite FTS tokenization. Upgrade and restart the MCP client subprocess if you see `unacceptable kind of an object to dump [object Undefined]` from `query_vault`, `build_context_pack`, `start_task`, or `start_memory_task`, or if a hyphenated target such as `concept:distributionally-robust-receive-combining` reports `no such column`.

```bash
npm install -g @beehive/cli@latest
```

## Task is missing or does not show in the graph

Tasks are durable local artifacts. Start or inspect them with:

```bash
beehive task list
beehive task start "Prepare the next agent" --target ./src
beehive task resume <task-id>
```

Then verify:

- `wiki/memory/index.md`
- `wiki/memory/tasks/`
- `state/memory/tasks/`

Run `beehive compile` after creating or updating tasks when you want task and decision nodes to appear in `state/graph.json` and the graph viewer. Existing `memory` commands remain compatibility aliases.

## Agent searches are being denied

Search denial only happens after an explicit opt-in: installing with `beehive install --agent <agent> --hook --graph-first`, or setting `hooks.graphFirst: "deny"` in `beehive.config.json`. With that opt-in, the first broad Grep/Glob/Bash search per session is intercepted with a deny plus a redirect message pointing at the plain `beehive graph query|explain|path` commands (the message warns against `--json`, which produces much larger output). `beehive graph query "<seed>"` prints the top matches with page paths plus an inline excerpt of the best-matching wiki page, so one command usually answers where-is/what-calls questions without follow-up file reads. For who-calls and impact-of-change questions, the redirect message also recommends `beehive graph callers <symbol>`, which lists every caller from graph call edges with exact file:line call-site evidence instead of a repo-wide grep. This is a one-time guided redirect, not a block: repeating the same search is then allowed, so work is never stuck. Searches scoped to vault artifact directories (`wiki/`, `raw/`, `state/`), single files, or search tools filtering piped output are never intercepted.

Without the opt-in, hooks stay advisory (`context` mode): a one-time guidance note, no denial. To change or disable the behavior:

```bash
BEEHIVE_GRAPH_FIRST=context   # session guidance only, no search interception
BEEHIVE_GRAPH_FIRST=off       # disable graph-first behavior entirely
```

Or set `hooks.graphFirst` to `deny`, `context`, or `off` in `beehive.config.json`. The default without any opt-in is `context`.

## `beehive install` edited `.gitignore` or `tsconfig.json`

That is intentional host-project hygiene. `beehive install --agent <agent>` appends the vault artifact directories (`raw/`, `wiki/`, `state/`, `agent/`, `inbox/`) to `.gitignore` in git repos, adds them to a strict-JSON `tsconfig.json` `"exclude"` list so stored source copies under `raw/` do not break the host typecheck, and warns when linter configs still cover the artifact directories. Commented (JSONC) tsconfig files are never rewritten — a warning explains the manual edit instead.

To opt out, set `BEEHIVE_OUT` so generated artifacts live outside the repo; the hygiene edits are skipped entirely.

## Hook is not firing

Reinstall the hook in the project root and verify the settings entries:

```bash
beehive install --agent claude --hook
```

Then check that `.claude/settings.json` contains the Beehive hook entries (session start, search interception, and post-edit refresh matchers) and that `.claude/hooks/beehive-graph-first.js` exists. Reinstalling migrates older installed hook entries to the current matcher layout while preserving user-owned hook entries. For user-scope installs under `~/.claude` (`install --agent claude --hook --scope user`), remember the hook intentionally no-ops in repos without a compiled `wiki/graph/report.md`, so run `beehive compile` first if the session shows no graph-first behavior.

## Agent install or hooks seem stale

Re-run the relevant install command in the project root:

```bash
beehive install status --agent codex --hook
beehive install --agent claude --hook
beehive install --agent gemini --hook
beehive install --agent opencode --hook
beehive install --agent copilot --hook
beehive install --agent kilo --hook
```

For Aider:

```bash
beehive install --agent aider
```

## Update paths

Update the skill:

```bash
clawhub update beehive
```

Update the CLI:

```bash
npm install -g @beehive/cli@latest
```

## More Help

- Docs: https://www.beehive.ai/docs
- Providers: https://www.beehive.ai/docs/providers
- Web troubleshooting: https://www.beehive.ai/docs/getting-started/troubleshooting
- GitHub issues: https://github.com/beehive/beehive/issues

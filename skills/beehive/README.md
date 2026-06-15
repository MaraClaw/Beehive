# Beehive Skill

Use the Beehive skill when you want a local-first knowledge vault that compiles books, articles, notes, transcripts, chat exports, emails, calendars, datasets, spreadsheets, slide decks, screenshots, URLs, code, and research captures into durable markdown pages, a searchable graph, dashboards, resumable chat sessions, static AI export packs, context packs, a task memory ledger, and reviewable outputs on disk.

Beehive is built on the [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern: keep a durable wiki between you and raw sources using a three-layer architecture (raw sources, wiki, schema). The LLM does the bookkeeping — cross-referencing, consistency, updating — while you curate sources and think about what they mean. Beehive turns that pattern into a local toolchain with graph navigation, search, review flows, automation, and optional provider-backed synthesis.

## Install

Install the skill from ClawHub:

```bash
clawhub install beehive
```

Install the CLI it depends on:

```bash
npm install -g @beehive/cli
beehive --version
export BEEHIVE_WORKSPACE_ID=main
beehive quickstart ./your-repo
beehive quickstart ./whitepaper.pdf --no-serve
beehive next
beehive demo --no-serve
beehive source add https://github.com/karpathy/micrograd
beehive ingest ./meeting.srt --guide
beehive ingest ./customer-call.mp3
beehive ingest https://www.youtube.com/watch?v=dQw4w9WgXcQ
beehive ingest --video https://example.com/product-demo.mp4
beehive source session transcript-or-session-id
beehive chat "What should the next agent know?"
beehive export ai --out ./exports/ai
```

Requirements:

- Node `>=24`
- A working `beehive` or `vault` binary on `PATH`

Update paths:

```bash
clawhub update beehive
npm install -g @beehive/cli@latest
```

## When To Use This Skill

- You want knowledge work to stay on disk instead of disappearing into chat history.
- The repo already contains `beehive.config.json` or `beehive.schema.md`.
- You want markdown wiki pages, graph artifacts, local search, approvals, candidates, and MCP exposure from the same workspace.
- You want resumable conversations over the compiled wiki and static handoff bundles for other tools.
- You want a save-first compile/query/review loop for source collections, codebases, or research material.
- You want one workflow for mixed non-code material such as EPUBs, CSV/TSV files, XLSX workbooks, PPTX decks, transcripts, Slack exports, mailbox files, and calendar exports.

## Quickstart

```bash
export BEEHIVE_WORKSPACE_ID=main
beehive quickstart ./your-repo
beehive quickstart ./whitepaper.pdf --no-serve
beehive quickstart ./your-repo --no-serve
beehive next
beehive demo --no-serve
beehive init --obsidian --profile personal-research
beehive source add ./exports/customer-call.srt --guide
beehive source session file-customer-call-srt-12345678
beehive source add https://github.com/karpathy/micrograd
beehive ingest ./src --repo-root .
beehive ingest ./customer-call.mp3
beehive ingest https://www.youtube.com/watch?v=dQw4w9WgXcQ
beehive ingest --video https://example.com/product-demo.mp4
beehive add https://arxiv.org/abs/2401.12345
beehive compile --max-tokens 120000
beehive diff
beehive graph share --post
beehive graph share --svg ./share-card.svg
beehive graph share --bundle ./share-kit
beehive query "What is the auth flow?"
beehive context build "Implement the auth refactor" --target ./src --budget 8000
beehive task start "Implement the auth refactor" --target ./src --agent codex
beehive doctor --repair
beehive graph blast ./src/index.ts
beehive graph status ./src
beehive check-update ./src
beehive graph stats
beehive graph validate --strict
beehive update ./src
beehive graph cluster
beehive cluster-only
beehive graph tree --output ./exports/tree.html
beehive tree --output ./exports/tree.html
beehive graph serve
beehive graph export --report ./exports/report.html
beehive graph export --callflow ./exports/callflow.html
beehive graph export --obsidian ./exports/graph-vault
beehive graph export --neo4j ./exports/graph.cypher
beehive merge-graphs ./exports/graph.json ./other-graph.json --out ./exports/merged-graph.json
beehive chat "What should the next agent know?"
beehive chat --resume <session-id> "What changed?"
beehive export ai --out ./exports/ai
beehive clone https://github.com/owner/repo --no-viz
BEEHIVE_WORKSPACE_ID=main beehive mcp
```

For the fastest scratch walkthrough of a local file, local repo, public GitHub repo, or docs tree, set `BEEHIVE_WORKSPACE_ID=main` once per shell or pass `--workspace-id main`, then run `beehive quickstart ./path`, `beehive quickstart ./path --no-serve`, `beehive scan ./path --no-viz`, or `beehive clone https://github.com/owner/repo --branch main --no-viz`. `quickstart` is the beginner-friendly alias for `scan`: it initializes the current directory as a vault, ingests that input, compiles immediately, opens the graph viewer by default, and writes `wiki/graph/share-card.md`, `wiki/graph/share-card.svg`, and `wiki/graph/share-kit/` under the active workspace artifact root. Interactive file and directory runs show bounded stderr progress with the active file while JSON, MCP, watch, and CI-style flows stay quiet. Run `beehive next` when you want a read-only status check that recommends init, ingest, compile, query, review, or refresh commands. Use `quickstart --mcp`, `scan --mcp`, or `clone --mcp` when the next step should be an MCP stdio server.

If you want the same zero-config walkthrough without supplying your own inputs first, run `beehive demo --no-serve`. It creates a temporary demo vault with bundled sources and compiles it immediately.

For very large graphs, `beehive graph serve` and `beehive graph export --html` automatically start in overview mode. Add `--full` when you explicitly want the full canvas rendered. `beehive graph share --post` prints a compact copyable summary, `beehive graph share --svg [path]` writes a 1200x630 visual card, `beehive graph share --bundle [dir]` writes a portable share kit for posting, linking, or screenshotting, `beehive graph cycles` finds deterministic directed cycles, `beehive graph callers <symbol>` lists every caller of a symbol from graph call edges with exact file:line call-site evidence — it scans only the files the graph identifies as callers, so who-calls and impact-of-change questions skip repo-wide grep, `beehive graph status [path]` and `beehive check-update [path]` check graph/report freshness without writing watch artifacts, `beehive graph stats` prints lightweight graph counts and relation mix, `beehive graph validate [graph] --strict` checks duplicate ids, dangling references, confidence bounds, and conflicted-edge evidence before export/merge/push workflows, `beehive graph update [path]` and `beehive update [path]` block unexpected node/edge drops unless `--force` is explicit, `beehive graph update --file <path>` (repeatable) is the code-only fast path that refreshes just the named files instead of walking every tracked root — concurrent refreshes coalesce through a lock plus queue under `state/watch/`, `beehive watch [path] --once` targets one repo root without persisting watch config, `beehive graph query` accepts relation/context/evidence/node/language filters for focused traversal, `beehive graph tree [--output <html>]` / `beehive tree [--output <html>]` writes an interactive source/module/symbol tree with a node inspector, `beehive graph merge <graph...> --out <path>` / `beehive merge-graphs <graph...> --out <path>` combines Beehive or node-link graph JSON, `beehive graph cluster [--resolution <n>]` and `beehive cluster-only [vault]` recompute communities and graph report artifacts from the existing graph without re-ingest, and `graph export` also supports `--html-standalone`, `--json`, `--callflow`, `--obsidian`, `--canvas`, and `--neo4j` when you need richer sharing, Obsidian-native artifacts, or a Neo4j-ready Cypher import. `beehive diff` compares the current graph against the last committed graph so you can inspect graph-level changes after a compile.

`beehive context build "<goal>" --target <path-or-node> --budget <tokens>` creates an agent-ready evidence pack from the compiled vault. It saves JSON under `state/context-packs/`, writes a markdown companion under `wiki/context/`, reports omitted items when the token budget is too small, and can print `markdown`, `json`, or `llms` output for kickoff prompts and handoffs.

`beehive chat "question"` creates a persisted conversation over the compiled vault. Each turn writes structured state under `state/chat-sessions/` and a markdown transcript under `wiki/outputs/chat-sessions/`; use `beehive chat --resume <id> "follow-up"`, `chat --list`, and `chat --delete <id>` to manage saved sessions.

`beehive export ai --out <dir>` writes a static handoff pack for other agents and crawlers. The pack includes `llms.txt`, `llms-full.txt`, `graph.jsonld`, `manifest.json`, `ai-readme.md`, and per-page `.txt`/`.json` siblings so the compiled wiki can be consumed without starting the viewer or MCP server.

`beehive task start "<goal>" --target <path-or-node>` creates a durable task ledger and automatically links an initial context pack. Use `beehive task update <id> --note|--decision|--changed-path|--context-pack`, `beehive task finish <id> --outcome <text>`, and `beehive task resume <id> --format markdown|json|llms` to preserve decisions, evidence, touched files, outcomes, and follow-ups for the next agent. The older `memory` commands remain compatibility aliases.

`beehive doctor` is the quickest whole-vault health check before an agent handoff or viewer session. It reports graph, retrieval, review queue, watch status, migration, managed-source, and task state; `--repair` rebuilds safe derived retrieval artifacts. The same checks are available in the graph viewer workbench and through MCP as `doctor_vault`; the workbench also shows prioritized next actions, check details, copyable suggested commands, explicit capture modes, title/tag capture fields, editable context/task token budgets, and action receipts.

The default `heuristic` provider is a valid local/offline starting point. Add a model provider in `beehive.config.json` when you want richer synthesis quality or optional capabilities such as embeddings, vision, or image generation. The recommended fully-local setup is `ollama pull gemma4` wired up as the `compileProvider` and `queryProvider` (see the root README for the exact config block). Any supported provider works - OpenAI, Anthropic, Gemini, OpenRouter, Groq, Together, xAI, Cerebras, openai-compatible, or custom. Use `beehive provider add|list|show|remove` for config-preserving provider registry edits. Code files are always parsed locally via tree-sitter; only non-code text or image sources go to configured model providers.

`beehive init --profile` accepts `default`, `personal-research`, or a comma-separated preset list such as `reader,timeline`. For a custom vault style, edit the `profile` block in `beehive.config.json` directly; `beehive.schema.md` stays the human-written intent layer. The `personal-research` preset also enables `profile.guidedIngestDefault` and `profile.deepLintDefault`, so guided ingest/source and lint flows are on by default until you opt out with `--no-guide` or `--no-deep`.

For local semantic graph query without API keys, point `tasks.embeddingProvider` at an embedding-capable local backend such as Ollama, not `heuristic`.

With an embedding-capable provider available, Beehive can also merge semantic page matches into local search by default. `tasks.embeddingProvider` is the explicit way to choose that backend, but Beehive can also fall back to a `queryProvider` with embeddings support. Set `retrieval.rerank: true` when you want the configured `queryProvider` to rerank the merged top hits before answering.

Audio and video ingest use `tasks.audioProvider` when you configure a provider with `audio` capability. The fully-local option is `beehive provider setup --local-whisper --apply`, which installs a `local-whisper` provider, downloads a whisper.cpp ggml model into `~/.beehive/models/`, and assigns `tasks.audioProvider` so voice memos, meetings, interviews, and video audio transcribe with no API keys and no network calls. Local video needs `ffmpeg`; public video URL ingest with `--video` needs `yt-dlp`. YouTube transcript ingest works without a model provider. If you want to pin graph clustering instead of using the adaptive default and its oversized/low-cohesion community split pass, set `graph.communityResolution` in `beehive.config.json` or run `beehive graph cluster --resolution <n>` for one recompute.

Set `BEEHIVE_OUT=<dir>` when generated `raw/`, `wiki/`, `state/`, `agent/`, and `inbox/` artifacts should be isolated from the source tree. `beehive.config.json` remains in the project root; when `BEEHIVE_WORKSPACE_ID=<id>` is active, `beehive.schema.md` and generated artifacts live under `<artifact-base>/<id>`.

`init`, `quickstart`, `scan`, and `clone` do not write project-local agent rule files by default. Run `beehive install --agent <agent> [--scope project|user]` for explicit installs, use `beehive install status --agent <agent>` for read-only status, or set `agents` in `beehive.config.json` and pass `--install-agent-rules` when you intentionally want configured targets installed together.

`beehive lint --deep --web` augments deep-lint findings with external evidence from a configured `webSearch` adapter. Web search is currently scoped to deep lint; compile, query, and explore stay on local vault state plus your configured LLM providers.

When the vault lives inside a git repo, `ingest`, `compile`, and `query` also accept `--commit` so generated `wiki/` and `state/` changes can be committed immediately. `compile --max-tokens <n>` trims lower-priority pages when you need bounded wiki output for a tighter context window.

Source-scoped artifacts are intentionally split by role:

| Artifact | Created by | Purpose |
|----------|-----------|---------|
| Source brief | `source add`, `ingest` (always) | Auto summary written to `wiki/outputs/source-briefs/` |
| Source review | `source review`, `source add --guide`, `ingest --review`, `ingest --guide` | Lighter staged assessment in `wiki/outputs/source-reviews/` |
| Source guide | `source guide`, `source add --guide`, `ingest --guide` | Guided walkthrough with approval-bundled updates in `wiki/outputs/source-guides/` |
| Source session | `source session`, `source add --guide`, `ingest --guide` | Resumable workflow state in `wiki/outputs/source-sessions/` and `state/source-sessions/` |

Supported non-code ingest includes `.pdf`, the full Word family (`.docx`, `.docm`, `.dotx`, `.dotm`), `.rtf`, `.odt`, `.odp`, `.ods`, `.epub`, `.csv`, `.tsv`, the full Excel family (`.xlsx`, `.xlsm`, `.xlsb`, `.xls`, `.xltx`, `.xltm`), the full PowerPoint family (`.pptx`, `.pptm`, `.potx`, `.potm`), `.ipynb` (Jupyter notebooks), `.bib` (BibTeX), `.org` (Org-mode), `.adoc`/`.asciidoc`, `.srt`, `.vtt`, Slack exports, `.eml`, `.mbox`, `.ics`, audio files (`.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`, `.webm`, and other `audio/*` inputs) through `tasks.audioProvider`, video files (`.mp4`, `.mov`, `.m4v`, `.mkv`, `.avi`, and other `video/*` inputs) through `ffmpeg` plus `tasks.audioProvider`, public video URLs with `--video` through `yt-dlp` plus `tasks.audioProvider`, direct YouTube transcript URLs, images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.tif`, `.tiff`, `.svg`, `.ico`, `.heic`, `.heif`, `.avif`, `.jxl`), markdown/MDX/text notes, structured config/data (`.json`, `.jsonc`, `.json5`, `.yaml`, `.toml`, `.xml`, `.ini`, `.conf`, `.cfg`, `.env`, `.properties`) with schema hints, common developer manifests (`package.json`, `tsconfig.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `go.sum`, `Dockerfile`, `Makefile`, `LICENSE`, `.gitignore`, `.editorconfig`, and similar) via content-sniffed text ingest so they are never silently dropped, browser clips, and research URLs captured through `beehive add`.

Supported code ingest covers `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.mts`, `.cts`, `.tsx`, `.sh`, `.bash`, `.zsh`, `.py`, `.go`, `.rs`, `.java`, `.kt`, `.kts`, `.scala`, `.sc`, `.dart`, `.lua`, `.zig`, `.cs`, `.c`, `.cc`, `.cpp`, `.cxx`, `.h`, `.hh`, `.hpp`, `.hxx`, `.php`, `.rb`, `.ps1`, `.psm1`, `.psd1`, `.ex`, `.exs`, `.ml`, `.mli`, `.m`, `.mm`, `.res`, `.resi`, `.sol`, `.vue`, `.svelte`, `.jl`, `.v`, `.vh`, `.sv`, `.svh`, `.r`, `.R`, `.css`, `.html`, `.htm`, `.sql`, plus extensionless executable scripts with `#!/usr/bin/env node|python|ruby|bash|zsh` shebangs. Parser-backed local analysis extracts symbols, imports, local module references, dynamic JS/TS imports, Julia modules/types/functions, and Verilog/SystemVerilog modules/interfaces/packages/instantiations; SQL also emits table/view symbols plus read/write/join/reference graph edges. R emits an explicit parser diagnostic until a safe packaged grammar exists.

## What The Skill Package Includes

- `SKILL.md` - operational instructions for the model
- [`examples/quickstart.md`](examples/quickstart.md) - first-run setup flow
- [`examples/repo-workflow.md`](examples/repo-workflow.md) - repo ingest, compile, review, and graph workflow
- [`examples/graph-first-agent-workflow.md`](examples/graph-first-agent-workflow.md) - graph-first Claude Code onboarding, hook-enforced graph reads, and automatic refresh
- [`examples/research-workflow.md`](examples/research-workflow.md) - research capture and query workflow
- [`references/commands.md`](references/commands.md) - high-signal command cheat sheet
- [`references/artifacts.md`](references/artifacts.md) - what shows up under `raw/`, `wiki/`, and `state/`
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - common setup and runtime fixes
- [`validation/smoke-prompts.md`](validation/smoke-prompts.md) - release-validation prompts and expected outcomes

The published ClawHub package is intentionally text-only in this release.

## Core Workflow

1. Run `beehive next` when you need orientation before taking action.
2. Initialize the vault with `beehive init`.
3. Treat `beehive.schema.md` as the vault contract before serious compile or query work.
4. Use `beehive source add` when the input is a recurring local file, local directory, public GitHub repo root, or docs hub that should stay registered. Add `--branch`, `--ref`, or `--checkout-dir` for pinned public GitHub repo sources.
5. Add one-off material with `beehive ingest`, `beehive add`, or `beehive inbox import`.
6. Use `beehive ingest --guide`, `beehive source add --guide`, `beehive source reload --guide`, `beehive source guide <id>`, or `beehive source session <id>` when you want the stronger guided-session workflow. Set `profile.guidedIngestDefault: true` when guided mode should be the default for ingest/source commands, and use `--no-guide` to force the lighter path for a specific run. Profiles using `guidedSessionMode: "canonical_review"` stage approval-queued canonical page edits; `insights_only` profiles keep exploratory synthesis under `wiki/insights/`.
7. Compile with `beehive compile`, use `compile --max-tokens <n>` when the generated wiki must fit a bounded context window, or use `compile --approve` when the change should land in the approval queue first.
8. Inspect `wiki/`, `wiki/dashboards/`, and `state/` artifacts before broad re-search. When the vault lives inside git, `ingest|compile|query --commit` can commit those artifacts immediately after the run.
9. Use `beehive query`, `beehive chat`, `beehive context build`, `beehive export ai`, `beehive task`, `beehive memory`, `beehive explore`, `beehive review`, `beehive candidate`, and `beehive lint` to keep the vault current, portable, and reviewable. Set `profile.deepLintDefault: true` when `lint` should run the advisory deep pass by default, and use `--no-deep` to force a structural-only run.
10. Use `beehive doctor [--repair]` when the vault needs one health summary before deeper troubleshooting or handoff.
11. Use `beehive graph share --post` for a quick copyable summary, `beehive graph share --svg [path]` for a visual share card, `beehive graph share --bundle [dir]` for a portable share kit, `beehive graph blast` for reverse-import impact checks, `beehive graph cycles` for directed cycle checks, `beehive graph status [path]` or `beehive check-update [path]` for read-only graph freshness checks, `beehive graph stats` for lightweight counts and relation mix, `beehive graph validate [graph] --strict` before export/merge/push workflows, `beehive graph update [path] --force` or `beehive update [path] --force` only when a large graph shrink is expected, `beehive graph query "<seed>" --context calls --evidence extracted` for focused relation-aware traversal, `beehive graph tree` for an interactive source/module/symbol tree, `beehive graph merge <graph...> --out <path>` for combining Beehive or node-link graph JSON, `beehive graph cluster` or `beehive cluster-only` for graph community/report refresh without re-ingest, `beehive graph serve` for the live workspace, detailed health workbench, prioritized next actions, explicit capture modes, title/tag capture fields, budgeted agent handoffs, and bookmarklet clipper, `beehive graph export --report` for a self-contained HTML report, `beehive graph export --callflow <path>` for a directed relationship HTML view, `beehive graph export --neo4j <path>` for a Neo4j-ready Cypher import, other `beehive graph export` formats, `beehive graph push neo4j`, or `BEEHIVE_WORKSPACE_ID=<id> beehive mcp` when the vault needs to be explored or shared elsewhere through MCP. MCP tool calls must include the same `workspace_id`.

## What Beehive Writes

- `BEEHIVE_OUT` can relocate generated artifact directories; `BEEHIVE_WORKSPACE_ID=<id>` nests schema and generated artifacts under `<artifact-base>/<id>` while keeping config at the project root
- `raw/sources/` and `raw/assets/` for canonical input storage
- `wiki/` for compiled source, concept, entity, code, graph, and output pages
- `wiki/outputs/source-briefs/` for recurring-source onboarding briefs
- `wiki/outputs/source-sessions/` for resumable guided session anchors
- `wiki/outputs/source-reviews/` for staged source-scoped review artifacts
- `wiki/outputs/source-guides/` for guided source integration artifacts
- `wiki/outputs/chat-sessions/` for persisted multi-turn chat transcripts
- `wiki/exports/ai/` for static AI handoff packs with `llms.txt`, full text, JSON-LD graph data, manifests, and per-page siblings
- `wiki/dashboards/` for recent sources, reading log, timeline, source sessions, source guides, research map, contradictions, and open questions
- `wiki/graph/share-card.md`, `wiki/graph/share-card.svg`, and `wiki/graph/share-kit/` for post-ready text, visual graph summaries, HTML preview, and JSON metadata generated on compile
- `wiki/context/` for markdown context-pack companions
- `wiki/memory/` for task ledger index and markdown task pages
- `wiki/candidates/` for staged concept/entity pages
- `state/graph.json` for the compiled graph
- `state/context-packs/` for saved JSON context packs with citations, token-budget accounting, included items, and omitted items
- `state/chat-sessions/` for structured resumable chat session state
- `state/memory/tasks/` for saved JSON task ledger records
- `state/retrieval/` for the local retrieval index and manifest
- `state/sources.json` plus `state/sources/<id>/` for managed-source registry state and working sync data
- `state/approvals/` for compile approval bundles
- `state/sessions/` and `state/jobs.ndjson` for saved run history

Generated guided artifacts and dashboards also carry Dataview-friendly fields such as `profile_presets`, `session_status`, `question_state`, `canonical_targets`, and `evidence_state` when you enable `profile.dataviewBlocks`.

## Agent And MCP Integration

Recommended per-repo onboarding for token-saving agent workflows:

```bash
cd <repo>
beehive init && beehive ingest .
beehive install --agent claude --hook --mcp --graph-first   # --graph-first opts in to search enforcement
beehive hook install        # git-hook refresh on commit/checkout (pass a repo path when the repo lives below the vault root)
```

For hook-capable agents, the installed hooks guide graph-first reads. The Claude Code hook injects graph-first instructions at session start — answer code-understanding questions with the plain `beehive graph query|explain|path` commands (avoid `--json`, which produces much larger output), `beehive query`, `beehive context build`, or `wiki/graph/report.md`, and read source files only when editing them — plus a graph staleness note. `beehive graph query "<seed>"` prints the top matches with page paths plus an inline excerpt of the best-matching wiki page, so one command usually answers where-is/what-calls questions without follow-up file reads. By default the hook is advisory: the first broad Grep/Glob/Bash search per session gets a one-time guidance note. Opt in to enforcement with `--graph-first` (persists `hooks.graphFirst: "deny"`), which denies that first search with the same guided redirect — repeating the search is then allowed, so work is never blocked. Either way the hook spawns a background `beehive graph update --file <path>` refresh after every Edit/Write. Searches scoped to vault artifact directories (`wiki/`, `raw/`, `state/`), single files, or search tools filtering piped output are never intercepted. `BEEHIVE_GRAPH_FIRST=deny|context|off` overrides per session. The Codex, Gemini, Copilot, OpenCode, and Kilo hooks carry the same graph-first guidance with a session note plus a one-time search redirect appropriate to each tool's hook API.

`beehive install --agent claude --mcp` also registers the Beehive MCP server in the project's `.mcp.json` (`{"mcpServers":{"beehive":{"command":"beehive","args":["mcp"]}}}`). Start that server with `BEEHIVE_WORKSPACE_ID=<id>` or add `--workspace-id <id>` in the client args, and include the same `workspace_id` in MCP tool calls. Claude installs additionally write a project skill bundle at `.claude/skills/beehive/SKILL.md`, and `--scope user` installs the skill, hook, and settings once under `~/.claude` for all repos — the hook no-ops in repos without a compiled graph report.

`beehive install --agent <agent>` also keeps the host project clean: in git repos the vault artifact directories are appended to `.gitignore`, strict-JSON `tsconfig.json` files get the artifact directories added to `"exclude"` so stored source copies under `raw/` do not break the host typecheck (commented JSONC tsconfigs are left untouched with a warning instead of a rewrite), and linter configs that still cover the artifact directories produce an advisory warning. Everything is skipped when `BEEHIVE_OUT` keeps artifacts outside the repo.

Supported agent installs:

- `beehive install --agent codex --hook`
- `beehive install --agent claude --hook --mcp`
- `beehive install --agent cursor`
- `beehive install --agent gemini --hook`
- `beehive install --agent opencode --hook`
- `beehive install --agent aider`
- `beehive install --agent copilot --hook`
- `beehive install --agent trae`
- `beehive install --agent claw`
- `beehive install --agent droid`
- `beehive install --agent kiro`
- `beehive install --agent kilo --hook`
- `beehive install --agent hermes`
- `beehive install --agent antigravity`
- `beehive install --agent vscode`
- `beehive install --agent amp`
- `beehive install --agent augment`
- `beehive install --agent adal`
- `beehive install --agent bob`
- `beehive install --agent cline`
- `beehive install --agent codebuddy`
- `beehive install --agent command-code`
- `beehive install --agent continue`
- `beehive install --agent cortex`
- `beehive install --agent crush`
- `beehive install --agent deepagents`
- `beehive install --agent devin`
- `beehive install --agent firebender`
- `beehive install --agent iflow`
- `beehive install --agent junie`
- `beehive install --agent kilo-code`
- `beehive install --agent kimi`
- `beehive install --agent kode`
- `beehive install --agent mcpjam`
- `beehive install --agent mistral-vibe`
- `beehive install --agent mux`
- `beehive install --agent neovate`
- `beehive install --agent openclaw`
- `beehive install --agent openhands`
- `beehive install --agent pochi`
- `beehive install --agent qoder`
- `beehive install --agent qwen-code`
- `beehive install --agent replit`
- `beehive install --agent roo-code`
- `beehive install --agent trae-cn`
- `beehive install --agent warp`
- `beehive install --agent windsurf`
- `beehive install --agent zencoder`

Expose the vault over MCP with:

```bash
BEEHIVE_WORKSPACE_ID=main beehive mcp
```

MCP tools require a `workspace_id` argument on each call; use the same id as the server environment. The MCP surface includes graph stats, read-only graph freshness (`graph_status`), symbol caller lookup with file:line call-site evidence (`graph_callers`), code-only graph refresh (`update_graph`, with an optional files array for per-file refreshes), graph clustering refresh, community lookup, hyperedges, context-pack build/read/list, task start/update/finish/list/read/resume, compatibility memory task, `doctor_vault`, and retrieval status/rebuild/doctor tools so host agents can request bounded evidence, keep a durable task ledger, keep the graph current after edits, and inspect vault health without shelling out to the CLI.

## Links

- Docs: https://www.beehive.ai/docs
- Providers: https://www.beehive.ai/docs/providers
- Troubleshooting: https://www.beehive.ai/docs/getting-started/troubleshooting
- npm: https://www.npmjs.com/package/@beehive/cli
- GitHub: https://github.com/beehive/beehive

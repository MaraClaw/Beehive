# Command Reference

Set `BEEHIVE_WORKSPACE_ID=<id>` once per shell, or add `--workspace-id <id>` to behavior commands, so CLI and MCP operations target the same generated artifact directory.

## Setup

```bash
beehive demo --no-serve
beehive quickstart ./apps/api
beehive quickstart ./docs/manual.pdf --no-serve
beehive next
beehive quickstart ./apps/api --no-serve
beehive init
beehive init --obsidian --profile personal-research
beehive init --obsidian --profile reader,timeline
beehive scan ./apps/api --no-serve
beehive scan ./apps/api --no-viz
beehive clone https://github.com/owner/repo --branch main --no-viz
beehive clone https://github.com/owner/repo --mcp
beehive --version
```

## Ingest and Capture

```bash
beehive source add https://github.com/karpathy/micrograd
beehive source add ./exports/customer-call.srt --guide
beehive source session <source-id-or-session-id>
beehive source list
beehive source reload --all
beehive source review <source-id>
beehive source guide <source-id>
beehive source delete <source-id>
beehive ingest <path-or-url>
beehive ingest ./customer-call.mp3
beehive ingest https://www.youtube.com/watch?v=dQw4w9WgXcQ
beehive ingest --video https://example.com/product-demo.mp4
beehive ingest <path-or-url> --commit
beehive ingest <path-or-url> --guide
beehive ingest <directory> --repo-root .
beehive add <url-or-doi-or-arxiv-id>
beehive inbox import <path>
```

## Compile, Query, Review

```bash
beehive compile
beehive compile --max-tokens 120000
beehive compile --approve
beehive diff
beehive query "<question>"
beehive query "<question>" --commit
beehive chat "What should the next agent know?"
beehive chat --resume <session-id> "What changed?"
beehive chat --list
beehive chat --delete <session-id>
beehive context build "<goal>" --target ./src --budget 8000
beehive context build "<goal>" --target concept:auth --format llms
beehive context list
beehive context show <context-pack-id>
beehive task start "<goal>" --target ./src --agent codex
beehive task update <task-id> --decision "Keep the change local-first"
beehive task update <task-id> --changed-path packages/engine/src/memory.ts
beehive task finish <task-id> --outcome "Task completed" --follow-up "Run release smoke"
beehive task resume <task-id> --format llms
beehive retrieval status
beehive retrieval doctor --repair
beehive doctor
beehive doctor --repair
beehive explore "<question>" --steps 3
beehive lint
beehive lint --conflicts
beehive review list
beehive review show <approval-id> --diff
beehive review accept <approval-id>
beehive candidate list
```

## Graph and Sharing

```bash
beehive graph serve
beehive graph serve --full
beehive graph share --post
beehive graph share --svg ./share-card.svg
beehive graph share --bundle ./share-kit
beehive graph blast ./src/index.ts
beehive graph callers "chargeCustomer"
beehive graph status ./src
beehive check-update ./src
beehive graph stats
beehive graph cycles
beehive graph validate --strict
beehive graph cluster
beehive cluster-only
beehive graph update ./src
beehive update ./src
beehive graph update --file ./src/auth.ts --file ./src/db.ts
beehive graph update ./src --force
beehive graph refresh
beehive graph query "auth calls" --context calls --evidence extracted --language typescript
beehive graph tree --output ./tree.html
beehive tree --output ./tree.html
beehive graph merge ./graph.json ./other-graph.json --out ./merged-graph.json
beehive merge-graphs ./graph.json ./other-graph.json --out ./merged-graph.json
beehive graph export --html ./graph.html
beehive graph export --report ./graph-report.html
beehive graph export --html ./graph.html --full
beehive graph export --html-standalone ./graph-standalone.html
beehive graph export --callflow ./callflow.html
beehive graph export --json ./graph.json --canvas ./graph.canvas
beehive graph export --obsidian ./graph-vault
beehive graph export --neo4j ./graph.cypher
beehive export ai --out ./exports/ai
beehive export ai --out ./exports/ai --no-page-siblings
beehive graph push neo4j --dry-run
BEEHIVE_WORKSPACE_ID=main beehive mcp
```

MCP tool calls must include `workspace_id`, matching the workspace id used to start the server.

## Providers

```bash
beehive provider add router --type openrouter --model openrouter/auto --api-key-env OPENROUTER_API_KEY --capability chat --capability structured --task queryProvider
beehive provider list
beehive provider show router
beehive provider remove router --fallback local
beehive provider setup --local-whisper --apply
```

## Automation

```bash
beehive watch --lint --repo
beehive watch --repo --code-only --once
beehive graph status .
beehive check-update .
beehive watch ./src --once --code-only
beehive graph validate --strict
beehive graph update .
beehive update .
beehive graph update --file packages/engine/src/index.ts
beehive graph update . --force
beehive watch status
beehive hook install
beehive hook install packages/app   # repo below the vault root
beehive schedule list
beehive schedule run <job-id>
```

## Agent Installs

```bash
beehive install --agent codex --hook
beehive install --agent claude --hook
beehive install --agent claude --hook --mcp
beehive install --agent claude --hook --mcp --graph-first
beehive install --agent claude --hook --scope user
beehive install --agent gemini --hook
beehive install --agent opencode --hook
beehive install --agent aider
beehive install --agent copilot --hook
beehive install --agent trae
beehive install --agent claw
beehive install --agent droid
beehive install --agent kilo --hook
beehive install --agent devin
beehive install status --agent kilo --hook
beehive install status --agent claude --hook --mcp
```

The Claude Code hook guides graph-first reads: session-start graph instructions plus a staleness note, a one-time advisory note on the first broad Grep/Glob/Bash search per session, and a background `beehive graph update --file <path>` refresh after Edit/Write. Add `--graph-first` to opt in to enforcement (the first broad search is denied once with a guided redirect; repeating the search is allowed) — it persists `hooks.graphFirst: "deny"` in `beehive.config.json`, and `BEEHIVE_GRAPH_FIRST=deny|context|off` overrides per session. `--mcp` registers the MCP server in the project `.mcp.json`; start it with `BEEHIVE_WORKSPACE_ID=<id>` or a `--workspace-id <id>` client arg, and include the same `workspace_id` in MCP tool calls. `--scope user` installs the Claude skill, hook, and settings under `~/.claude`.

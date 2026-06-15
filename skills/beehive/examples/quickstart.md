# Quickstart Example

Use this when the user needs the shortest path from install to a working vault.

## Commands

```bash
npm install -g @beehive/cli
export BEEHIVE_WORKSPACE_ID=main
beehive quickstart ./repo
beehive quickstart ./notes.pdf --no-serve
beehive next
beehive quickstart ./repo --no-serve
beehive demo --no-serve
beehive init --obsidian
beehive scan ./repo --no-serve
beehive scan ./repo --no-viz
beehive clone https://github.com/owner/repo --branch main --no-viz
beehive source add https://github.com/karpathy/micrograd
beehive source add https://github.com/owner/repo --branch main --checkout-dir .beehive-checkouts/repo
beehive diff
beehive graph share --post
beehive graph share --svg ./share-card.svg
beehive graph share --bundle ./share-kit
beehive graph blast ./src/index.ts
beehive graph status ./src
beehive check-update ./src
beehive graph stats
beehive graph validate --strict
beehive update ./src
beehive graph cluster
beehive cluster-only
beehive graph tree --output ./tree.html
beehive tree --output ./tree.html
beehive graph query "auth calls" --context calls --evidence extracted --language typescript
beehive query "What are the key concepts?"
beehive context build "Explain the key concepts to the next agent" --target ./repo --budget 8000
beehive task start "Explain the key concepts to the next agent" --target ./repo --agent codex
beehive retrieval status
beehive doctor
beehive graph serve
beehive graph export --report ./graph-report.html
beehive graph export --neo4j ./graph.cypher
beehive merge-graphs ./graph.json ./other-graph.json --out ./merged-graph.json
beehive chat "What should the next agent know?"
beehive chat --resume <session-id> "What changed?"
beehive export ai --out ./exports/ai
```

## What To Check

- `main/beehive.schema.md` exists and reflects the vault contract when using the example workspace id
- `beehive next` reports `uninitialized`, `initialized`, or `compiled` and recommends the next safe command without changing files
- `demo --no-serve` leaves a temporary compiled vault behind even on a clean machine
- `quickstart`, `quickstart --no-serve`, `scan --no-serve`, `scan --no-viz`, and `clone --no-viz` accept local files as well as directories and leave a compiled vault behind even when the viewer is not launched
- `quickstart`, `scan`, and `clone` do not create project-local agent rule files unless `--install-agent-rules` is passed with configured agents
- `main/state/sources.json` contains the managed source registry entry when using the example workspace id
- `main/wiki/graph/report.md` exists after compile when using the example workspace id
- `graph status` and `check-update` report whether tracked repo changes need `graph update`/`update` or a full `compile` without writing watch state
- `watch [path] --once --code-only` can refresh one repo root without persisting watch config
- `graph stats` prints lightweight graph counts and relation mix without opening the viewer
- `graph validate --strict` checks graph artifact integrity before export, merge, push, or publish workflows
- `graph cluster` and `cluster-only` refresh graph communities and report artifacts from the existing graph without another ingest
- `graph query` can focus traversal with relation/context/evidence/node/language filters
- `graph tree` and `tree` write an interactive source/module/symbol HTML tree with a node inspector when the user wants file-oriented browsing
- `graph merge` and `merge-graphs` combine Beehive or node-link graph JSON artifacts
- `wiki/graph/share-card.md`, `wiki/graph/share-card.svg`, and `wiki/graph/share-kit/` exist after compile; `graph share --post` prints copyable text, `graph share --svg [path]` writes the visual card, and `graph share --bundle [dir]` writes the portable share kit
- `graph export --report` writes a shareable HTML report when the user wants a lighter artifact than the full workspace; `graph export --neo4j` writes a Cypher import file for Neo4j workflows
- `wiki/outputs/source-briefs/` contains a source brief
- `wiki/outputs/` contains the saved query answer
- `wiki/outputs/chat-sessions/` and `state/chat-sessions/` contain the chat transcript and structured session state when `chat` is used
- `wiki/context/` and `state/context-packs/` contain the saved context pack when `context build` is used
- `wiki/exports/ai/` or the configured export directory contains `llms.txt`, `llms-full.txt`, `graph.jsonld`, `manifest.json`, `ai-readme.md`, and optional page siblings when `export ai` is used
- `wiki/memory/` and `state/memory/tasks/` contain task ledger artifacts when `task start` is used
- `main/state/graph.json` and `main/state/retrieval/` exist when using the example workspace id
- `beehive doctor` reports `ok` or gives concrete next commands such as `beehive compile` or `beehive retrieval rebuild`; `graph serve` shows those checks and commands in the workbench

## Guidance

- If the answer quality is weak, check whether the vault is still on the `heuristic` provider.
- If the user is unsure what changed, point them at `wiki/` and `state/` before suggesting another compile.
- When the vault lives in git, `beehive diff` is the quickest graph-level summary of what the last compile changed.

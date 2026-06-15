# Repo Workflow Example

Use this when the user wants to compile a codebase into durable module pages, graph artifacts, and reviewable outputs.

## Commands

```bash
beehive init --obsidian
beehive source add https://github.com/karpathy/micrograd
beehive source add https://github.com/owner/repo --branch main --checkout-dir .beehive-checkouts/repo
beehive compile --approve
beehive diff
beehive review list
beehive review show <approval-id> --diff
beehive review accept <approval-id>
beehive query "What is the auth flow?"
beehive chat "What should the next agent know about auth?"
beehive context build "Hand off the auth flow work" --target ./src --budget 8000
beehive task start "Hand off the auth flow work" --target ./src --agent codex
beehive export ai --out ./exports/ai
beehive doctor
beehive graph share --post
beehive graph share --svg ./share-card.svg
beehive graph share --bundle ./share-kit
beehive graph tree --output ./tree.html
beehive graph query "auth calls" --context calls --evidence extracted --language typescript
beehive graph serve
```

## What To Check

- `wiki/code/` contains module pages
- `wiki/outputs/source-briefs/` contains a repo onboarding brief
- `state/code-index.json` exists for repo-aware symbol/import resolution
- `beehive diff` reflects the graph-level additions and removals when the vault is inside git
- `state/approvals/` contains staged review bundles when `--approve` is used
- `wiki/graph/report.md` highlights the important modules, bridge nodes, and contradictions
- `graph query` filters help users focus on calls, imports, data edges, rationale edges, evidence classes, node types, or languages
- `wiki/graph/tree.html` or the chosen tree export path helps users browse sources, modules, symbols, and connected edges as a file tree
- `wiki/outputs/chat-sessions/` and `state/chat-sessions/` contain saved conversation state when `chat` is used for follow-up handoff
- `wiki/context/` and `state/context-packs/` contain bounded handoff packs when `context build` is used
- `wiki/exports/ai/` or the chosen export path contains static AI handoff files when `export ai` is used
- `wiki/memory/` and `state/memory/tasks/` contain durable task records when `task start` is used
- `beehive doctor` summarizes graph, retrieval, review, watch, migration, source, and task health before handoff; the live workbench shows the same details and suggested commands
- `wiki/graph/share-card.md` gives a short summary for status updates, `wiki/graph/share-card.svg` gives a visual card, and `wiki/graph/share-kit/` gives a portable folder for posting, linking, or screenshotting

## Guidance

- Prefer reading `wiki/graph/report.md` and the relevant `wiki/code/*.md` pages before broad grep.
- Use `beehive chat --resume <id>` when a repo question needs multiple follow-ups and the transcript should stay on disk.
- Use `beehive context build` before handing a scoped repo task to another agent or reviewer.
- Use `beehive export ai --out <dir>` when the compiled repo wiki needs to be consumed without starting a server.
- Use `beehive task resume <id>` when a future agent needs the task summary, decisions, evidence, and follow-ups.
- If organization is wrong, update `beehive.schema.md` first instead of hand-editing generated pages.
- Use `beehive watch --lint --repo` plus `beehive hook install` when the repo should stay current automatically.

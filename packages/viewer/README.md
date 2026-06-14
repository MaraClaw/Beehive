# @beehive/viewer

`@beehive/viewer` is the graph UI package for Beehive.

It powers `beehive graph serve` and renders `state/graph.json` as an interactive graph of sources, concepts, entities, agent tasks, and decisions.

## What It Does

The viewer loads graph data from `/api/graph` and renders:

- source nodes
- concept nodes
- entity nodes
- agent task and decision nodes
- extracted, inferred, conflicted, and stale edge states
- the workflow rail for approvals, candidates, refresh state, lint findings, activity, and the Memory dashboard
- the vault workbench for prioritized doctor recommendations, full doctor checks, copyable suggested commands, safe repair, title/tag capture mode selection, budgeted context-pack creation, and task starts

Its main purpose is to support the Beehive runtime, but the package also exports lightweight types and helpers for custom integrations.

## Package Use

```ts
import { fetchGraphArtifact } from "@beehive/viewer";

const graph = await fetchGraphArtifact("/api/graph");
console.log(graph.nodes.length);
```

## Notes

- End users do not need to install this package separately to use `beehive graph serve`
- The CLI and engine bundle the built viewer assets for the normal install path

## Development

```bash
pnpm build
pnpm lint
pnpm test
```

## Links

- Website: <https://www.beehive.ai>
- Docs: <https://www.beehive.ai/docs>
- GitHub: <https://github.com/MaraClaw/Beehive>

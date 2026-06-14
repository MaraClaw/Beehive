# VIEWER COMPONENTS KNOWLEDGE BASE

## OVERVIEW

Components are domain UI sections for graph navigation, vault workflow panels, review/candidate queues, memory tasks, exports, and command actions.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Graph renderer | `GraphCanvas.tsx` | Cytoscape lifecycle, layouts, labels, path highlighting, hyperedge hubs, test API. |
| Graph companions | `GraphMinimap.tsx`, `GraphLegend.tsx`, `GraphTools.tsx`, `SelectionPanel.tsx` | Minimap, legend, query/path/explain, selected node details. |
| Left rail | `FilterSidebar.tsx` | Search, graph/page filters, top-N tags, multi-select AND tags. |
| Top/status | `StatsBar.tsx`, `ActivityFeed.tsx`, `PendingRefresh.tsx` | Metrics, SSE activity, watch/pending refresh. |
| Workbench | `WorkbenchDashboard.tsx` | Doctor, safe repair, capture, context pack, task start, copyable commands. |
| Review flows | `ApprovalQueue.tsx`, `DiffView.tsx`, `CandidateList.tsx` | Approvals, diffs, candidate promote/archive. |
| Content preview | `PagePreview.tsx`, `SearchResults.tsx`, `ReportTabs.tsx` | Markdown/frontmatter/assets/backlinks, search results, graph report tabs. |
| Memory and lint | `MemoryDashboard.tsx`, `LintFindings.tsx` | Task evidence/navigation and lint workflow. |
| Shell controls | `CommandPalette.tsx`, `ExportMenu.tsx`, `ThemeToggle.tsx`, `Tabs.tsx`, `UndoToast.tsx` | Command/search UI, exports, theme, tabs, undo. |
| Shared types | `types.ts` | Component-local re-export barrel from `../lib`. |

## CONVENTIONS

- Components import shared viewer domain types from `components/types.ts` where possible.
- `GraphCanvas` is not normal DOM rendering; React constructs/destroys Cytoscape and wires events through effects.
- `GraphCanvas` uses React 19 `useEffectEvent`; preserve that assumption when changing event callbacks.
- Hyperedge hubs are viewer-only transient nodes and must not leak into page data, tag filters, or persisted graph output.
- Component tests assert behavior: graph selection/hyperedges/path highlighting, tag filtering, workbench actions, memory evidence, candidates, page preview.
- Accessibility attributes are part of the component contract: labels, toolbar/dialog/menu roles, live regions, pressed/expanded/haspopup states.

## ANTI-PATTERNS

- Do not snapshot-test broad UI output when a domain behavior assertion can cover the change.
- Do not move graph layout semantics into CSS; Cytoscape styles/layouts live in `GraphCanvas` logic.
- Do not change shared class names casually; `styles.css` owns global panel/card/button/chip conventions.
- Do not infer component ownership from visual position alone; state often lives in `App.tsx` for route/workspace synchronization.
- Do not add component-specific API fetches if the data belongs in `workspaceStore` or `lib.ts`.

## NOTES

- `ExportMenu` has small inline menu/style exceptions; most new styling should still go through `styles.css`.
- Keep responsive and reduced-motion behavior in global CSS while preserving component ARIA behavior in TSX.

# SMOKE FIXTURES KNOWLEDGE BASE

## OVERVIEW

`smoke/` contains release/live validation inputs. Treat these files as test fixtures whose exact shapes drive ingest routing and smoke expectations, not as examples to beautify.

## STRUCTURE

```
fixtures/source.md          # small canonical source document
fixtures/tiny-matrix/       # multi-language and source-kind matrix
fixtures/inbox-bundle/      # markdown/html clips with linked local asset
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Source kind matrix | `fixtures/tiny-matrix/AGENTS.md` | Read before changing committed fixture corpus. |
| Inbox attachments | `fixtures/inbox-bundle/AGENTS.md` | Read before changing clip asset links. |
| Expected coverage | `../packages/engine/test/tiny-validation.test.ts` | Generates many source-kind fixtures after copying matrix. |
| Live smoke generation | `../scripts/live-smoke.mjs` | Generates smaller doc/csv/xlsx/pptx/epub set. |
| Maintainer contract | `../docs/live-testing.md` | Documents live-smoke/source-kind expectations. |

## CONVENTIONS

- Committed language fixtures should stay tiny and deterministic.
- Binary, bulky, or derivable source-kind fixtures should usually be generated in tests/scripts instead of committed.
- Office variants need unique bytes per extension because ingest dedupes by content hash.
- Invalid or edge image bytes may be enough when the assertion is routing or warning behavior.
- `docs/page.html` in tiny matrix is expected as sourceKind code language html during repo ingest.
- `docs/guide.rst` is expected as text mime `text/x-rst` with heading/directive normalization.

## ANTI-PATTERNS

- Do not remove tiny helper/base files just because they look trivial; they exercise imports/classes/inheritance/exports.
- Do not change HTML-as-code expectation without updating engine tests and live smoke.
- Do not edit generated temp workspaces, `raw/`, `wiki/`, `state/`, `agent/`, or `inbox` copies as canonical fixtures.
- Do not replace small generated fixtures with heavyweight real documents.

## NOTES

- Source kinds under test include markdown, text, pdf, docx, epub, csv, xlsx, pptx, image, code, jupyter, odt, odp, ods, data, bibtex, rtf, org, and asciidoc.
- Safe fixture changes usually pair edits here with `tiny-validation.test.ts`, `live-smoke.mjs`, and docs.

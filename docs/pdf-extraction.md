# PDF Extraction Strategy

Beehive's PDF extraction is a **best-effort** pipeline. PDFs are a lossy medium — layout, tables, and embedded images do not always survive extraction — and the default extractor prioritizes accurate local text recovery while preserving a zero-setup fallback. This document records that choice so users know what to expect.

## Default extractor

Beehive first tries Poppler `pdftotext` at ingest time for every `.pdf` source. Set `BEEHIVE_PDFTOTEXT_BINARY` to point at a custom binary, or leave it unset to use `pdftotext` from `PATH`. If Poppler is unavailable or exits unsuccessfully, Beehive automatically falls back to the bundled Mozilla `pdf.js` path through `pdfjs-dist`.

Output is plain UTF-8 text with page sections joined by markdown paragraph breaks. The result is written to `state/extracts/<source-id>.md` alongside a JSON sidecar with extractor kind, page count, and warnings when extraction cannot recover text.

We picked this default because:

- Poppler generally recovers text-layer reading order, Unicode mappings, and hyphenation more accurately than token-joining directly from `pdf.js`.
- It remains local and offline; Beehive invokes a user-installed binary and does not send PDFs to a cloud service.
- It keeps the zero-setup path: when Poppler is not installed, `pdfjs-dist` still works on every platform Beehive runs on (macOS, Linux, Windows) without native binaries.
- It does not require a provider API key — the heuristic `beehive init` path produces usable PDF extractions with no network.
- It is deterministic for a given extractor — the same PDF and binary produce the same extraction, which keeps `source_hashes` stable after the one-time extractor change.

Install Poppler when you want the higher-accuracy path:

```bash
# macOS
brew install poppler

# Debian / Ubuntu
sudo apt install poppler-utils

# Fedora
sudo dnf install poppler-utils
```

Windows users can install Poppler through a package manager or set `BEEHIVE_PDFTOTEXT_BINARY` to a downloaded `pdftotext.exe`; otherwise Beehive uses the `pdfjs-dist` fallback.

## Known limitations

- **Tables** still render as flattened text. Poppler usually improves row and reading order compared with direct `pdf.js` token joins, but table structure is not preserved in the graph.
- **Scanned PDFs with no text layer** produce empty extractions. There is no OCR in the default path. For scanned documents, ingest the original image files separately (`.png` / `.jpg`) — the vision provider path will see them.
- **Multi-column layouts** that rely on column breaks for reading order sometimes interleave sentences incorrectly. The paragraph-grouping fallback in `extractRationaleFromMarkdown` tolerates this but rationale markers inside fragmented paragraphs may not be detected.
- **Mathematical notation** is preserved only to the extent the source PDF embedded the glyphs as text. LaTeX-rendered math typically arrives as garbled Unicode.
- **Embedded images** are not extracted. Ingest the figures separately if they matter.
- **PDF document metadata** is best-effort. The `pdfjs-dist` fallback can expose metadata fields that Poppler `pdftotext` does not emit.

## Opting into richer extraction

Two extension points exist today and neither is on by default:

### Vision-based PDF understanding (experimental)

Configure a vision provider and set `tasks.visionProvider` to a capability that includes `vision`. At ingest, a future extension path will render PDF pages as images and send them through vision. **This path is not wired into the default PDF extractor** — it remains experimental. Users who need it today can run an external renderer and drop the images into `inbox/`.

### Custom pdftotext-compatible binary

Set `BEEHIVE_PDFTOTEXT_BINARY` to a wrapper script or alternate `pdftotext`-compatible binary when you need a custom local PDF extraction pipeline while preserving Beehive's sidecar contract. This escape hatch is covered by the **Experimental** tier in `STABILITY.md`.

## Recommendations by use case

- **Academic papers with prose body**: install Poppler for the best local text-layer extraction. Figures and tables will still be flattened, but captions usually survive.
- **Financial reports and spreadsheet-derived PDFs**: consider converting to `.xlsx` or `.csv` at the source. Beehive's structured extractors handle those natively.
- **Scanned archives / image-heavy PDFs**: run an external OCR pass and ingest the resulting `.txt` or `.md` files.
- **Slide decks**: convert to `.pptx` where possible. The PPTX extractor produces one entry per slide, which aligns better with the compile graph than a flattened PDF.

## Why PDF is still best-effort

The `spec.md` "Risks And Open Questions" section flagged PDF extraction variance as a persistent concern. Poppler improves the default local text path, but PDFs still mix text layers, drawing commands, scanned images, and layout conventions in ways no lightweight local extractor can recover perfectly. OCR and vision-based PDF understanding remain separate, heavier workflows.

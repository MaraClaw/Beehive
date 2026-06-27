import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runTool } from "./tool-runner.js";
import type { SourceExtractionArtifact } from "./types.js";
import { normalizeWhitespace, truncate } from "./utils.js";

function pdfExtractionMetadata(mimeType: string): SourceExtractionArtifact {
  return {
    extractor: "pdf_text",
    sourceKind: "pdf",
    mimeType,
    producedAt: new Date().toISOString()
  };
}

function pdftotextBinary(): string {
  const configured = process.env.BEEHIVE_PDFTOTEXT_BINARY?.trim();
  return configured || "pdftotext";
}

function pdftotextPageCount(stdout: string): number {
  const separatorCount = stdout.match(/\f/g)?.length ?? 0;
  if (separatorCount === 0) {
    return 1;
  }
  return stdout.endsWith("\f") ? separatorCount : separatorCount + 1;
}

async function tryPdftotextExtract(bytes: Buffer): Promise<{ extractedText?: string; pageCount: number } | null> {
  const binary = pdftotextBinary();
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "beehive-pdf-"));
  const inputPath = path.join(tmpDir, "input.pdf");
  try {
    await fs.writeFile(inputPath, bytes);
    const result = await runTool(binary, ["-enc", "UTF-8", inputPath, "-"]);
    if (result.code !== 0) {
      return null;
    }
    const extractedText = result.stdout
      .split("\f")
      .map((page) => normalizeWhitespace(page))
      .filter(Boolean)
      .join("\n\n")
      .trim();
    return {
      extractedText: extractedText || undefined,
      pageCount: pdftotextPageCount(result.stdout)
    };
  } catch (error) {
    if (error instanceof Error) {
      return null;
    }
    throw error;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

function normalizePdfMetadata(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      const cleaned = normalizeWhitespace(value);
      if (cleaned) {
        metadata[key] = cleaned;
      }
    }
  }

  return Object.keys(metadata).length ? metadata : undefined;
}

export async function extractPdfText(input: {
  mimeType: string;
  bytes: Buffer;
}): Promise<{ extractedText?: string; artifact: SourceExtractionArtifact }> {
  const pdftotextResult = await tryPdftotextExtract(input.bytes);
  if (pdftotextResult) {
    const artifact: SourceExtractionArtifact = {
      ...pdfExtractionMetadata(input.mimeType),
      pageCount: pdftotextResult.pageCount
    };

    if (!pdftotextResult.extractedText) {
      artifact.warnings = ["PDF text extraction completed but produced no extractable text."];
    }

    return {
      extractedText: pdftotextResult.extractedText,
      artifact
    };
  }

  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    type PdfDocumentInitParameters = Parameters<typeof pdfjs.getDocument>[0] & { isEvalSupported: boolean };
    const documentOptions: PdfDocumentInitParameters = {
      data: new Uint8Array(input.bytes),
      useWorkerFetch: false,
      disableFontFace: true,
      isEvalSupported: false,
      verbosity: 0
    };
    const task = pdfjs.getDocument(documentOptions);
    const document = await task.promise;
    const pageCount = document.numPages;
    const pageTexts: string[] = [];
    let metadataInfo: unknown;

    try {
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        try {
          const textContent = await page.getTextContent();
          const pageText = normalizeWhitespace(
            textContent.items
              .map((item) => (typeof item === "object" && item && "str" in item && typeof item.str === "string" ? item.str : ""))
              .join(" ")
          );
          if (pageText) {
            pageTexts.push(pageText);
          }
        } finally {
          page.cleanup();
        }
      }

      const metadataResult = await document.getMetadata().catch(() => null);
      metadataInfo = metadataResult?.info;
    } finally {
      await task.destroy();
    }

    const extractedText = pageTexts.join("\n\n").trim();
    const artifact: SourceExtractionArtifact = {
      ...pdfExtractionMetadata(input.mimeType),
      pageCount,
      metadata: normalizePdfMetadata(metadataInfo)
    };

    if (!extractedText) {
      artifact.warnings = ["PDF text extraction completed but produced no extractable text."];
    }

    return {
      extractedText: extractedText || undefined,
      artifact
    };
  } catch (error) {
    return {
      artifact: {
        ...pdfExtractionMetadata(input.mimeType),
        warnings: [`PDF text extraction failed: ${error instanceof Error ? truncate(error.message, 240) : "unknown error"}`]
      }
    };
  }
}

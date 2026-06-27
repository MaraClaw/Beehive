import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extractPdfText } from "../src/extraction.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "beehive-pdf-extraction-"));
  tempDirs.push(dir);
  return dir;
}

async function makeFakeBinary(dir: string, name: string, script: string): Promise<string> {
  const binPath = path.join(dir, name);
  await fs.writeFile(binPath, `#!/usr/bin/env node\n${script}\n`, "utf8");
  await fs.chmod(binPath, 0o755);
  return binPath;
}

function createSimplePdf(text: string): Buffer {
  const escaped = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const stream = `BT /F1 18 Tf 72 720 Td (${escaped}) Tj ET`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
  delete process.env.BEEHIVE_PDFTOTEXT_BINARY;
});

describe("PDF extraction", () => {
  it("uses pdftotext output when the binary is available", async () => {
    const dir = await makeTempDir();
    const output = "Poppler page one\fPoppler page two\n";
    process.env.BEEHIVE_PDFTOTEXT_BINARY = await makeFakeBinary(dir, "pdftotext", `process.stdout.write(${JSON.stringify(output)});`);

    const result = await extractPdfText({ mimeType: "application/pdf", bytes: createSimplePdf("PDF.js fallback text") });

    expect(result.extractedText).toBe("Poppler page one\n\nPoppler page two");
    expect(result.artifact.extractor).toBe("pdf_text");
    expect(result.artifact.sourceKind).toBe("pdf");
    expect(result.artifact.pageCount).toBe(2);
  });

  it("returns a warning artifact when pdftotext succeeds without text", async () => {
    const dir = await makeTempDir();
    process.env.BEEHIVE_PDFTOTEXT_BINARY = await makeFakeBinary(dir, "pdftotext", "process.exit(0);");

    const result = await extractPdfText({ mimeType: "application/pdf", bytes: createSimplePdf("PDF.js fallback text") });

    expect(result.extractedText).toBeUndefined();
    expect(result.artifact.extractor).toBe("pdf_text");
    expect(result.artifact.sourceKind).toBe("pdf");
    expect(result.artifact.pageCount).toBe(1);
    expect(result.artifact.warnings?.length).toBeGreaterThan(0);
  });

  it("falls back to pdfjs-dist when pdftotext exits unsuccessfully", async () => {
    const dir = await makeTempDir();
    process.env.BEEHIVE_PDFTOTEXT_BINARY = await makeFakeBinary(
      dir,
      "pdftotext",
      'process.stderr.write("forced pdftotext failure");\nprocess.exit(2);'
    );

    const result = await extractPdfText({ mimeType: "application/pdf", bytes: createSimplePdf("Fallback extraction text") });

    expect(result.extractedText).toContain("Fallback extraction text");
    expect(result.artifact.extractor).toBe("pdf_text");
    expect(result.artifact.pageCount).toBe(1);
  });

  it("returns a warning artifact when no extractor can parse the PDF", async () => {
    process.env.BEEHIVE_PDFTOTEXT_BINARY = path.join(os.tmpdir(), "missing-beehive-pdftotext");

    const result = await extractPdfText({ mimeType: "application/pdf", bytes: Buffer.from("not a pdf") });

    expect(result.extractedText).toBeUndefined();
    expect(result.artifact.extractor).toBe("pdf_text");
    expect(result.artifact.warnings?.length).toBeGreaterThan(0);
  });
});

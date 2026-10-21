import { describe, it, expect } from "vitest";
import { parsePdf, parseDocumentFile } from "@/lib/ai/parser";

describe("PDF Parser Engine (pdf-parse v2)", () => {
  // Minimal valid 2-page PDF fixture
  const samplePdfBytes = Buffer.from(
    `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R 4 0 R]/Count 2>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>/Contents 6 0 R>>endobj
5 0 obj<</Length 50>>stream
BT /F1 14 Tf 50 100 Td (Page One: Classical Mechanics) Tj ET
endstream
endobj
6 0 obj<</Length 48>>stream
BT /F1 14 Tf 50 100 Td (Page Two: Quantum Chemistry) Tj ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000123 00000 n 
0000000224 00000 n 
0000000325 00000 n 
0000000424 00000 n 
trailer<</Size 7/Root 1 0 R>>
startxref
521
%%EOF`
  );

  it("extracts non-empty text and preserves page numbers from PDF", async () => {
    const pages = await parsePdf(samplePdfBytes);

    expect(pages).toBeDefined();
    expect(pages.length).toBe(2);

    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].text).toContain("Classical Mechanics");

    expect(pages[1].pageNumber).toBe(2);
    expect(pages[1].text).toContain("Quantum Chemistry");
  });

  it("integrates with parseDocumentFile master router for PDF files", async () => {
    const doc = await parseDocumentFile(samplePdfBytes, "physics_lecture.pdf", "application/pdf");

    expect(doc.title).toBe("physics_lecture.pdf");
    expect(doc.fileType).toBe("pdf");
    expect(doc.totalPages).toBe(2);
    expect(doc.pages.length).toBe(2);
    expect(doc.fullText).toContain("Classical Mechanics");
    expect(doc.fullText).toContain("Quantum Chemistry");
  });

  it("throws a descriptive error when parsing corrupted PDF data", async () => {
    const invalidBytes = Buffer.from("Not a real PDF file contents");

    await expect(parsePdf(invalidBytes)).rejects.toThrow(/Failed to parse PDF document/);
  });
});

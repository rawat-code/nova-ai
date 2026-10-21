import { cleanExtractedText, type ParsedPage } from "./parser";

export interface DocumentChunk {
  chunkIndex: number;
  content: string;
  pageNumber: number;
  metadata: {
    charCount: number;
    wordCount: number;
    pageNumber: number;
  };
}

export interface ChunkOptions {
  /**
   * Target character size per chunk. Defaults to 1200 chars (~250-300 tokens).
   */
  chunkSize?: number;
  /**
   * Overlap character size between consecutive chunks. Defaults to 200 chars (~40-50 tokens).
   */
  overlap?: number;
  /**
   * Minimum chunk length to avoid tiny single-word or punctuation fragments. Defaults to 40 chars.
   */
  minChunkSize?: number;
}

/**
 * Split text at natural linguistic boundaries (paragraphs, sentences, or word breaks).
 */
function splitTextAtBoundary(text: string, targetLength: number): number {
  if (text.length <= targetLength) return text.length;

  // Search window for finding a natural break before targetLength
  const searchWindowStart = Math.max(0, targetLength - Math.floor(targetLength * 0.3));
  const segment = text.slice(searchWindowStart, targetLength);

  // 1. Prefer paragraph break (\n\n)
  const paragraphBreak = segment.lastIndexOf("\n\n");
  if (paragraphBreak !== -1) {
    return searchWindowStart + paragraphBreak + 2;
  }

  // 2. Prefer single newline (\n)
  const newlineBreak = segment.lastIndexOf("\n");
  if (newlineBreak !== -1) {
    return searchWindowStart + newlineBreak + 1;
  }

  // 3. Prefer sentence boundary (.!?) followed by space
  const sentenceMatch = segment.match(/[.!?]\s+(?=[^.!?]*$)/);
  if (sentenceMatch && sentenceMatch.index !== undefined) {
    return searchWindowStart + sentenceMatch.index + sentenceMatch[0].length;
  }

  // 4. Prefer word boundary (space)
  const spaceBreak = segment.lastIndexOf(" ");
  if (spaceBreak !== -1) {
    return searchWindowStart + spaceBreak + 1;
  }

  // 5. Fallback: hard slice at targetLength
  return targetLength;
}

/**
 * Chunks a list of parsed pages while strictly preserving source page numbers and applying overlap.
 */
export function chunkPages(
  pages: ParsedPage[],
  options: ChunkOptions = {}
): DocumentChunk[] {
  const chunkSize = Math.max(50, options.chunkSize ?? 1200);
  const overlap = Math.min(Math.floor(chunkSize * 0.5), Math.max(0, options.overlap ?? 200));
  const minChunkSize = options.minChunkSize ?? 20;

  const chunks: DocumentChunk[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageText = cleanExtractedText(page.text);
    if (!pageText || pageText.length < minChunkSize) {
      if (pageText.length > 0) {
        // Even if short, if it's the only content on this page, keep it
        chunks.push({
          chunkIndex: globalChunkIndex++,
          content: pageText,
          pageNumber: page.pageNumber,
          metadata: {
            charCount: pageText.length,
            wordCount: pageText.split(/\s+/).filter(Boolean).length,
            pageNumber: page.pageNumber,
          },
        });
      }
      continue;
    }

    // When the page text fits comfortably within a single chunk
    if (pageText.length <= chunkSize) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        content: pageText,
        pageNumber: page.pageNumber,
        metadata: {
          charCount: pageText.length,
          wordCount: pageText.split(/\s+/).filter(Boolean).length,
          pageNumber: page.pageNumber,
        },
      });
      continue;
    }

    // Multi-chunk page with sliding window and overlap
    let startIdx = 0;
    while (startIdx < pageText.length) {
      const remainingLength = pageText.length - startIdx;

      // If what's left is small and we already have chunks from this page, merge or finalize
      if (remainingLength <= chunkSize) {
        const finalSlice = pageText.slice(startIdx).trim();
        if (finalSlice.length >= minChunkSize) {
          chunks.push({
            chunkIndex: globalChunkIndex++,
            content: finalSlice,
            pageNumber: page.pageNumber,
            metadata: {
              charCount: finalSlice.length,
              wordCount: finalSlice.split(/\s+/).filter(Boolean).length,
              pageNumber: page.pageNumber,
            },
          });
        }
        break;
      }

      const splitPoint = splitTextAtBoundary(
        pageText.slice(startIdx),
        chunkSize
      );

      const chunkContent = pageText.slice(startIdx, startIdx + splitPoint).trim();

      if (chunkContent.length >= minChunkSize) {
        chunks.push({
          chunkIndex: globalChunkIndex++,
          content: chunkContent,
          pageNumber: page.pageNumber,
          metadata: {
            charCount: chunkContent.length,
            wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
            pageNumber: page.pageNumber,
          },
        });
      }

      // Slide start forward by (splitPoint - overlap)
      const advanceBy = Math.max(splitPoint - overlap, Math.floor(chunkSize * 0.2));
      startIdx += advanceBy;
    }
  }

  return chunks;
}

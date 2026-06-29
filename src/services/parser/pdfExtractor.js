/**
 * pdfExtractor.js
 * Coordinate-aware text extraction from pdf.js TextContent.
 * Groups text items into lines using Y-coordinate proximity,
 * then sorts each line by X-coordinate (left-to-right).
 *
 * Returns an array of line strings per page, and a flat full-text string.
 */

const LINE_Y_THRESHOLD = 3; // px — items within this Y range belong to the same line

/**
 * Extract structured lines from a single pdf.js page.
 * @param {import('pdfjs-dist').PDFPageProxy} page
 * @returns {Promise<string[]>} Array of trimmed line strings for the page
 */
export async function extractPageLines(page) {
  const content = await page.getTextContent();
  const items = content.items.filter((item) => item.str.trim() !== "");

  if (items.length === 0) return [];

  // Each item has transform = [scaleX, skewX, skewY, scaleY, translateX, translateY]
  // translateY is the Y baseline of the text item (higher Y = higher on page in PDF space)
  const annotated = items.map((item) => ({
    x: item.transform[4],
    y: item.transform[5],
    text: item.str,
  }));

  // Group by Y proximity
  const lineGroups = [];
  for (const item of annotated) {
    const existing = lineGroups.find(
      (group) => Math.abs(group.y - item.y) <= LINE_Y_THRESHOLD
    );
    if (existing) {
      existing.items.push(item);
    } else {
      lineGroups.push({ y: item.y, items: [item] });
    }
  }

  // Sort groups top-to-bottom (descending Y in PDF space = top of page)
  lineGroups.sort((a, b) => b.y - a.y);

  // Within each group, sort items left-to-right
  return lineGroups.map((group) => {
    group.items.sort((a, b) => a.x - b.x);
    return group.items.map((i) => i.text).join(" ").trim();
  });
}

/**
 * Extract all text from a pdf.js PDFDocumentProxy.
 * @param {import('pdfjs-dist').PDFDocumentProxy} pdfDoc
 * @returns {Promise<{ pageLines: string[][], fullText: string }>}
 */
export async function extractAllText(pdfDoc) {
  const pageLines = [];
  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const lines = await extractPageLines(page);
    pageLines.push(lines);
  }
  const fullText = pageLines.map((lines) => lines.join("\n")).join("\n");
  return { pageLines, fullText };
}

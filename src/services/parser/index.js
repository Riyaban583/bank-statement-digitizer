/**
 * src/services/parser/index.js
 * Public entry point for the bank statement parser module.
 *
 * Usage:
 *   import { parseStatement } from "./services/parser";
 *   const { bank, transactions } = await parseStatement(pdfDoc);
 *
 * pdfDoc is a pdf.js PDFDocumentProxy obtained from pdfjsLib.getDocument(...).promise
 */

import { extractAllText } from "./pdfExtractor.js";
import { detectBank } from "./bankDetector.js";
import { parseSBI } from "./parseSBI.js";
import { parseHDFC } from "./parseHDFC.js";
import { parseICICI } from "./parseICICI.js";
import { parseAxis } from "./parseAxis.js";
import { parsePNB } from "./parsePNB.js";
import { parseKotak } from "./parseKotak.js";
import { parseBOB } from "./parseBOB.js";
import { parseCanara } from "./parseCanara.js";
import { parseUnion } from "./parseUnion.js";
import { parseIDFC } from "./parseIDFC.js";
import { parseIndusInd } from "./parseIndusInd.js";
import { parseAU } from "./parseAU.js";
import { parseGeneric } from "./parseGeneric.js";

/**
 * Dispatch parsed text to the correct bank-specific parser.
 * @param {string} fullText
 * @param {string} bankId
 * @returns {Array<{ date: string, description: string, debit: number, credit: number, balance: number|null }>}
 */
function dispatchParser(fullText, bankId) {
  switch (bankId) {
    case "SBI":
      return parseSBI(fullText);
    case "HDFC":
      return parseHDFC(fullText);
    case "ICICI":
      return parseICICI(fullText);
    case "AXIS":
      return parseAxis(fullText);
    case "PNB":
      return parsePNB(fullText);
    case "KOTAK":
      return parseKotak(fullText);
    case "BOB":
      return parseBOB(fullText);
    case "CANARA":
      return parseCanara(fullText);
    case "UNION":
      return parseUnion(fullText);
    case "IDFC":
      return parseIDFC(fullText);
    case "INDUSIND":
      return parseIndusInd(fullText);
    case "AU":
      return parseAU(fullText);
    default:
      return parseGeneric(fullText);
  }
}

/**
 * Parse a pdf.js PDFDocumentProxy into a list of transactions.
 *
 * @param {import('pdfjs-dist').PDFDocumentProxy} pdfDoc
 * @returns {Promise<{
 *   bank: string,
 *   transactions: Array<{ date: string, description: string, debit: number, credit: number, balance: number|null }>
 * }>}
 * @throws {Error} If the PDF cannot be read or yields no extractable text
 */
export async function parseStatement(pdfDoc) {
  const { fullText } = await extractAllText(pdfDoc);

  if (!fullText || fullText.trim().length < 50) {
    throw new Error(
      "This statement appears to be a scanned PDF. Only digital (text-based) PDFs are supported."
    );
  }

  const bank = detectBank(fullText);
  const transactions = dispatchParser(fullText, bank);

  return { bank, transactions };
}


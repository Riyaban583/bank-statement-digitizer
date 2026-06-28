// ============================================================
// transactionParser.js — FINAL FIXED VERSION
// Accepts BOTH string and array input in parseTransactions()
// PDF format: "01/05/2026 Salary Credit - 12000 112000"
// ============================================================

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// ─── Helpers ────────────────────────────────────────────────

function parseAmount(str) {
  if (!str || /^[-—–]$/.test(str.trim())) return 0;
  const cleaned = String(str).replace(/[₹,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function isDash(v) {
  return !v || /^[-—–]$/.test(v.trim());
}

// ─── Exported: detectBank ───────────────────────────────────

export function detectBank(text) {
  const lower = String(text).toLowerCase();
  if (lower.includes("state bank of india") || lower.includes("sbi")) return "sbi";
  if (lower.includes("hdfc")) return "hdfc";
  if (lower.includes("icici")) return "icici";
  if (lower.includes("axis")) return "axis";
  if (lower.includes("kotak")) return "kotak";
  if (lower.includes("punjab national") || lower.includes("pnb")) return "pnb";
  if (lower.includes("bank of baroda")) return "bob";
  if (lower.includes("canara")) return "canara";
  return "unknown";
}

// ─── Regex Patterns ─────────────────────────────────────────

// Amount: integer or decimal, optional commas  e.g. 12000 | 1,00,000 | 5000.00
const AMT = "[\\d,]+(?:\\.\\d+)?";
const DASH = "[-—–]";

// Full row: DATE  DESC  (AMT|DASH)  (AMT|DASH)  AMT
const FULL_ROW = new RegExp(
  `^(\\d{2}[/\\-]\\d{2}[/\\-]\\d{4})\\s+(.+?)\\s+(${AMT}|${DASH})\\s+(${AMT}|${DASH})\\s+(${AMT})$`
);

// Short row: DATE  DESC  AMT  AMT  (one column missing)
const SHORT_ROW = new RegExp(
  `^(\\d{2}[/\\-]\\d{2}[/\\-]\\d{4})\\s+(.+?)\\s+(${AMT})\\s+(${AMT})$`
);

const DATE_START = /^(\d{2}[\/\-]\d{2}[\/\-]\d{4})/;
const CREDIT_WORDS = /credit|salary|interest|refund|reversal|deposit|received/i;
const SKIP_LINE = /^(date\s|description|particulars|narration|sl\.?\s*no|total|subtotal|page\s)/i;

// ─── Core Parser ────────────────────────────────────────────

/**
 * parseTransactions — accepts a string OR array of lines.
 * UploadForm passes a raw string; parseBankStatement passes string[].
 */
export function parseTransactions(input) {
  // Normalise: if string → split into lines
  const lines = Array.isArray(input)
    ? input
    : String(input).split(/\r?\n/);

  const transactions = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (SKIP_LINE.test(line)) continue;

    // ── Pattern A: Full 5-column row ─────────────────────
    // "01/05/2026 Salary Credit - 12000 112000"
    // "01/05/2026 UPI Swiggy 120 - 136880"
    const matchA = line.match(FULL_ROW);
    if (matchA) {
      const [, date, description, rawDebit, rawCredit, rawBalance] = matchA;
      transactions.push({
        date: date.replace(/-/g, "/"),
        description: description.trim(),
        debit: isDash(rawDebit) ? 0 : parseAmount(rawDebit),
        credit: isDash(rawCredit) ? 0 : parseAmount(rawCredit),
        balance: parseAmount(rawBalance),
      });
      continue;
    }

    // ── Pattern B: Short 4-column row ────────────────────
    // "01/05/2026 Salary Credit 12000 112000"  (no dash column)
    const matchB = line.match(SHORT_ROW);
    if (matchB) {
      const [, date, description, rawAmount, rawBalance] = matchB;
      const amount = parseAmount(rawAmount);
      const isCredit = CREDIT_WORDS.test(description);
      transactions.push({
        date: date.replace(/-/g, "/"),
        description: description.trim(),
        debit: isCredit ? 0 : amount,
        credit: isCredit ? amount : 0,
        balance: parseAmount(rawBalance),
      });
      continue;
    }

    // ── Pattern C: Fallback ───────────────────────────────
    const dateMatch = line.match(DATE_START);
    if (dateMatch) {
      const re = new RegExp(`(${AMT})`, "g");
      const numbers = [];
      let m;
      while ((m = re.exec(line)) !== null) numbers.push(parseAmount(m[1]));

      const description = line
        .replace(DATE_START, "")
        .replace(new RegExp(`(${AMT})`, "g"), "")
        .replace(/[-—–]/g, "")
        .trim();

      if (description && numbers.length >= 2) {
        let debit = 0, credit = 0;
        if (numbers.length === 2) {
          if (CREDIT_WORDS.test(description)) credit = numbers[0];
          else debit = numbers[0];
        } else {
          debit = numbers[0];
          credit = numbers[1];
        }
        transactions.push({
          date: dateMatch[1].replace(/-/g, "/"),
          description,
          debit,
          credit,
          balance: numbers[numbers.length - 1],
        });
      }
    }
  }

  return transactions;
}

// ─── PDF Extraction (used by parseBankStatement) ────────────

export async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allLines = [];
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const items = [...content.items].sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    const lineMap = new Map();
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push(item.str);
    }

    const pageLines = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, parts]) => parts.join(" ").trim())
      .filter(Boolean);

    allLines.push(...pageLines);
    fullText += pageLines.join("\n") + "\n";
  }

  return { text: fullText, lines: allLines, bank: detectBank(fullText) };
}

// ─── Main Export ────────────────────────────────────────────

export async function parseBankStatement(file) {
  const { lines, bank } = await extractPDFText(file);
  const transactions = parseTransactions(lines);
  return { transactions, bank };
}
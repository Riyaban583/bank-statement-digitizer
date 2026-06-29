/**
 * parseSBI.js
 * Parser for State Bank of India account statements.
 *
 * SBI digital statement column layout (space-separated after PDF extraction):
 *   Txn Date | Value Date | Description | Ref No./Cheque No. | Debit | Credit | Balance
 *
 * Rows span multiple lines when the description is long.
 * Debit and Credit columns are explicitly labelled — never inferred from description.
 */

import {
  buildTransaction,
  extractAllAmounts,
  groupTransactionLines,
  isDate,
  parseAmount,
  shouldSkipLine,
  tokenise,
} from "./parserUtils.js";

// SBI statements label balance with "Dr" or "Cr" suffix after the balance amount
// e.g. "12,345.67 Cr" — we strip that suffix before parsing.
const BALANCE_SUFFIX_RE = /\b(cr|dr)\s*$/i;

/**
 * @param {string} fullText
 * @returns {Array<{ date: string, description: string, debit: number, credit: number, balance: number|null }>}
 */
export function parseSBI(fullText) {
  const lines = fullText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !shouldSkipLine(l));

  const groups = groupTransactionLines(lines);
  const transactions = [];

  for (const group of groups) {
    const firstLine = group[0];
    const tokens = tokenise(firstLine);

    if (!isDate(tokens[0])) continue;

    // SBI has Txn Date then Value Date as the first two tokens
    const txnDate = tokens[0];
    // Value date may or may not be present; skip it if found
    const hasValueDate = tokens[1] && isDate(tokens[1]);
    const descStart = hasValueDate ? 2 : 1;

    // Collect all amounts from the line
    const amounts = extractAllAmounts(firstLine);
    // SBI format: [...description...] [Debit] [Credit] [Balance]
    // Some rows have only one of Debit/Credit, so amounts.length can be 2 or 3.

    if (amounts.length < 2) continue;

    const balance = parseBalanceToken(amounts[amounts.length - 1], firstLine);
    let debit = 0;
    let credit = 0;

    if (amounts.length >= 3) {
      // amounts[-3] = debit column, amounts[-2] = credit column, amounts[-1] = balance
      // One of debit/credit will be 0 in the original PDF — but since pdf.js merges
      // columns into text, we use the CR/DR suffix on the balance to determine direction.
      const thirdLast = amounts[amounts.length - 3];
      const secondLast = amounts[amounts.length - 2];

      if (isCrBalance(firstLine)) {
        // Credit transaction — credit column has the value, debit column is blank
        credit = thirdLast;
      } else {
        debit = thirdLast;
      }
      // secondLast is the other column (0 in the original, but pdf.js may include it)
      // We set it explicitly based on direction above — do not use secondLast.
    } else {
      // Only 2 amounts: txnAmount + balance
      const txnAmount = amounts[0];
      if (isCrBalance(firstLine)) {
        credit = txnAmount;
      } else {
        debit = txnAmount;
      }
    }

    // Description: tokens between date(s) and first number
    const amountPattern = /[\d,]+\.\d{2}/;
    const afterDates = tokens.slice(descStart).join(" ");
    const descRaw = afterDates.split(amountPattern)[0].trim();

    const contLines = group.slice(1).map((l) =>
      l.replace(/[\d,]+\.\d{2}/g, "").replace(BALANCE_SUFFIX_RE, "").trim()
    );
    const description = [descRaw, ...contLines]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    transactions.push(
      buildTransaction({ date: txnDate, description, debit, credit, balance })
    );
  }

  return transactions;
}

function isCrBalance(line) {
  // SBI appends "Cr" after the closing balance on credit rows
  return /\bCr\s*$/.test(line.trim());
}

function parseBalanceToken(amount, line) {
  // Balance is always the last amount on the line — already extracted by extractAllAmounts
  return amount;
}

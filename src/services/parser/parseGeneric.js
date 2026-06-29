/**
 * parseGeneric.js
 * Fallback parser for digital bank statements from unrecognised banks.
 *
 * Strategy:
 * 1. Walk lines; identify rows that START with a date token.
 * 2. Collect any continuation lines (no leading date) into the description.
 * 3. Extract rightmost amounts — last column = balance, second-last = transaction amount.
 * 4. Determine debit/credit from CR/DR markers if present; otherwise fall back
 *    to balance delta (balance goes up → credit, goes down → debit).
 *    If balance is unavailable, put the amount into debit and leave credit=0
 *    so the data is never silently wrong.
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

const CR_MARKER = /\b(cr|credit)\b/i;
const DR_MARKER = /\b(dr|debit)\b/i;

/**
 * @param {string} fullText
 * @returns {Array<{ date: string, description: string, debit: number, credit: number, balance: number|null }>}
 */
export function parseGeneric(fullText) {
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

    // --- date ---
    const date = tokens[0];

    // --- amounts from the first line ---
    const amounts = extractAllAmounts(firstLine);
    if (amounts.length === 0) continue;

    // --- balance: rightmost amount ---
    const balance = amounts.length >= 2 ? amounts[amounts.length - 1] : null;
    const txnAmount =
      amounts.length >= 2
        ? amounts[amounts.length - 2]
        : amounts[amounts.length - 1];

    // --- description: everything between date and the first number ---
    const amountPattern = /[\d,]+\.\d{2}/;
    const afterDate = firstLine.slice(tokens[0].length).trim();
    const descRaw = afterDate.split(amountPattern)[0].trim();

    // Append continuation lines (they are pure narration — no amounts)
    const contLines = group.slice(1).map((l) => {
      // Strip any trailing amounts that may repeat balance
      return l.replace(/[\d,]+\.\d{2}/g, "").trim();
    });
    const description = [descRaw, ...contLines]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    // --- type determination ---
    const lineUpper = firstLine;
    const hasCr = CR_MARKER.test(lineUpper);
    const hasDr = DR_MARKER.test(lineUpper);

    let debit = 0;
    let credit = 0;

    if (hasCr && !hasDr) {
      credit = txnAmount;
    } else if (hasDr && !hasCr) {
      debit = txnAmount;
    } else if (balance !== null && transactions.length > 0) {
      const prevBalance = transactions[transactions.length - 1].balance;
      if (prevBalance !== null) {
        if (balance > prevBalance) {
          credit = txnAmount;
        } else {
          debit = txnAmount;
        }
      } else {
        debit = txnAmount;
      }
    } else {
      debit = txnAmount;
    }

    transactions.push(
      buildTransaction({ date, description, debit, credit, balance })
    );
  }

  return transactions;
}

/**
 * parseIDFC.js
 * Parser for IDFC FIRST Bank account statements.
 *
 * IDFC FIRST digital statement column layout:
 *   Transaction Date | Transaction Remarks | Withdrawal Amount (Dr) | Deposit Amount (Cr) | Balance
 *
 * "Withdrawal" → debit; "Deposit" → credit.
 * No cheque / ref number column — description goes right up to the first amount.
 */

import {
  buildTransaction,
  extractAllAmounts,
  groupTransactionLines,
  isDate,
  shouldSkipLine,
  tokenise,
} from "./parserUtils.js";

/**
 * @param {string} fullText
 * @returns {Array<{ date: string, description: string, debit: number, credit: number, balance: number|null }>}
 */
export function parseIDFC(fullText) {
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

    const txnDate = tokens[0];
    const amounts = extractAllAmounts(firstLine);

    if (amounts.length < 2) continue;

    const balance = amounts[amounts.length - 1];
    let debit = 0;
    let credit = 0;

    if (amounts.length >= 3) {
      debit = amounts[amounts.length - 3];
      credit = amounts[amounts.length - 2];
    } else {
      const txnAmount = amounts[0];
      const prevBalance =
        transactions.length > 0
          ? transactions[transactions.length - 1].balance
          : null;
      if (prevBalance !== null) {
        if (balance > prevBalance) {
          credit = txnAmount;
        } else {
          debit = txnAmount;
        }
      } else {
        debit = txnAmount;
      }
    }

    const amtPattern = /[\d,]+\.\d{2}/;
    const afterDate = firstLine.slice(tokens[0].length).trim();
    const descRaw = afterDate.split(amtPattern)[0].trim();

    const contLines = group.slice(1).map((l) =>
      l.replace(/[\d,]+\.\d{2}/g, "").trim()
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

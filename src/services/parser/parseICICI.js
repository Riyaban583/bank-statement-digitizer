/**
 * parseICICI.js
 * Parser for ICICI Bank account statements.
 *
 * ICICI digital statement column layout:
 *   S No. | Transaction Date | Value Date | Description | Remarks | Withdrawal (Dr) | Deposit (Cr) | Balance
 *
 * Withdrawal → debit; Deposit → credit.
 * The serial number at the start of the row is numeric and must be ignored.
 * Date token comes after the serial number.
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

const SERIAL_RE = /^\d{1,5}$/;

/**
 * @param {string} fullText
 * @returns {Array<{ date: string, description: string, debit: number, credit: number, balance: number|null }>}
 */
export function parseICICI(fullText) {
  const lines = fullText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !shouldSkipLine(l));

  const groups = groupTransactionLines(lines);
  const transactions = [];

  for (const group of groups) {
    const firstLine = group[0];
    const tokens = tokenise(firstLine);

    // Token[0] may be a serial number; skip it if so
    let dateIdx = 0;
    if (SERIAL_RE.test(tokens[0]) && isDate(tokens[1])) {
      dateIdx = 1;
    }

    if (!isDate(tokens[dateIdx])) continue;

    const txnDate = tokens[dateIdx];
    const amounts = extractAllAmounts(firstLine);

    // ICICI: [Withdrawal] [Deposit] [Balance] — one of the first two may be absent
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
    const afterDate = tokens.slice(dateIdx + 1).join(" ");
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

/**
 * parseHDFC.js
 * Parser for HDFC Bank account statements.
 *
 * HDFC digital statement column layout:
 *   Date | Narration | Chq./Ref.No. | Value Dt | Withdrawal Amt. | Deposit Amt. | Closing Balance
 *
 * "Withdrawal" maps to debit; "Deposit" maps to credit.
 * Empty withdrawal/deposit columns still appear in PDF text as spaces —
 * so each data row always has at least 2 amounts (one txn + balance).
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

/**
 * @param {string} fullText
 * @returns {Array<{ date: string, description: string, debit: number, credit: number, balance: number|null }>}
 */
export function parseHDFC(fullText) {
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

    // HDFC row: ... [Withdrawal] [Deposit] [Balance]
    // One of Withdrawal/Deposit is blank (0.00 not printed), so we get either:
    //   2 amounts: [txnAmt, balance]
    //   3 amounts: [withdrawal, deposit, balance]  (rare edge)
    if (amounts.length < 2) continue;

    const balance = amounts[amounts.length - 1];
    let debit = 0;
    let credit = 0;

    if (amounts.length >= 3) {
      // withdrawal=amounts[-3], deposit=amounts[-2], balance=amounts[-1]
      debit = amounts[amounts.length - 3];
      credit = amounts[amounts.length - 2];
    } else {
      // Only one txn amount — determine direction from balance delta
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

    // Description: narration sits between date token and first amount
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

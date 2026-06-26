// Reconciliation logic shared by the Transactions page (status column + Reconciliation tab).
// A transaction matches an invoice when the invoice's customer name appears in the
// transaction description AND the amounts are equal.

// Lowercase, strip punctuation and collapse whitespace so "Acme Corp." and
// "ACME  CORP" compare equal.
const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Tolerate paise-level rounding differences between invoice and bank amounts.
const amountsMatch = (a, b) => Math.abs(Number(a) - Number(b)) <= 0.01;

export const isMatched = (invoice, txn) => {
  if (!invoice || !txn) return false;

  const txnAmount = Number(txn.credit || txn.debit || 0);
  if (!amountsMatch(txnAmount, invoice.invoiceAmount)) return false;

  const desc = normalize(txn.description);
  if (!desc) return false;

  const name = normalize(invoice.customerName);
  const number = normalize(invoice.invoiceNumber);

  // Name match: the full name appears, or every meaningful word does
  // (handles re-ordered / abbreviated names in bank descriptions).
  const tokens = name.split(" ").filter((t) => t.length > 2);
  const nameMatch =
    name &&
    (desc.includes(name) ||
      (tokens.length > 0 && tokens.every((t) => desc.includes(t))));

  // Or the invoice number is referenced in the description.
  const numberMatch = number && desc.includes(number);

  return Boolean(nameMatch || numberMatch);
};

export const isTxnMatched = (txn, invoices) =>
  invoices.some((invoice) => isMatched(invoice, txn));

export const getMatchedTransaction = (invoice, transactions) =>
  transactions.find((txn) => isMatched(invoice, txn));

// One pass that returns every reconciliation slice the UI needs.
export const buildReconciliation = (transactions, invoices) => {
  const matchedTransactions = transactions.filter((txn) =>
    isTxnMatched(txn, invoices)
  );
  const unmatchedTransactions = transactions.filter(
    (txn) => !isTxnMatched(txn, invoices)
  );

  const matchedInvoices = invoices.filter((invoice) =>
    transactions.some((txn) => isMatched(invoice, txn))
  );
  const unmatchedInvoices = invoices.filter(
    (invoice) => !transactions.some((txn) => isMatched(invoice, txn))
  );

  return {
    matchedTransactions,
    unmatchedTransactions,
    matchedInvoices,
    unmatchedInvoices,
  };
};

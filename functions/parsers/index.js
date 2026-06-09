const { parseSBI } = require("./sbi");
const { parseHDFC } = require("./hdfc");
const { parseICICI } = require("./icici");

function normalizeTransactions(
  transactions
) {
  return transactions.map(
    (txn) => ({
      date: txn.date,

      description:
        txn.description,

      amount:
        txn.credit ||
        txn.debit ||
        "",

      type: txn.credit
        ? "credit"
        : "debit",

      balance:
        txn.balance,
    })
  );
}

function parseStatement(
  text,
  bank
) {
  switch (
    bank.toLowerCase()
  ) {
    case "sbi":
      return normalizeTransactions(
        parseSBI(text)
      );

    case "hdfc":
      return normalizeTransactions(
        parseHDFC(text)
      );

    case "icici":
      return normalizeTransactions(
        parseICICI(text)
      );

    default:
      throw new Error(
        "UNSUPPORTED_BANK"
      );
  }
}

module.exports = {
  parseSBI,
  parseHDFC,
  parseICICI,
  parseStatement,
};


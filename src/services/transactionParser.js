export function parseTransactions(text) {
  const transactions = [];

  const regex =
    /(\d{2}\/\d{2}\/\d{4})\s*\|\s*(.*?)\s*\|\s*([\d.-]+|-)\s*\|\s*([\d.-]+|-)\s*\|\s*([\d.-]+)/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    transactions.push({
      date: match[1],
      description: match[2],
      debit: match[3] === "-" ? "" : match[3],
      credit: match[4] === "-" ? "" : match[4],
      balance: match[5],
    });
  }

  return transactions;
}
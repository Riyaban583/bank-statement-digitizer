export function parseTransactions(text) {
  const transactions = [];

  // Format 1:
  // 01/05/2026 | Opening Balance | - | - | 10000.00

  const pipeRegex =
    /(\d{2}\/\d{2}\/\d{4})\s*\|\s*(.*?)\s*\|\s*([\d.-]+|-)\s*\|\s*([\d.-]+|-)\s*\|\s*([\d.-]+)/g;

  let match;

  while (
    (match = pipeRegex.exec(text)) !== null
  ) {
    transactions.push({
      date: match[1],
      description: match[2].trim(),
      debit:
        match[3] === "-"
          ? ""
          : match[3],
      credit:
        match[4] === "-"
          ? ""
          : match[4],
      balance: match[5],
    });
  }

  // Format 2:
  // 01/05/2026 Opening Balance - - 10000

  if (transactions.length === 0) {
    const normalRegex =
      /(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([\d.-]+|-)\s+([\d.-]+|-)\s+([\d.-]+)/g;

    while (
      (match = normalRegex.exec(text)) !== null
    ) {
      transactions.push({
        date: match[1],
        description:
          match[2].trim(),
        debit:
          match[3] === "-"
            ? ""
            : match[3],
        credit:
          match[4] === "-"
            ? ""
            : match[4],
        balance: match[5],
      });
    }
  }

  return transactions;
}
function parseHDFC(text) {
  const transactions = [];

  const lines = text.split("\n");

  const regex =
    /(\d{2}-\d{2}-\d{4})\s+(.*?)\s+([\d,.]*)\s+([\d,.]*)\s+([\d,.]+)/;

  for (const line of lines) {
    const match = line.match(regex);

    if (!match) continue;

    const [
      ,
      date,
      description,
      debit,
      credit,
      balance,
    ] = match;

    transactions.push({
      date,
      description,
      debit,
      credit,
      balance,
    });
  }

  return transactions;
}

module.exports = {
  parseHDFC,
};


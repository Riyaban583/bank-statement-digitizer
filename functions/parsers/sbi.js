function parseSBI(text) {
  const transactions = [];

  const lines = text.split("\n");

  const regex =
    /(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([\d,.]+)\s+(Cr|Dr)\s+([\d,.]+)/i;

  for (const line of lines) {
    const match = line.match(regex);

    if (!match) continue;

    const [
      ,
      date,
      description,
      amount,
      marker,
      balance,
    ] = match;

    transactions.push({
      date,
      description,
      debit:
        marker.toUpperCase() === "DR"
          ? amount
          : "",
      credit:
        marker.toUpperCase() === "CR"
          ? amount
          : "",
      balance,
    });
  }

  return transactions;
}

module.exports = {
  parseSBI,
};

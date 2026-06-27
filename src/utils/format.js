// Display helpers used across pages.

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

// Formats a number as Indian rupees, e.g. 1234.5 -> "₹1,234.50".
export const formatCurrency = (value) => {
  if (
    value === "" ||
    value === "-" ||
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  const amount = Number(value);

  if (isNaN(amount)) {
    return "—";
  }

  return inr.format(amount);
};

// Converts a "DD/MM/YYYY" statement date to "YYYY-MM-DD" for date comparisons.
export const toISODate = (date) =>
  date ? date.split("/").reverse().join("-") : "";

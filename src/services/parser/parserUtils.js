/**
 * parserUtils.js
 * Shared utility functions used by all bank-specific parsers.
 * No regex duplication — every pattern lives here once.
 */

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const DATE_PATTERNS = [
  // DD/MM/YYYY or DD-MM-YYYY
  {
    re: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    parse: (m) => `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`,
  },
  // DD/MM/YY or DD-MM-YY
  {
    re: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,
    parse: (m) => {
      const year = parseInt(m[3], 10) >= 50 ? `19${m[3]}` : `20${m[3]}`;
      return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    },
  },
  // YYYY-MM-DD
  {
    re: /^(\d{4})-(\d{2})-(\d{2})$/,
    parse: (m) => `${m[1]}-${m[2]}-${m[3]}`,
  },
  // DD Mon YYYY  e.g. "15 Jan 2024"
  {
    re: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i,
    parse: (m) => {
      const months = {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
      };
      return `${m[3]}-${months[m[2].toLowerCase()]}-${m[1].padStart(2, "0")}`;
    },
  },
  // DD-Mon-YYYY  e.g. "15-Jan-2024"
  {
    re: /^(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})$/i,
    parse: (m) => {
      const months = {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
      };
      return `${m[3]}-${months[m[2].toLowerCase()]}-${m[1].padStart(2, "0")}`;
    },
  },
];

/**
 * Normalise a raw date string to ISO YYYY-MM-DD.
 * Returns the original string if no pattern matches (never returns null/undefined).
 * @param {string} raw
 * @returns {string}
 */
export function normaliseDate(raw) {
  if (!raw) return "";
  const trimmed = raw.trim();
  for (const { re, parse } of DATE_PATTERNS) {
    const m = trimmed.match(re);
    if (m) return parse(m);
  }
  return trimmed;
}

// ---------------------------------------------------------------------------
// Amount helpers
// ---------------------------------------------------------------------------

/**
 * Parse a raw amount string (may contain commas) to a number.
 * Returns 0 for empty/invalid strings — never returns NaN.
 * @param {string} raw
 * @returns {number}
 */
export function parseAmount(raw) {
  if (!raw || raw.trim() === "" || raw.trim() === "-") return 0;
  const cleaned = raw.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Extract the first valid amount from a string.
 * @param {string} str
 * @returns {number}
 */
export function extractFirstAmount(str) {
  const m = str.match(/[\d,]+\.\d{2}/);
  return m ? parseAmount(m[0]) : 0;
}

/**
 * Extract all valid amounts from a string.
 * @param {string} str
 * @returns {number[]}
 */
export function extractAllAmounts(str) {
  const matches = str.match(/[\d,]+\.\d{2}/g) || [];
  return matches.map(parseAmount).filter((n) => n > 0);
}

// ---------------------------------------------------------------------------
// Line / column helpers
// ---------------------------------------------------------------------------

/**
 * Split a line into tokens by one-or-more whitespace characters.
 * @param {string} line
 * @returns {string[]}
 */
export function tokenise(line) {
  return line.trim().split(/\s+/).filter(Boolean);
}

/**
 * Check whether a string is a recognisable date.
 * @param {string} str
 * @returns {boolean}
 */
export function isDate(str) {
  return DATE_PATTERNS.some(({ re }) => re.test(str.trim()));
}

/**
 * Check whether a string looks like a currency amount.
 * @param {string} str
 * @returns {boolean}
 */
export function isAmount(str) {
  return /^[\d,]+\.\d{2}$/.test(str.trim());
}

// ---------------------------------------------------------------------------
// Line-grouping helpers for multi-line narration statements
// ---------------------------------------------------------------------------

/**
 * Given an array of line strings, group consecutive non-date lines that
 * follow a date-starting line into a single transaction block.
 * Useful for parsers where narration may spill onto the next line.
 *
 * @param {string[]} lines
 * @returns {string[][]} Array of grouped-line arrays, each group starting with a date line
 */
export function groupTransactionLines(lines) {
  const groups = [];
  let current = null;

  for (const line of lines) {
    const tokens = tokenise(line);
    if (tokens.length === 0) continue;

    if (isDate(tokens[0])) {
      if (current) groups.push(current);
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }
  if (current) groups.push(current);
  return groups;
}

// ---------------------------------------------------------------------------
// Transaction builder
// ---------------------------------------------------------------------------

/**
 * Build a canonical transaction object.
 * Guarantees the exact shape required by Firestore.
 *
 * @param {object} params
 * @param {string} params.date         - raw date string (will be normalised)
 * @param {string} params.description  - narration / description text
 * @param {number} params.debit        - debit amount (0 if credit)
 * @param {number} params.credit       - credit amount (0 if debit)
 * @param {number|null} params.balance - closing balance for the row (null if unknown)
 * @returns {{ date: string, description: string, debit: number, credit: number, balance: number|null }}
 */
export function buildTransaction({ date, description, debit, credit, balance }) {
  return {
    date: normaliseDate(date),
    description: (description || "").trim(),
    debit: typeof debit === "number" && !isNaN(debit) ? debit : 0,
    credit: typeof credit === "number" && !isNaN(credit) ? credit : 0,
    balance: typeof balance === "number" && !isNaN(balance) ? balance : null,
  };
}

// ---------------------------------------------------------------------------
// Header / skip-line detection
// ---------------------------------------------------------------------------

const SKIP_PATTERNS = [
  /^\s*$/,                        // blank
  /opening\s+balance/i,
  /closing\s+balance/i,
  /brought\s+forward/i,
  /carried\s+forward/i,
  /date\s+narration/i,
  /date\s+description/i,
  /date\s+particulars/i,
  /transaction\s+date/i,
  /value\s+date/i,
  /sl\.?\s*no/i,
  /sr\.?\s*no/i,
  /chq\.?\s*no/i,
  /page\s+\d+/i,
  /statement\s+of\s+account/i,
  /account\s+statement/i,
  /account\s+no/i,
  /account\s+number/i,
  /ifsc/i,
  /branch/i,
  /customer\s+name/i,
  /period\s*:/i,
  /from\s*:/i,
  /to\s*:/i,
];

/**
 * Return true if the line should be skipped (header, footer, blank, etc.)
 * @param {string} line
 * @returns {boolean}
 */
export function shouldSkipLine(line) {
  return SKIP_PATTERNS.some((re) => re.test(line));
}

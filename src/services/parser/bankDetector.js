/**
 * bankDetector.js
 * Identifies the issuing bank from extracted PDF text.
 * Detection is keyword-based — no guessing from transaction descriptions.
 */

const BANK_SIGNATURES = [
  {
    id: "SBI",
    patterns: [
      /state\s+bank\s+of\s+india/i,
      /\bsbi\b/i,
      /onlinesbi/i,
    ],
  },
  {
    id: "HDFC",
    patterns: [
      /hdfc\s+bank/i,
      /hdfc bank ltd/i,
    ],
  },
  {
    id: "ICICI",
    patterns: [
      /icici\s+bank/i,
    ],
  },
  {
    id: "AXIS",
    patterns: [
      /axis\s+bank/i,
    ],
  },
  {
    id: "PNB",
    patterns: [
      /punjab\s+national\s+bank/i,
      /\bpnb\b/i,
    ],
  },
  {
    id: "KOTAK",
    patterns: [
      /kotak\s+mahindra\s+bank/i,
      /kotak\s+bank/i,
    ],
  },
  {
    id: "BOB",
    patterns: [
      /bank\s+of\s+baroda/i,
      /\bbob\b/i,
    ],
  },
  {
    id: "CANARA",
    patterns: [
      /canara\s+bank/i,
    ],
  },
  {
    id: "UNION",
    patterns: [
      /union\s+bank\s+of\s+india/i,
      /union\s+bank/i,
    ],
  },
  {
    id: "IDFC",
    patterns: [
      /idfc\s+first\s+bank/i,
      /idfc\s+bank/i,
    ],
  },
  {
    id: "INDUSIND",
    patterns: [
      /indusind\s+bank/i,
    ],
  },
  {
    id: "AU",
    patterns: [
      /au\s+small\s+finance\s+bank/i,
      /au\s+bank/i,
    ],
  },
];

/**
 * Detect the bank from full extracted PDF text.
 * Searches only the first 3000 characters (header region) for performance.
 *
 * @param {string} fullText - full text extracted from the PDF
 * @returns {string} Bank ID (e.g. "SBI", "HDFC") or "GENERIC" if unrecognised
 */
export function detectBank(fullText) {
  const header = fullText.slice(0, 3000);

  for (const bank of BANK_SIGNATURES) {
    for (const pattern of bank.patterns) {
      if (pattern.test(header)) {
        return bank.id;
      }
    }
  }

  return "GENERIC";
}

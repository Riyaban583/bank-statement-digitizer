const { parseSBI } = require("./sbi");
const { parseHDFC } = require("./hdfc");
const { parseICICI } = require("./icici");

function parseStatement(text, bank) {
  switch (bank.toLowerCase()) {
    case "sbi":
      return parseSBI(text);

    case "hdfc":
      return parseHDFC(text);

    case "icici":
      return parseICICI(text);

    default:
      throw new Error("UNSUPPORTED_BANK");
  }
}

module.exports = {
  parseSBI,
  parseHDFC,
  parseICICI,
  parseStatement,
};


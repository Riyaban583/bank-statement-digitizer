import {
  describe,
  it,
  expect,
} from "vitest";

const {
  parseHDFC,
} = require("../parsers/hdfc");

describe(
  "HDFC Parser",
  () => {
    it(
      "should parse HDFC transaction",
      () => {
        const text = `
01-05-2026 Salary Credit 0 50000 60000
`;

        const result =
          parseHDFC(text);

        expect(
          result.length
        ).toBe(1);

        expect(
          result[0]
            .description
        ).toBe(
          "Salary Credit"
        );

        expect(
          result[0].credit
        ).toBe("50000");

        expect(
          result[0].balance
        ).toBe("60000");
      }
    );
  }
);
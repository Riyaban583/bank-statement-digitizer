import {
  describe,
  it,
  expect,
} from "vitest";

const {
  parseICICI,
} = require("../parsers/icici");

describe(
  "ICICI Parser",
  () => {
    it(
      "should parse ICICI transaction",
      () => {
        const text = `
01/05/2026 Salary Credit 0 50000 60000
`;

        const result =
          parseICICI(text);

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
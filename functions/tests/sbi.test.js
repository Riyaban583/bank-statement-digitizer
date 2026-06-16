import {
  describe,
  it,
  expect,
} from "vitest";

const {
  parseSBI,
} = require("../parsers/sbi");

describe(
  "SBI Parser",
  () => {
    it(
      "should parse SBI transaction",
      () => {
        const text = `
01/05/2026 Salary Credit 50000 Cr 60000
`;

        const result =
          parseSBI(text);

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
      }
    );
  }
);
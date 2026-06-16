import {
  describe,
  it,
  expect,
} from "vitest";

const {
  parseStatement,
} = require(
  "../parsers"
);

describe(
  "parseStatement Smoke Test",
  () => {
    it(
      "should parse SBI statement",
      () => {
        const text =
          "01/05/2026 Salary Credit 50000 Cr 60000";

        const result =
          parseStatement(
            text,
            "sbi"
          );

        expect(
          result.length
        ).toBe(1);
      }
    );

    it(
      "should throw for unsupported bank",
      () => {
        expect(() =>
          parseStatement(
            "",
            "axis"
          )
        ).toThrow(
          "UNSUPPORTED_BANK"
        );
      }
    );
  }
);
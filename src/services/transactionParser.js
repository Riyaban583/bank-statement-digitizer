import { parseStatement } from "./parser/index.js";

export async function parseBankStatement(pdfDoc) {
  return await parseStatement(pdfDoc);
}
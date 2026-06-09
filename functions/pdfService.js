const pdfjsLib = require("pdfjs-dist");

async function unlockPdf(buffer, password = "") {
  try {
    const pdf = await pdfjsLib.getDocument({
      data: buffer,
      password,
    }).promise;

    return pdf;
  } catch (error) {
    if (error.name === "PasswordException") {
      throw new Error("WRONG_PASSWORD");
    }

    if (error.name === "InvalidPDFException") {
      throw new Error("CORRUPT_PDF");
    }

    throw error;
  }
}

async function getPdfItems(pdf) {
  const allPages = [];

  for (
    let pageNum = 1;
    pageNum <= pdf.numPages;
    pageNum++
  ) {
    const page = await pdf.getPage(pageNum);

    const textContent =
      await page.getTextContent();

    const items = textContent.items.map(
      (item) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
      })
    );

    allPages.push({
      page: pageNum,
      items,
    });
  }

  return allPages;
}

function groupItemsIntoRows(items) {
  const rows = {};

  for (const item of items) {
    const y = Math.round(item.y);

    if (!rows[y]) {
      rows[y] = [];
    }

    rows[y].push(item);
  }

  return Object.values(rows).map((row) =>
    row
      .sort((a, b) => a.x - b.x)
      .map((item) => item.text)
      .join(" ")
  );
}

function detectBank(text) {
  const content = text.toUpperCase();

  if (
    content.includes(
      "STATE BANK OF INDIA"
    )
  ) {
    return "sbi";
  }

  if (
    content.includes("HDFC BANK")
  ) {
    return "hdfc";
  }

  if (
    content.includes("ICICI BANK")
  ) {
    return "icici";
  }

  throw new Error(
    "UNSUPPORTED_BANK"
  );
}

module.exports = {
  unlockPdf,
  getPdfItems,
  groupItemsIntoRows,
  detectBank,
};
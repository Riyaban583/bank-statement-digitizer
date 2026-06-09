const fs = require("fs");
const {
  unlockPdf,
  getPdfItems,
} = require("./pdfService");

async function run() {
  const buffer = fs.readFileSync(
    "../samples/sbi-sample.pdf"
  );

  const pdf = await unlockPdf(buffer);

  const pages = await getPdfItems(pdf);

  console.log(
    JSON.stringify(
      pages,
      null,
      2
    )
  );
}

run().catch(console.error);
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { parseTransactions } from "../services/transactionParser";

// PDF Worker Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [transactions, setTransactions] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    console.log("File Name:", selectedFile.name);
    console.log("File Size:", selectedFile.size);
    console.log("File Type:", selectedFile.type);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password,
      }).promise;

      console.log("PDF Loaded Successfully");
      console.log("Total Pages:", pdf.numPages);

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item) => item.str)
          .join(" ");

        fullText += pageText + "\n";
      }

      console.log("PDF TEXT:");
      console.log(fullText);

      setPdfText(fullText);

      const parsedTransactions =
        parseTransactions(fullText);

      setTransactions(parsedTransactions);

      console.log("Transactions:");
      console.log(parsedTransactions);

      alert(
        `PDF Loaded Successfully (${pdf.numPages} pages)`
      );
    } catch (error) {
      console.error("PDF Error:", error);
      alert(
        "Failed to open PDF. Check password."
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">
        Upload Bank Statement
      </h1>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Select PDF
        </label>

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          PDF Password
        </label>

        <input
          type="password"
          placeholder="Enter PDF Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload & Parse
      </button>

      {/* Selected File */}
      {file && (
        <p className="mt-4 text-green-600">
          Selected: {file.name}
        </p>
      )}

      {/* PDF Text Preview */}
      {pdfText && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">
            Extracted Text Preview
          </h3>

          <textarea
            value={pdfText}
            readOnly
            rows={10}
            className="w-full border p-3 rounded"
          />
        </div>
      )}

      {/* Transaction Table */}
      {transactions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">
            Parsed Transactions
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">
                    Date
                  </th>
                  <th className="border p-2">
                    Description
                  </th>
                  <th className="border p-2">
                    Debit
                  </th>
                  <th className="border p-2">
                    Credit
                  </th>
                  <th className="border p-2">
                    Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (txn, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        {txn.date}
                      </td>

                      <td className="border p-2">
                        {txn.description}
                      </td>

                      <td className="border p-2">
                        {txn.debit}
                      </td>

                      <td className="border p-2">
                        {txn.credit}
                      </td>

                      <td className="border p-2">
                        {txn.balance}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
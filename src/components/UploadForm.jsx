import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { parseTransactions } from "../services/transactionParser";
import {
  createStatement,
  saveTransactionsBatch,
} from "../services/firestoreService";

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

      setPdfText(fullText);

      const parsedTransactions =
        parseTransactions(fullText);

      setTransactions(parsedTransactions);

      console.log("Transactions:");
      console.log(parsedTransactions);

      console.log(
  "Transaction Count:",
  parsedTransactions.length
);

      // Save to Firestore
     // Create Statement Document
const statementId =
  await createStatement({
    bank: "sbi",
    userId: "test-user",
    transactionCount:
      parsedTransactions.length,
  });

// Save Transactions in Batch
await saveTransactionsBatch(
  parsedTransactions,
  statementId
);

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
  <div className="min-h-screen bg-slate-100 py-10 px-4">
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg mb-8">
        <h1 className="text-4xl font-bold">
          Bank Statement Digitizer
        </h1>

        <p className="mt-2 text-blue-100">
          Upload, Parse and Store Bank Transactions
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

        <label className="block text-lg font-semibold mb-3">
          Upload PDF Statement
        </label>

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full border-2 border-dashed border-blue-300 rounded-xl p-5 cursor-pointer"
        />

        {file && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-medium">
              Selected File: {file.name}
            </p>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

        <label className="block text-lg font-semibold mb-3">
          PDF Password
        </label>

        <input
          type="password"
          placeholder="Enter PDF Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition mb-8"
      >
        Upload & Parse
      </button>

      {/* Stats */}
      {transactions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Transactions
            </p>

            <h2 className="text-3xl font-bold text-blue-600">
              {transactions.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Status
            </p>

            <h2 className="text-3xl font-bold text-green-600">
              Parsed
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              File
            </p>

            <h2 className="text-lg font-bold text-purple-600 truncate">
              {file?.name}
            </h2>
          </div>

        </div>
      )}

      {/* Extracted Text */}
      {pdfText && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <h3 className="text-2xl font-bold mb-4">
            Extracted Text Preview
          </h3>

          <textarea
            value={pdfText}
            readOnly
            rows={12}
            className="w-full border border-gray-300 rounded-xl p-4"
          />
        </div>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          <div className="p-6 border-b">
            <h3 className="text-2xl font-bold">
              Parsed Transactions
            </h3>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-right">Debit</th>
                  <th className="p-4 text-right">Credit</th>
                  <th className="p-4 text-right">Balance</th>
                </tr>
              </thead>

              <tbody>

                {transactions.map((txn, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {txn.date}
                    </td>

                    <td className="p-4 font-medium">
                      {txn.description}
                    </td>

                    <td className="p-4 text-right text-red-600">
                      {txn.debit || "-"}
                    </td>

                    <td className="p-4 text-right text-green-600">
                      {txn.credit || "-"}
                    </td>

                    <td className="p-4 text-right font-semibold">
                      ₹ {txn.balance}
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>
      )}

    </div>
  </div>
);
}
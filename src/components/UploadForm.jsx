import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { parseTransactions } from "../services/transactionParser";
import { auth } from "../firebase/firebaseConfig";
import {
  createStatement,
  saveTransactionsBatch,
} from "../services/firestoreService";
import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

// PDF Worker Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
 const [, setPdfText] =
  useState("");

const [, setTransactions] =
  useState([]);
  // Future Storage Upload Progress
  const [progress, setProgress] = useState(0);

  // Future Drag & Drop
  const [dragActive, setDragActive] =
    useState(false);
    const [loading, setLoading] =
  useState(false);

  const handleFileChange = (e) => {
    const selectedFile =
      e.target.files[0];

    if (!selectedFile) return;

    // PDF Validation
    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      toast.error("Only PDF files are allowed.");
      return;
    }

    // 20 MB Validation
    if (
      selectedFile.size >
      20 * 1024 * 1024
    ) {
      toast.error("File size must be less than 20 MB.");
      return;
    }

    setFile(selectedFile);
  };
  const handleDrop = (e) => {
  e.preventDefault();
  setDragActive(false);

  const droppedFile = e.dataTransfer.files[0];

  if (!droppedFile) return;

  if (droppedFile.type !== "application/pdf") {
 toast.error("Only PDF files are allowed.");
    return;
  }

  if (droppedFile.size > 20 * 1024 * 1024) {
   toast.error("File size must be less than 20 MB.");
    return;
  }

  setFile(droppedFile);
};

const handleDragOver = (e) => {
  e.preventDefault();
  setDragActive(true);
};

const handleDragLeave = () => {
  setDragActive(false);
};

  const handleUpload = async () => {
    if (!file) {
     toast.warning(
  "Please select a PDF file"
);
      return;
    }

    try {
      setLoading(true);
      setProgress(10);

      const arrayBuffer =
        await file.arrayBuffer();

      const pdf =
        await pdfjsLib.getDocument({
          data: arrayBuffer,
          password,
        }).promise;

      console.log(
        "PDF Loaded Successfully"
      );

      console.log(
        "Total Pages:",
        pdf.numPages
      );

      setProgress(30);

      let fullText = "";

      for (
        let pageNum = 1;
        pageNum <= pdf.numPages;
        pageNum++
      ) {
        const page =
          await pdf.getPage(pageNum);

        const textContent =
          await page.getTextContent();

          if (
  textContent.items.length ===
  0
) {
  toast.warning(
    "This looks like a scanned PDF. OCR is not supported yet."
  );

  setLoading(false);
  setProgress(0);
  return;
}

        const pageText =
          textContent.items
            .map(
              (item) => item.str
            )
            .join(" ");

        fullText +=
          pageText + "\n";
      }

      setProgress(60);

      setPdfText(fullText);
      console.log(fullText);

      const parsedTransactions =
        parseTransactions(
          fullText
        );

        if (
  !parsedTransactions ||
  parsedTransactions.length === 0
) {
  setProgress(0);
   setLoading(false);
  toast.error(
    "UNSUPPORTED_BANK"
  );
  return;
}

      setTransactions(
        parsedTransactions
      );

      console.log(
        "Transactions:"
      );

      console.log(
        parsedTransactions
      );

      console.log(
        "Transaction Count:",
        parsedTransactions.length
      );

      const statementId =
        await createStatement({
          bank: "sbi",
         userId: auth.currentUser.uid,
          transactionCount:
            parsedTransactions.length,
        });

      await saveTransactionsBatch(
        parsedTransactions,
        statementId,
        auth.currentUser.uid
      );

      setProgress(100);
      setLoading(false);

     toast.success(
  `PDF Loaded Successfully (${pdf.numPages} pages)`
);

   } catch (error) {
  console.error("PDF Error:", error);

  if (
    error?.name === "PasswordException"
  ) {
    toast.error(
      "WRONG_PASSWORD"
    );
  } else if (
    error?.message?.includes(
      "Invalid PDF"
    )
  ) {
    toast.error(
      "CORRUPT_PDF"
    );
  } else {
    toast.error(
      "PARSE_FAILED"
    );
  }

  setProgress(0);
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
    <ToastContainer
  position="top-right"
  autoClose={3000}
/>
      <div className="max-w-6xl mx-auto">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg mb-8">
          <h1 className="text-4xl font-bold">
            Bank Statement
            Digitizer
          </h1>

          <p className="mt-2 text-blue-100">
            Upload, Parse and
            Store Bank
            Transactions
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

          <label className="block text-lg font-semibold mb-3">
            Upload PDF
            Statement
          </label>

         <div
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
    dragActive
      ? "border-blue-600 bg-blue-50"
      : "border-blue-300"
  }`}
>
  <p className="font-medium text-lg">
    Drag & Drop PDF Here
  </p>

  <p className="text-gray-500 my-3">
    or
  </p>

  <input
    type="file"
    accept=".pdf"
    onChange={handleFileChange}
    className="block mx-auto"
  />
</div>

          {file && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-medium">
                Selected File:
                {" "}
                {file.name}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

          <label className="block text-lg font-semibold mb-3">
            PDF Password
          </label>

          <input
            type="password"
            placeholder="Enter PDF Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
          />
        </div>

        {/* Progress Bar */}

        {progress > 0 && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-sm text-gray-600">
              {progress}%
            </p>
          </div>
        )}

        <button
  onClick={handleUpload}
  disabled={loading}
  className={`text-white font-semibold px-8 py-3 rounded-xl shadow-md transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {loading
    ? "Processing..."
    : "Upload & Parse"}
</button>
      </div>
    </div>
  );
}
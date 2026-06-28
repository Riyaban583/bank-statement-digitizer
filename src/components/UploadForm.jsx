import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  parseTransactions,
  detectBank,
} from "../services/transactionParser";
import { auth } from "../firebase/firebaseConfig";
import {
  createStatement,
  saveTransactionsBatch,
} from "../services/firestoreService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Button, Input, Select, Field } from "./ui";

const BANK_OPTIONS = ["auto", "SBI", "HDFC", "ICICI", "AXIS", "Other"];

// PDF Worker Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [bank, setBank] = useState("auto");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateAndSet = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      toast.error("File size must be less than 20 MB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e) => validateAndSet(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);
      setProgress(10);

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        password,
      }).promise;

      setProgress(30);

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        if (textContent.items.length === 0) {
          toast.warning(
            "This looks like a scanned PDF. OCR is not supported yet."
          );
          setLoading(false);
          setProgress(0);
          return;
        }

        // ✅ FIX: Items ko Y-position ke hisaab se lines mein group karo
        // Pehle: sab items ek line mein join ho jaate the → regex match nahi hota
        // Ab: har row alag line ban ti hai → regex sahi match karta hai

        // Step 1: Sort by Y (top to bottom), then X (left to right)
        const sorted = [...textContent.items].sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 5) return yDiff;
          return a.transform[4] - b.transform[4];
        });

        // Step 2: Group items with same Y into one line
        const lineMap = new Map();
        for (const item of sorted) {
          const y = Math.round(item.transform[5]);
          if (!lineMap.has(y)) lineMap.set(y, []);
          lineMap.get(y).push(item.str);
        }

        // Step 3: Sort lines top-to-bottom and join with "\n"
        const pageLines = Array.from(lineMap.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([, parts]) => parts.join(" ").trim())
          .filter(Boolean)
          .join("\n");

        fullText += pageLines + "\n";
      }

      setProgress(60);

      const parsedTransactions = parseTransactions(fullText);
      console.log("PARSED:", JSON.stringify(parsedTransactions.slice(0, 5), null, 2));

      if (!parsedTransactions || parsedTransactions.length === 0) {
        setProgress(0);
        setLoading(false);
        toast.error("No transactions found in this PDF.");
        return;
      }

      const resolvedBank =
        bank === "auto" ? detectBank(fullText) : bank;

      const statementId = await createStatement({
        bank: resolvedBank,
        userId: auth.currentUser.uid,
        transactionCount: parsedTransactions.length,
      });

      await saveTransactionsBatch(
        parsedTransactions,
        statementId,
        auth.currentUser.uid
      );

      setProgress(100);
      setLoading(false);
      setFile(null);

      toast.success(
        `${resolvedBank} statement saved (${parsedTransactions.length} transactions)`
      );
    } catch (error) {
      if (error?.name === "PasswordException") {
        toast.error("Wrong PDF password.");
      } else if (error?.message?.includes("Invalid PDF")) {
        toast.error("The PDF file appears to be corrupt.");
      } else {
        toast.error("Failed to parse the PDF.");
      }
      setProgress(0);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-slate-900 p-8 text-white">
          <h1 className="text-2xl font-bold">Bank Statement Digitizer</h1>
          <p className="mt-2 text-sm text-slate-300">
            Upload, parse and store your bank transactions.
          </p>
        </div>

        {/* Dropzone */}
        <Card className="mb-6 p-6">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Upload PDF Statement
          </label>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
              dragActive
                ? "border-slate-900 bg-slate-50"
                : "border-slate-300"
            }`}
          >
            <p className="font-medium text-slate-700">Drag &amp; Drop PDF here</p>
            <p className="my-2 text-sm text-slate-400">or</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
            />
          </div>

          {file && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
              Selected: {file.name}
            </div>
          )}
        </Card>

        {/* Details */}
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Bank">
              <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                {BANK_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b === "auto" ? "Auto-detect" : b}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="PDF Password (optional)">
              <Input
                type="password"
                placeholder="Enter PDF password if protected"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        {/* Progress */}
        {progress > 0 && (
          <div className="mb-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-slate-900 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{progress}%</p>
          </div>
        )}

        <Button size="lg" onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload & Parse"}
        </Button>
      </div>
    </div>
  );
}
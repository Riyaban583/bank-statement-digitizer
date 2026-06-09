# 🏦 Bank Statement Digitizer

> Automatically extract, parse, and store bank transaction data from PDF statements — with multi-bank support and intelligent detection.

[![Status](https://img.shields.io/badge/Status-Completed%20%E2%9C%85-brightgreen)](.)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)](https://firebase.google.com)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite-purple)](https://vitejs.dev)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Banks](#supported-banks)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture & Flowcharts](#architecture--flowcharts)
- [Transaction Schema](#transaction-schema)
- [Firestore Collections](#firestore-collections)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Overview

**Bank Statement Digitizer** is a React and Firebase-based application that extracts transaction data from bank statement PDFs. It automatically identifies the bank, applies the appropriate bank-specific parser, and stores normalized transaction data in Firebase Firestore — all in a seamless pipeline from upload to dashboard.

---

## Features

### 📄 PDF Processing
- Upload bank statement PDFs via a clean UI
- Password-protected PDF support
- PDF text extraction powered by `PDF.js`
- Robust PDF error handling

### ⚠️ Error Handling
| Error Code | Description |
|---|---|
| `WRONG_PASSWORD` | Incorrect password for a protected PDF |
| `CORRUPT_PDF` | The PDF file is unreadable or malformed |
| `UNSUPPORTED_BANK` | Statement format does not match any known bank |

### 🏛️ Multi-Bank Support
- **SBI** — State Bank of India
- **HDFC** — HDFC Bank
- **ICICI** — ICICI Bank

### ⚙️ Transaction Processing
- Automatic bank detection from statement content
- Bank-specific transaction parsing
- Transaction normalization into a unified schema
- Direct storage to Firebase Firestore

### 📊 Dashboard
- View all parsed transactions in a clean table
- Search and filter transactions
- Real-time Firestore integration

---

## Supported Banks

| Bank | Date Format | Transaction Markers | Parser |
|---|---|---|---|
| **SBI** | `DD/MM/YYYY` | `Cr` / `Dr` | `parsers/sbi.js` |
| **HDFC** | `DD-MM-YYYY` | Column-based structure | `parsers/hdfc.js` |
| **ICICI** | `DD/MM/YYYY` | Standard row parsing | `parsers/icici.js` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, React Router |
| **Backend** | Firebase Firestore, Firebase Functions |
| **PDF Processing** | `pdfjs-dist` |

---

## Project Structure

```text
bank-statement-digitizer/
│
├── docs/
│   └── samples.md                  # Sample PDF documentation
│
├── samples/
│   ├── sbi-sample.pdf
│   ├── hdfc-sample.pdf
│   ├── icici-sample.pdf
│   └── axis-sample.pdf
│
├── functions/                      # Firebase Cloud Functions
│   ├── index.js
│   ├── pdfService.js               # Core PDF processing logic
│   │
│   └── parsers/
│       ├── index.js                # Parser router
│       ├── sbi.js
│       ├── hdfc.js
│       └── icici.js
│
├── src/                            # React frontend
│   ├── components/
│   ├── firebase/
│   ├── pages/
│   └── services/
│
├── firebase.json
├── firestore.rules
├── package.json
└── README.md
```

---

## Architecture & Flowcharts

### 1. Full PDF Processing Pipeline

This is the end-to-end flow from the moment a user uploads a PDF to the point where transactions are saved in Firestore.

```mermaid
flowchart TD
    A([🗂️ User Uploads PDF]) --> B[unlockPdf]
    B --> C{Password\nRequired?}
    C -- Yes --> D{Correct\nPassword?}
    D -- No --> E[❌ WRONG_PASSWORD Error]
    D -- Yes --> F[getPdfItems]
    C -- No --> F
    F --> G{PDF\nReadable?}
    G -- No --> H[❌ CORRUPT_PDF Error]
    G -- Yes --> I[groupItemsIntoRows]
    I --> J[detectBank]
    J --> K{Bank\nIdentified?}
    K -- No --> L[❌ UNSUPPORTED_BANK Error]
    K -- SBI --> M[SBI Parser]
    K -- HDFC --> N[HDFC Parser]
    K -- ICICI --> O[ICICI Parser]
    M & N & O --> P[normalizeTransactions]
    P --> Q[(🔥 Firestore Storage)]
    Q --> R([✅ Transactions Saved])

    style A fill:#4A90D9,color:#fff
    style R fill:#27AE60,color:#fff
    style E fill:#E74C3C,color:#fff
    style H fill:#E74C3C,color:#fff
    style L fill:#E74C3C,color:#fff
    style Q fill:#F39C12,color:#fff
```

---

### 2. Bank Detection Logic

How the system reads statement content and routes to the correct parser.

```mermaid
flowchart TD
    A([Raw PDF Text]) --> B[Scan for Bank Identifiers]
    B --> C{Keyword Match?}

    C --> D{Contains\n'State Bank'\nor 'SBI'?}
    C --> E{Contains\n'HDFC Bank'?}
    C --> F{Contains\n'ICICI Bank'?}

    D -- Yes --> G[🏦 Route to SBI Parser\nDate: DD/MM/YYYY\nMarkers: Cr / Dr]
    E -- Yes --> H[🏦 Route to HDFC Parser\nDate: DD-MM-YYYY\nColumn-based]
    F -- Yes --> I[🏦 Route to ICICI Parser\nDate: DD/MM/YYYY\nRow-based]

    D -- No --> J{Any\nmatch found?}
    E -- No --> J
    F -- No --> J

    J -- No --> K[❌ Throw UNSUPPORTED_BANK]
    G & H & I --> L([✅ Return Parsed Transactions])

    style A fill:#4A90D9,color:#fff
    style L fill:#27AE60,color:#fff
    style K fill:#E74C3C,color:#fff
```

---

### 3. Transaction Normalization Flow

Each bank parser returns raw data. The normalizer converts it into a unified schema.

```mermaid
flowchart LR
    A([Raw Bank Data]) --> B[Extract Date]
    A --> C[Extract Description]
    A --> D[Extract Amount]
    A --> E[Extract Balance]
    A --> F[Determine Type\nCredit or Debit]

    B & C & D & E & F --> G[normalizeTransactions]

    G --> H{Validate\nAll Fields?}
    H -- No --> I[⚠️ Skip / Flag Row]
    H -- Yes --> J["📦 Normalized Record
    ─────────────────
    date: DD/MM/YYYY
    description: string
    amount: string
    type: credit | debit
    balance: string"]

    J --> K[(🔥 Firestore)]

    style A fill:#4A90D9,color:#fff
    style K fill:#F39C12,color:#fff
    style I fill:#E67E22,color:#fff
```

---

### 4. Frontend Application Flow

How a user interacts with the app from upload to viewing results.

```mermaid
flowchart TD
    A([🙋 User Opens App]) --> B[Upload Page]
    B --> C[Select PDF File]
    C --> D{Password\nProtected?}
    D -- Yes --> E[Enter Password]
    E --> F[Submit for Processing]
    D -- No --> F
    F --> G[Call Firebase Function]
    G --> H{Processing\nResult?}

    H -- Error --> I[Display Error Message\nWRONG_PASSWORD /\nCORRUPT_PDF /\nUNSUPPORTED_BANK]
    I --> B

    H -- Success --> J[Transactions Stored\nin Firestore]
    J --> K[Redirect to Dashboard]
    K --> L[View Transactions Table]
    L --> M{User Action?}
    M -- Search --> N[Filter Transactions]
    N --> L
    M -- Upload More --> B

    style A fill:#4A90D9,color:#fff
    style I fill:#E74C3C,color:#fff
    style J fill:#27AE60,color:#fff
```

---

### 5. Firestore Data Architecture

```mermaid
erDiagram
    USERS {
        string uid PK
        string email
        string displayName
        timestamp createdAt
    }

    STATEMENTS {
        string statementId PK
        string uid FK
        string bankName
        string fileName
        timestamp uploadedAt
        string status
    }

    TRANSACTIONS {
        string transactionId PK
        string statementId FK
        string date
        string description
        string amount
        string type
        string balance
    }

    USERS ||--o{ STATEMENTS : "uploads"
    STATEMENTS ||--o{ TRANSACTIONS : "contains"
```

---

## Transaction Schema

All bank statements are normalized into a unified format before storage:

```js
{
  date: "01/05/2026",          // DD/MM/YYYY — standardized across all banks
  description: "Salary Credit", // Transaction narration / remarks
  amount: "50000",              // Transaction amount as string
  type: "credit",               // "credit" or "debit"
  balance: "60000"              // Closing balance after transaction
}
```

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | Stores registered user information |
| `statements` | Metadata for each uploaded PDF statement |
| `transactions` | Normalized transaction records parsed from statements |

---

## Installation

**1. Clone the repository:**

```bash
git clone https://github.com/your-username/bank-statement-digitizer.git
cd bank-statement-digitizer
```

**2. Install dependencies:**

```bash
npm install
```

**3. Set up environment variables** (see section below)

**4. Run the development server:**

```bash
npm run dev
```

**5. (Optional) Deploy Firebase Functions:**

```bash
firebase deploy --only functions
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys from your [Firebase Console](https://console.firebase.google.com):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> ⚠️ The `.env` file is listed in `.gitignore` and is never committed to version control.

---

## Testing

### ✅ Test Coverage Summary

| Module | Test | Status |
|---|---|---|
| **PDF Module** | PDF Upload | ✅ Passed |
| | Password Handling | ✅ Passed |
| | PDF Parsing | ✅ Passed |
| **Firestore** | Save Transactions | ✅ Passed |
| | Read Transactions | ✅ Passed |
| **Parsers** | SBI Parser | ✅ Passed |
| | HDFC Parser | ✅ Passed |
| | ICICI Parser | ✅ Passed |
| **Validation** | `WRONG_PASSWORD` | ✅ Passed |
| | `CORRUPT_PDF` | ✅ Passed |
| | `UNSUPPORTED_BANK` | ✅ Passed |
| **End-to-End** | Upload → Parse → Normalize → Store | ✅ Passed |

---

## Project Status

> ✅ **Completed** — Built and tested as part of the Bank Statement Digitizer internship assignment.

All planned features have been implemented, tested, and verified end-to-end.

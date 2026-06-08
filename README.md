# 🏦 Bank Statement Digitizer

> Automatically extract, parse, and store bank transaction data from PDF statements — with multi-bank support and a searchable dashboard.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-build-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat&logo=tailwindcss)](https://tailwindcss.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Supported Banks](#supported-banks)
- [Parser Dispatcher](#parser-dispatcher)
- [Firestore Data Model](#firestore-data-model)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Project Status](#project-status)

---

## Overview

**Bank Statement Digitizer** is a React and Firebase-based application that digitizes bank statement PDFs by extracting raw text using PDF.js, routing it through bank-specific parsers, and persisting structured transaction records in Firebase Firestore.

The application supports multiple Indian bank formats (SBI, HDFC, ICICI) through a modular parser system and includes a dashboard for browsing and searching transactions.

---

## Features

- Upload bank statement PDFs through the browser
- Extract text content using PDF.js (client-side, no server upload required)
- Auto-detect bank format and route to the correct parser
- Parse transactions into a normalized structure (date, description, amount, type)
- Store parsed records in Firebase Firestore
- View and search transactions on a dashboard
- Handle unsupported bank formats gracefully with typed errors

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| PDF processing | pdfjs-dist |
| Backend / Database | Firebase Firestore |
| Cloud functions | Firebase Functions |

---

## System Architecture and design

### End-to-end upload and parsing flow

```
User uploads PDF
       │
       ▼
PDF.js text extraction
(client-side, page by page)
       │
       ▼
Parser dispatcher
(detects bank from statement header)
       │
  ┌────┴────────┬──────────────┬────────────────┐
  ▼             ▼              ▼                 ▼
sbi.js       hdfc.js        icici.js      UNSUPPORTED_BANK
(Cr/Dr)    (DD-MM-YYYY)   (DD/MM/YYYY)      (throws error)
  │             │              │
  └────┬────────┘──────────────┘
       ▼
Parsed Transaction[]
{ date, description, amount, type, balance }
       │
       ▼
Firebase Firestore
(transactions / statements / users)
       │
       ▼
Dashboard — browse & search
```

### Parser dispatcher routing

```
parseStatement(text, bankCode)
          │
          ├── "sbi"   ──► sbi.js
          ├── "hdfc"  ──► hdfc.js
          ├── "icici" ──► icici.js
          └── default ──► throw new Error("UNSUPPORTED_BANK")
```

### Firestore data relationships

```
users (1)
  └── statements (N)
        └── transactions (N)
```

---

## Project Structure

```
bank-statement-digitizer/
│
├── docs/
│   └── samples.md              # Sample statement format documentation
│
├── samples/
│   ├── sbi-sample.pdf
│   ├── hdfc-sample.pdf
│   ├── icici-sample.pdf
│   └── axis-sample.pdf         # Axis Bank (unsupported — used to test error handling)
│
├── functions/
│   ├── index.js                # Firebase Functions entry point
│   └── parsers/
│       ├── index.js            # Dispatcher — routes to correct parser
│       ├── sbi.js              # SBI-specific parser
│       ├── hdfc.js             # HDFC-specific parser
│       └── icici.js            # ICICI-specific parser
│
├── public/                     # Static assets
│
├── src/
│   ├── components/             # Reusable React components
│   ├── firebase/               # Firebase init and config
│   ├── pages/                  # Route-level page components
│   └── services/               # API and Firestore service modules
│
├── .env                        # Local environment variables (git-ignored)
├── firebase.json               # Firebase hosting + functions config
├── firestore.rules             # Firestore security rules
├── package.json
└── README.md
```

---

## Supported Banks

### SBI — State Bank of India

| Property | Value |
|---|---|
| Date format | `DD/MM/YYYY` |
| Transaction markers | `Cr` (credit), `Dr` (debit) |
| Balance column | Included |

**Example row:**
```
01/05/2026    Salary Credit    50000    Cr    60000
```

### HDFC Bank

| Property | Value |
|---|---|
| Date format | `DD-MM-YYYY` |
| Transaction markers | Inferred from amount position |
| Balance column | Included |

**Example row:**
```
01-05-2026    Salary Credit    50000    60000
```

### ICICI Bank

| Property | Value |
|---|---|
| Date format | `DD/MM/YYYY` |
| Transaction markers | Inferred from amount position |
| Balance column | Included |

**Example row:**
```
01/05/2026    Salary Credit    50000    60000
```

---

## Parser Dispatcher

The dispatcher in `functions/parsers/index.js` selects the correct parser based on the bank code passed at runtime.

```js
// Usage
parseStatement(text, "sbi");    // Routes to sbi.js
parseStatement(text, "hdfc");   // Routes to hdfc.js
parseStatement(text, "icici");  // Routes to icici.js

// Unknown banks throw a typed error
parseStatement(text, "axis");   // throws Error("UNSUPPORTED_BANK")
```

Each parser returns an array of normalized transaction objects:

```js
[
  {
    date: "2026-05-01",
    description: "Salary Credit",
    amount: 50000,
    type: "credit",       // or "debit"
    balance: 60000
  },
  // ...
]
```

---

## Firestore Data Model

### `users` collection

Stores authenticated user profile information and security.

| Field | Type | Description |
|---|---|---|
| `uid` | string | Firebase Auth UID |
| `email` | string | User email address |
| `displayName` | string | User display name |
| `createdAt` | timestamp | Account creation time |

### `statements` collection

Stores metadata about each uploaded PDF.

| Field | Type | Description |
|---|---|---|
| `statementId` | string | Auto-generated document ID |
| `userId` | string | Reference to the uploading user |
| `bankName` | string | Detected bank name |
| `uploadedAt` | timestamp | Upload timestamp |
| `fileName` | string | Original PDF filename |

### `transactions` collection

Stores individual parsed transaction records.

| Field | Type | Description |
|---|---|---|
| `transactionId` | string | Auto-generated document ID |
| `statementId` | string | Reference to the parent statement |
| `date` | string | Transaction date (ISO format) |
| `description` | string | Transaction narration |
| `amount` | number | Transaction amount |
| `type` | string | `"credit"` or `"debit"` |
| `balance` | number | Running balance after transaction |

---

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/bank-statement-digitizer.git
cd bank-statement-digitizer
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

**4. Run the development server**

```bash
npm run dev
```

The application starts at `http://localhost:5173` by default.

---

## Environment Variables

Create a `.env` file in the project root and populate it with your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

The `.env` file is listed in `.gitignore` and is never committed to version control.

> Find these values in the Firebase Console under **Project Settings → General → Your apps**.

---

## Testing

All core modules have been tested and verified.

| Area | Status |
|---|---|
| PDF upload | ✅ Passed |
| PDF text extraction (PDF.js) | ✅ Passed |
| Firestore save | ✅ Passed |
| Firestore read | ✅ Passed |
| SBI parser | ✅ Passed |
| HDFC parser | ✅ Passed |
| ICICI parser | ✅ Passed |
| Dispatcher routing | ✅ Passed |
| Unsupported bank error | ✅ Passed |

---

## Project Status

✅ **Completed** as part of the Bank Statement Digitizer internship assignment.

All features have been implemented, tested, and verified. The application handles supported bank formats correctly and rejects unsupported formats with a typed error. 

---

*Built with React, Firebase, PDF.js, and Tailwind CSS.*

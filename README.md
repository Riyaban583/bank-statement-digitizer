<div align="center">

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />

# 🏦 Bank Statement Digitizer

**Transform your bank statement PDFs into clean, structured, queryable transaction data — instantly.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Roadmap](#-roadmap) • [Author](#-author)

</div>

---

## 📌 Overview

**Bank Statement Digitizer** is a full-stack web application that lets users upload bank statement PDFs (including password-protected ones), automatically extract and parse transaction data using `pdfjs-dist`, and display a clean, structured table of transactions — all backed by Firebase and Firestore.

Whether you're building a personal finance tracker, a fintech prototype, or just want a smarter way to manage statements, this tool handles the heavy lifting.

---

## ✨ Features

| Feature | Status |
|---|---|
| 📤 Upload bank statement PDFs | ✅ Complete |
| 🔐 Support for password-protected PDFs | ✅ Complete |
| 📄 Extract raw text from PDFs | ✅ Complete |
| 🔍 Auto-parse transaction details | ✅ Complete |
| 📊 Display transactions in structured table | ✅ Complete |
| ☁️ Firebase project configuration | ✅ Complete |
| 🗄️ Firestore transaction storage | 🔄 In Progress |
| 🕓 Transaction history view | 🔄 In Progress |
| 📥 Excel / CSV export | 🔄 In Progress |
| 🧠 Enhanced parsing logic | 🔄 In Progress |

---

## 🛠 Tech Stack

### Frontend
- ⚛️ **React** — component-based UI
- ⚡ **Vite** — fast dev server and build tool
- 🎨 **Tailwind CSS** — utility-first styling
- 🔀 **React Router** — client-side routing

### Backend & Cloud
- 🔥 **Firebase** — BaaS platform
- 🗄️ **Firestore** — NoSQL cloud database
- ⚙️ **Firebase Functions** — serverless backend logic

### PDF Processing
- 📄 **pdfjs-dist** — Mozilla's PDF rendering and text extraction library

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Firebase](https://firebase.google.com/) project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/Riyaban583/bank-statement-digitizer.git
cd bank-statement-digitizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Go to [Firebase Console](https://console.firebase.google.com/) → your project → Project Settings → Web App config.

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

> ⚠️ Never commit your `.env` file. It's already included in `.gitignore`.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
bank-statement-digitizer/
│
├── public/                         # Static assets
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Top navigation bar
│   │   ├── Sidebar.jsx             # Left sidebar navigation
│   │   ├── UploadForm.jsx          # PDF upload + password input UI
│   │   └── TransactionTable.jsx    # Parsed transactions display table
│   │
│   ├── pages/
│   │   ├── Upload.jsx              # Upload page (wraps UploadForm)
│   │   └── Transactions.jsx        # Transactions history page
│   │
│   ├── firebase/
│   │   └── firebaseConfig.js       # Firebase app initialization
│   │
│   ├── services/
│   │   ├── transactionParser.js    # Core PDF text → transaction parser
│   │   ├── transactionService.js   # Firestore CRUD for transactions
│   │   └── statementService.js     # Statement upload & management
│   │
│   ├── utils/
│   │   ├── exportExcel.js          # Excel/CSV export helper
│   │   └── formatDate.js           # Date formatting utilities
│   │
│   ├── App.jsx                     # Root component + route definitions
│   └── main.jsx                    # React DOM entry point
│
├── .env                            # Environment variables (not committed)
├── .gitignore
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🧩 Key Modules Explained

### `transactionParser.js`
The heart of the app. Takes raw text extracted from a PDF and uses regex and pattern matching to identify:
- Transaction **date**
- Transaction **description / narration**
- **Debit** and **credit** amounts
- Running **balance**

### `statementService.js`
Handles file ingestion — accepts a PDF `File` object, optionally decrypts it with a password using `pdfjs-dist`, and extracts page-by-page text content.

### `transactionService.js`
Manages all Firestore operations: saving parsed transactions, retrieving history, and deleting records.

---

## 📸 Screenshots

> _Add screenshots here to showcase your app:_

| Page | Description |
|---|---|
| 📤 Upload Page | Drag-and-drop PDF upload with optional password field |
| 📝 Text Preview | Raw extracted text before parsing |
| 📊 Transaction Table | Parsed data: date, description, debit, credit, balance |
| 🕓 Dashboard | Statement history and summaries |

---

## 🗺 Roadmap

- [x] PDF upload and text extraction
- [x] Basic transaction parsing
- [x] Transaction table UI
- [ ] Save parsed transactions to Firestore
- [ ] View past statement uploads
- [ ] Export to `.xlsx` / `.csv`
- [ ] Multi-bank format support (HDFC, SBI, ICICI, etc.)
- [ ] User authentication (Firebase Auth)
- [ ] Charts and spending analytics
- [ ] Mobile-responsive improvements

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is developed for **learning and educational purposes**.  
Feel free to use, modify, and build on it.

---

## 👩‍💻 Author

**Riya Bansal**  
[@Riyaban583](https://github.com/Riyaban583)

<div align="center">

⭐ If you found this project helpful, please give it a star!

</div>

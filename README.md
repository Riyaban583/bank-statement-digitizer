<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Bank%20Statement%20Digitizer&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=38&desc=Upload%20·%20Parse%20·%20Analyze%20·%20Export&descAlignY=60&descSize=18" width="100%"/>

<br/>

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PDF.js](https://img.shields.io/badge/PDF.js-Powered-FF6B35?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://mozilla.github.io/pdf.js/)
[![License](https://img.shields.io/badge/License-Portfolio-22C55E?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](./LICENSE)

<br/>

[![Stars](https://img.shields.io/github/stars/riyabansal/bank-statement-digitizer?style=social)](https://github.com/)
[![Forks](https://img.shields.io/github/forks/riyabansal/bank-statement-digitizer?style=social)](https://github.com/)
[![Issues](https://img.shields.io/github/issues/riyabansal/bank-statement-digitizer?color=red)](https://github.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/)

<br/>

<p align="center">
  <strong>🏦 A full-stack React + Firebase web application that transforms bank statement PDFs<br/>into structured, searchable, and exportable transaction data — all through a clean dashboard.</strong>
</p>

<br/>

[🚀 Live Demo](#) · [📖 Documentation](#-installation--setup) · [🐛 Report Bug](https://github.com/) · [💡 Request Feature](https://github.com/)

<br/>

</div>

---

## 📋 Table of Contents

- [📸 Screenshots](#-screenshots)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🔥 Firebase Setup](#-firebase-setup)
- [📊 Firestore Data Schema](#-firestore-data-schema)
- [🔒 Security](#-security)
- [🧪 How It Works](#-how-it-works)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [👩‍💻 Author](#-author)
- [📄 License](#-license)


## ✨ Features

<br/>

<details>
<summary><b>🔐 Authentication & Security</b></summary>
<br/>

- ✅ User **Signup** with email & password via Firebase Auth
- ✅ User **Login** with error handling (wrong credentials, unregistered email)
- ✅ **Protected Routes** — unauthenticated users are auto-redirected to login
- ✅ Persistent session management (auto login on page refresh)
- ✅ **Logout** functionality with session cleanup
- ✅ Per-user data isolation in Firestore

</details>

<details>
<summary><b>📤 PDF Statement Upload</b></summary>
<br/>

| Feature | Details |
|---|---|
| 🖱️ **Drag & Drop** | Intuitive drop zone — drag files directly from your file manager |
| 🔒 **Password Support** | Handles password-protected PDFs using CryptoJS decryption |
| ✅ **File Validation** | PDF-only uploads, enforced max size of **20 MB** |
| 📶 **Progress Indicator** | Real-time upload & parsing progress feedback |
| ⚠️ **Smart Error Handling** | Detects unsupported banks, invalid PDFs, and wrong passwords |
| 🏦 **Bank Detection** | Automatically identifies the bank from the PDF content |

</details>

<details>
<summary><b>🔍 Transaction Parsing</b></summary>
<br/>

Powered by **PDF.js**, transactions are extracted automatically with these fields:

| Field | Type | Example |
|---|---|---|
| `date` | String | `01/05/2026` |
| `description` | String | `UPI Payment to Zomato` |
| `debit` | Number | `499.00` |
| `credit` | Number | `0` |
| `balance` | Number | `24501.00` |

- Smart regex patterns to parse various bank statement formats
- Handles multi-line transaction descriptions
- Filters out non-transaction lines (headers, footers, summaries)

</details>

<details>
<summary><b>📊 Transactions Dashboard</b></summary>
<br/>

- 🔍 **Live Search** — filter transactions by description in real time
- 💰 **Running Balance** column displayed alongside each transaction
- 📋 **4 Summary Cards**:
  - Total Transactions count
  - Total Debit amount
  - Total Credit amount
  - Current Balance
- 🗂️ **Statement Selector** dropdown to filter by individual statement

</details>

<details>
<summary><b>📄 Pagination</b></summary>
<br/>

| Size | Records per page |
|:---:|:---:|
| Small | 10 |
| Medium | 25 |
| Large | 50 |
| XL | 100 |

- ◀ Previous / Next ▶ navigation
- Dynamic total page count display
- Page size selector persists during session

</details>

<details>
<summary><b>📥 Export & Management</b></summary>
<br/>

- 📊 **Excel Export** — one-click `.xlsx` export of all or filtered transactions via SheetJS
- 🗂️ **Statement Management** — view all uploaded statements with metadata
- 🔢 **Transaction Count** per statement displayed in the statements list
- 📅 **Upload timestamp** stored and displayed per statement

</details>

---

## 🛠️ Tech Stack

<br/>

<div align="center">

| Layer | Technology | Purpose |
|:---:|:---:|---|
| ⚛️ | **React 18** | UI components & state management |
| 🔀 | **React Router DOM** | Client-side routing & protected routes |
| 🎨 | **Tailwind CSS** | Utility-first responsive styling |
| 🔥 | **Firebase Auth** | Email/password authentication |
| 🗄️ | **Cloud Firestore** | NoSQL database for statements & transactions |
| 📄 | **PDF.js** | In-browser PDF text extraction |
| 📊 | **SheetJS (XLSX)** | Excel file generation & export |
| 🔐 | **CryptoJS** | Password-protected PDF decryption |
| 🔔 | **React Toastify** | Toast notifications for user feedback |
| ⚡ | **Vite** | Lightning-fast build tool & dev server |

</div>

---

## 📂 Project Structure

```
bank-statement-digitizer/
│
├── 📁 public/                        # Static assets
│
├── 📁 src/
│   │
│   ├── 📁 components/                # Reusable UI components
│   │   ├── 🧭 Navbar.jsx             # Top navigation bar with logout
│   │   ├── 🛡️ ProtectedRoute.jsx     # Auth guard — redirects unauthenticated users
│   │   └── 📤 UploadForm.jsx         # PDF upload with drag & drop + validation
│   │
│   ├── 📁 pages/                     # Full page components (route targets)
│   │   ├── 🔑 Login.jsx              # Firebase email/password login page
│   │   ├── 📝 Signup.jsx             # New account registration page
│   │   ├── 📤 Upload.jsx             # PDF upload page
│   │   ├── 📊 Transactions.jsx       # Main dashboard — table, search, summary cards
│   │   └── 🗂️ Statements.jsx         # Statement list & per-statement filter
│   │
│   ├── 📁 services/                  # Business logic & external integrations
│   │   ├── 🔥 firestoreService.js    # Firestore CRUD — save, fetch, batch upload
│   │   └── 📄 transactionParser.js   # PDF.js text extraction & transaction parsing
│   │
│   ├── 📁 firebase/
│   │   └── ⚙️ firebaseConfig.js      # Firebase SDK initialization from env vars
│   │
│   ├── 🗺️ App.jsx                    # Route definitions & app layout
│   └── 🚀 main.jsx                   # React DOM entry point
│
├── 🔒 .env                           # Environment variables (never commit this!)
├── 🔒 .env.example                   # Template for environment variables
├── 🚫 .gitignore                     # Git ignore rules
├── 📄 index.html                     # HTML shell
├── ⚡ vite.config.js                 # Vite build configuration
└── 📦 package.json                   # Dependencies & scripts
```

### Step 4 — Start Development Server

```bash
npm run dev
```

Open your browser at → **[http://localhost:5173](http://localhost:5173)**

<br/>

### Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start local development server with HMR |
| Build | `npm run build` | Create optimised production bundle |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | Run ESLint across the codebase |

---

## 🔥 Firebase Setup

<br/>

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → enter project name → Continue
3. Disable Google Analytics (optional) → **Create project**

<br/>

### 2. Enable Authentication

```
Firebase Console → Authentication → Sign-in method → Email/Password → Enable → Save
```

<br/>

### 3. Create Firestore Database

```
Firebase Console → Firestore Database → Create database → Start in test mode → Next → Enable
```

Create these two collections:

```
📁 statements       ← stores PDF upload metadata
📁 transactions     ← stores parsed transaction rows
```

<br/>

### 4. Register Your Web App

```
Firebase Console → Project Settings → Your apps → Add app (</>) → Register app → Copy config
```

Paste the config values into your `.env` file.

<br/>

### 5. Firestore Security Rules

Once development is complete, replace test mode rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own statements
    match /statements/{docId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    // Users can only read/write their own transactions
    match /transactions/{docId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

> ✅ These rules ensure each user can only access their own data — even if someone knows another user's document IDs.

---

## 📊 Firestore Data Schema

<br/>

### `statements` collection

Each document represents one uploaded PDF statement:

```json
{
  "bank": "sbi",
  "userId": "firebase_user_uid_here",
  "transactionCount": 120,
  "uploadedAt": "2026-05-01T10:30:00.000Z",
  "fileName": "SBI_Statement_May2026.pdf"
}
```

<br/>

### `transactions` collection

Each document represents one transaction row parsed from a statement:

```json
{
  "date": "01/05/2026",
  "description": "UPI Payment to Zomato",
  "debit": 499.00,
  "credit": 0,
  "balance": 24501.00,
  "statementId": "firestore_statement_doc_id",
  "userId": "firebase_user_uid_here"
}
```

<br/>

### Data Relationships

```
User (Firebase Auth)
  └── statements (Firestore collection)
        └── statement_doc_id
              └── transactions (Firestore collection)
                    ├── transaction_1  { statementId: "statement_doc_id" }
                    ├── transaction_2  { statementId: "statement_doc_id" }
                    └── transaction_n  ...
```

---

## 🔒 Security

<br/>

| Security Layer | Implementation | Status |
|---|---|:---:|
| 🔑 **API Keys** | Stored in `.env`, excluded from version control | ✅ |
| 🛡️ **Authentication** | Firebase Auth — JWT tokens, session management | ✅ |
| 🔐 **Data Isolation** | Firestore queries and parser scoped to authenticated `userId` | ✅ |
| 🚧 **Route Protection** | `ProtectedRoute` component with automatic redirect | ✅ |
| 📜 **Firestore Rules** | Server-side rules enforce per-user data access | ✅ |
| 🔒 **PDF Passwords** | CryptoJS handles decryption client-side only | ✅ |

---

## 🧪 How It Works

<br/>

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER JOURNEY FLOW                           │
│                                                                 │
│  1. SIGN UP / LOG IN                                            │
│     └─▶ Firebase Auth validates credentials                     │
│         └─▶ JWT token stored in browser session                 │
│                                                                 │
│  2. UPLOAD PDF                                                  │
│     └─▶ File validated (type, size, password)                   │
│         └─▶ PDF.js reads PDF binary in-browser                  │
│             └─▶ Text extracted page by page                     │
│                 └─▶ Regex patterns identify transaction rows    │
│                     └─▶ Parsed rows structured as JSON          │
│                                                                 │
│  3. SAVE TO FIRESTORE                                           │
│     └─▶ Statement metadata saved to /statements                 │
│         └─▶ Transactions batch-saved to /transactions           │
│             └─▶ Each doc tagged with userId + statementId       │
│                                                                 │
│  4. VIEW DASHBOARD                                              │
│     └─▶ Transactions fetched for current user                   │
│         └─▶ Summary cards computed client-side                  │
│             └─▶ Live search filters description field           │
│                 └─▶ Paginated table renders results             │
│                                                                 │
│  5. EXPORT                                                      │
│     └─▶ SheetJS converts transaction array to .xlsx             │
│         └─▶ Browser triggers file download                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap

<br/>

### ✅ Completed

- [x] Firebase Authentication (Login, Signup, Logout, Protected Routes)
- [x] PDF upload with drag & drop, password support, and validation
- [x] Transaction parsing with PDF.js
- [x] Firestore integration (batch save, user-scoped queries)
- [x] Transactions dashboard with search, summary cards, and running balance
- [x] Statement management with filtering
- [x] Pagination with configurable page size
- [x] Excel export (.xlsx) via SheetJS

<br/>

### 🔜 Planned

- [ ] **Multi-bank support** — HDFC, ICICI, Axis, Kotak, PNB, Canara
- [ ] **Transaction categorization** — Auto-tag as Food, Travel, Shopping, EMI, etc.
- [ ] **Analytics dashboard** — Monthly income vs expense bar charts
- [ ] **Pie charts** — Spending breakdown by category using Recharts
- [ ] **PDF Export** — Download filtered transactions as PDF
- [ ] **Statement deletion** — Remove uploaded statements and their transactions
- [ ] **Dark mode toggle** — System-aware + manual dark/light switch
- [ ] **Mobile app** — React Native companion app
- [ ] **AI insights** — GPT-powered spending analysis and recommendations

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/your-username/bank-statement-digitizer.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Open a Pull Request on GitHub
```

<br/>

**Commit message convention:**

| Prefix | Use for |
|---|---|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation updates |
| `style:` | CSS / formatting changes |
| `refactor:` | Code restructuring |
| `chore:` | Dependencies, config updates |


## 🙏 Acknowledgements

| Tool / Resource | How it helped |
|---|---|
| [Firebase](https://firebase.google.com/) | Authentication and real-time database |
| [PDF.js](https://mozilla.github.io/pdf.js/) | Client-side PDF text extraction |
| [SheetJS](https://sheetjs.com/) | Excel file generation |
| [Tailwind CSS](https://tailwindcss.com/) | Rapid, responsive UI styling |
| [React Toastify](https://fkhadra.github.io/react-toastify/) | Clean toast notification system |
| [Shields.io](https://shields.io/) | README badges |
| [Capsule Render](https://github.com/kyechan99/capsule-render) | Animated header banner |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

<br/>

**⭐ If this project helped you or impressed you, please give it a star! It means the world. ⭐**

<br/>

Made with ❤️ and ☕ by **[Riya Bansal](https://github.com/riyabansal)**

<br/>

![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=riyabansal.bank-statement-digitizer)

</div>

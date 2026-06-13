<div align="center">

<br/>

```
██████╗  █████╗ ███╗   ██╗██╗  ██╗    ███████╗████████╗ █████╗ ████████╗███████╗
██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
██████╔╝███████║██╔██╗ ██║█████╔╝     ███████╗   ██║   ███████║   ██║   █████╗  
██╔══██╗██╔══██║██║╚██╗██║██╔═██╗     ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝  
██████╔╝██║  ██║██║ ╚████║██║  ██╗    ███████║   ██║   ██║  ██║   ██║   ███████╗
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝

██████╗ ██╗ ██████╗ ██╗████████╗██╗███████╗███████╗██████╗ 
██╔══██╗██║██╔════╝ ██║╚══██╔══╝██║╚══███╔╝██╔════╝██╔══██╗
██║  ██║██║██║  ███╗██║   ██║   ██║  ███╔╝ █████╗  ██████╔╝
██║  ██║██║██║   ██║██║   ██║   ██║ ███╔╝  ██╔══╝  ██╔══██╗
██████╔╝██║╚██████╔╝██║   ██║   ██║███████╗███████╗██║  ██║
╚═════╝ ╚═╝ ╚═════╝ ╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
```

**Upload · Parse · Analyze · Export**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Portfolio-green?style=for-the-badge)](./LICENSE)

<br/>

> A full-stack React + Firebase web application that transforms your bank statement PDFs into structured, searchable, and exportable transaction data — all through a clean, responsive dashboard.

<br/>

---

</div>

## 📸 Screenshots

<br/>

### 🔐 Authentication

<div align="center">

| Login Page | Signup Page |
|:---:|:---:|
| ![Login](https://via.placeholder.com/500x320/1e293b/60a5fa?text=Login+Screen) | ![Signup](https://via.placeholder.com/500x320/1e293b/60a5fa?text=Signup+Screen) |
| Secure email/password login via Firebase Auth | Create your account in seconds |

</div>

<br/>

### 📤 PDF Upload

<div align="center">

![Upload](https://via.placeholder.com/900x400/0f172a/38bdf8?text=PDF+Upload+with+Drag+%26+Drop+%7C+Progress+Indicator+%7C+Password+Support)

*Drag & drop or click to upload your bank statement PDF. Supports password-protected files and real-time upload progress.*

</div>

<br/>

### 📊 Transactions Dashboard

<div align="center">

![Dashboard](https://via.placeholder.com/900x500/0f172a/34d399?text=Transaction+Dashboard+%7C+Summary+Cards+%7C+Search+%7C+Paginated+Table)

*Full-featured transactions dashboard with summary cards, live search, running balance, and pagination controls.*

</div>

<br/>

### 🗂️ Statements Manager

<div align="center">

![Statements](https://via.placeholder.com/900x400/0f172a/f472b6?text=Statement+List+%7C+Filter+by+Statement+%7C+Transaction+Count)

*View all uploaded statements and drill into individual statement transactions using the statement selector dropdown.*

</div>

<br/>

---

## ✨ Features

<br/>

### 🔐 Authentication
- User **Signup** & **Login** via Firebase Authentication
- **Protected routes** — unauthenticated users are redirected
- Persistent session with **Logout** functionality

<br/>

### 📤 PDF Statement Upload

| Feature | Details |
|---|---|
| **Drag & Drop** | Intuitive file drop zone for quick uploads |
| **Password Support** | Handles password-protected PDFs using CryptoJS |
| **File Validation** | PDF-only, max **20 MB** |
| **Progress Indicator** | Real-time upload progress feedback |
| **Error Handling** | Detects unsupported banks, invalid PDFs & wrong passwords |

<br/>

### 🔍 Transaction Parsing

Transactions are automatically extracted from PDFs with the following fields:

```
Date  ·  Description  ·  Debit  ·  Credit  ·  Balance
```

<br/>

### 🔥 Firebase Integration

```
statements    →  Bank name · userId · transactionCount · uploadedAt
transactions  →  date · description · debit · credit · balance · statementId · userId
```

- Batch uploads for performance
- User-scoped queries (no cross-user data access)
- Statement metadata stored separately from transactions

<br/>

### 📊 Transactions Dashboard

- **Search** transactions by description (live filter)
- **Running balance** display column
- **4 Summary Cards**: Total Transactions · Total Debit · Total Credit · Current Balance
- **Statement selector** dropdown for filtering by individual uploads

<br/>

### 📄 Pagination

| Option | Records per page |
|---|:---:|
| Small | 10 |
| Medium | 25 |
| Large | 50 |
| XL | 100 |

Previous / Next navigation with dynamic page count display.

<br/>

### 📥 Export

Export all or filtered transactions to a **`.xlsx`** Excel file with a single click — powered by the SheetJS library.

<br/>

---

## 🛠️ Tech Stack

<br/>

```
Frontend          React.js · React Router DOM · Tailwind CSS
Auth & Database   Firebase Authentication · Firebase Firestore
PDF Parsing       PDF.js
Excel Export      XLSX (SheetJS)
Security          CryptoJS (PDF password decryption)
Notifications     React Toastify
Build Tool        Vite
```

<br/>

---

## 📂 Project Structure

```
bank-statement-digitizer/
│
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Top navigation bar with logout
│   │   ├── ProtectedRoute.jsx   # Auth guard for private routes
│   │   └── UploadForm.jsx       # PDF upload with drag & drop
│   │
│   ├── pages/
│   │   ├── Login.jsx            # Firebase email/password login
│   │   ├── Signup.jsx           # New account registration
│   │   ├── Upload.jsx           # PDF upload page
│   │   ├── Transactions.jsx     # Main dashboard with table & search
│   │   └── Statements.jsx       # Statement list & filter page
│   │
│   ├── services/
│   │   ├── firestoreService.js  # Firestore CRUD operations
│   │   └── transactionParser.js # PDF.js extraction logic
│   │
│   ├── firebase/
│   │   └── firebaseConfig.js    # Firebase SDK initialization
│   │
│   ├── App.jsx                  # Route definitions
│   └── main.jsx                 # React entry point
│
├── .env                         # Environment variables (not committed)
├── index.html
├── vite.config.js
└── package.json
```

<br/>

---

## ⚙️ Installation & Setup

<br/>

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd bank-statement-digitizer
```

<br/>

### 2. Install Dependencies

```bash
npm install
```

<br/>

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never commit your `.env` file.** Add it to `.gitignore`.

<br/>

### 4. Run the Development Server

```bash
npm run dev
```

App will be available at → **http://localhost:5173**

<br/>

---

## 🔥 Firebase Setup

<br/>

### Authentication

In the Firebase Console → **Authentication** → **Sign-in method**, enable:

```
✅ Email/Password
```

<br/>

### Firestore Database

Create the following collections:

```
📁 statements
📁 transactions
```

<br/>

### Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /statements/{docId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }

    match /transactions/{docId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

<br/>

---

## 📊 Firestore Data Schema

<br/>

### `statements` collection

```json
{
  "bank": "sbi",
  "userId": "firebase_user_uid",
  "transactionCount": 120,
  "uploadedAt": "2026-05-01T10:30:00Z"
}
```

<br/>

### `transactions` collection

```json
{
  "date": "01/05/2026",
  "description": "UPI Payment to Zomato",
  "debit": 499.00,
  "credit": 0,
  "balance": 24501.00,
  "statementId": "statement_firestore_doc_id",
  "userId": "firebase_user_uid"
}
```

<br/>

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **API Keys** | Stored in `.env`, never exposed in source |
| **Authentication** | Firebase Auth — all routes protected |
| **Data Access** | Firestore queries scoped to `userId` |
| **Route Protection** | `ProtectedRoute` component with redirect |

<br/>

---

## 🗺️ Roadmap

```
✅  Core features (Upload · Parse · Store · Dashboard · Export)

🔜  Multi-bank support (HDFC, ICICI, Axis, Kotak, etc.)
🔜  Advanced analytics (Monthly trends, category breakdown)
🔜  Transaction categorization (Food · Travel · Shopping · EMI)
🔜  Pie charts & bar graphs (Recharts / Chart.js)
🔜  PDF Export of filtered transactions
🔜  Statement deletion
🔜  Dark mode toggle
```

<br/>

---

## 👩‍💻 Author

<div align="center">

### Riya Bansal

**Frontend Developer · React Developer · Firebase Enthusiast**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-FF5722?style=for-the-badge&logo=firefox)](https://your-portfolio.com/)

</div>

<br/>

---

## 📄 License

This project is developed for **learning, internship tasks, and portfolio purposes**.

Feel free to explore, fork, and build upon it — a credit or star ⭐ is always appreciated!

<br/>

<div align="center">

---

Made with ❤️ by **Riya Bansal**

*If this project helped you, consider giving it a ⭐ on GitHub!*

</div>

import { BrowserRouter, Routes, Route } from "react-router-dom";
import app from "./firebase/firebaseConfig";

import Upload from "./pages/Upload";
import Transactions from "./pages/Transactions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import Statements from "./pages/Statements";
import Entries from "./pages/Entries";
import Invoices from "./pages/Invoices";

console.log(app);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
  path="/statements"
  element={
    <ProtectedRoute>
      <Statements />
    </ProtectedRoute>
  }
/>

<Route
  path="/entries"
  element={
    <ProtectedRoute>
      <Entries />
    </ProtectedRoute>
  }
/>
<Route
  path="/invoices"
  element={<Invoices />}
/>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
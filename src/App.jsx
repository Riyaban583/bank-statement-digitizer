import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Upload from "./pages/Upload";
import Transactions from "./pages/Transactions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import Statements from "./pages/Statements";
import Invoices from "./pages/Invoices";

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
  element={<Navigate to="/transactions" replace />}
/>
<Route
  path="/invoices"
  element={
    <ProtectedRoute>
      <Invoices />
    </ProtectedRoute>
  }
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
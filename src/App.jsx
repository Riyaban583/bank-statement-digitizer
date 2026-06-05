import { BrowserRouter, Routes, Route } from "react-router-dom";
import app from "./firebase/firebaseConfig";

import Upload from "./pages/Upload";
import Transactions from "./pages/Transactions";
import Navbar from "./components/Navbar";

console.log(app);

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate("/login");
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

       <div className="flex gap-6">
  <Link
    to="/"
    className="hover:text-blue-200"
  >
    Upload
  </Link>

  <Link
    to="/transactions"
    className="hover:text-blue-200"
  >
    Transactions
  </Link>

  <Link
    to="/statements"
    className="hover:text-blue-200"
  >
    Statements
  </Link>

  <Link
  to="/entries"
  className="hover:text-blue-200"
>
  Entries
</Link>

<Link to="/invoices">
  Invoices
</Link>
</div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </nav>
  );
}
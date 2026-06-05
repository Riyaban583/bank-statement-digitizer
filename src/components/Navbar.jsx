import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex gap-6">
        <Link to="/">Upload</Link>
        <Link to="/transactions">
          Transactions
        </Link>
      </div>
    </nav>
  );
} 
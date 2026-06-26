import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Button } from "./ui";

const LINKS = [
  { to: "/", label: "Upload", end: true },
  { to: "/transactions", label: "Transactions" },
  { to: "/statements", label: "Statements" },
  { to: "/invoices", label: "Invoices" },
];

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <NavLink to="/" end className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              B
            </span>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">
              BankDigitizer
            </span>
          </NavLink>

          <div className="flex items-center gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}

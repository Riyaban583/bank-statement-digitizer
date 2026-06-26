import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input, Field } from "../components/ui";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            B
          </span>
          <span className="text-lg font-semibold text-slate-900">
            BankDigitizer
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900">Create account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Start digitizing your statements
        </p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-slate-900 hover:underline"
          >
            Login
          </button>
        </p>
      </Card>
    </div>
  );
}

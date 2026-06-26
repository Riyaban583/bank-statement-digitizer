import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input, Field } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
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

        <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to your account
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-semibold text-slate-900 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </Card>
    </div>
  );
}

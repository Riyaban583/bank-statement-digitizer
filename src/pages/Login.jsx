import { useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");
  const navigate = useNavigate();
  const handleLogin = async (
    e
  ) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
  auth,
  email,
  password
);

navigate("/");
    } catch (error) {
      console.error(error);

      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-3xl font-bold mb-6">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Login
        </button>
        <p className="text-center mt-4 text-gray-600">
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/signup")}
    className="text-blue-600 font-semibold cursor-pointer hover:underline"
  >
    Sign Up
  </span>
</p>
      </form>

    </div>
  );
}
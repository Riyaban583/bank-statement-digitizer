import { useState } from "react";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");
    const navigate = useNavigate();
  const handleSignup = async (
    e
  ) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(
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
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-3xl font-bold mb-6">
          Signup
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
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          Signup
        </button>
        <p className="text-center mt-4 text-gray-600">
  Already have an account?{" "}
  <span
    onClick={() => navigate("/login")}
    className="text-blue-600 font-semibold cursor-pointer hover:underline"
  >
    Login
  </span>
</p>
      </form>

    </div>
  );
}
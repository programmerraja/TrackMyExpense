import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import SquareLoader from "../../components/SquareLoader";
import { useToast } from "../../components/Toast";
import API from "../../utils/API";

const fieldLabel = "label";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const submit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      addToast("Enter your email and password", "error");
      return;
    }

    setLoading(true);
    API.signIn({ email, password })
      .then((res) => {
        if (res.data.status === "success") {
          API.setToken(res.data.token);
          API.setAuthHeader();
          navigate("/");
          window.location.reload();
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        addToast(
          error.response?.data?.msg || "Could not sign in. Please try again.",
          "error",
        );
      });
  };

  return (
    <>
      <SquareLoader loading={loading} msg="Signing you in..." />
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-xl font-black text-white shadow-lg shadow-brand-500/30">
              ₹
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Track My Expense
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Your money, clearly organised
            </p>
          </div>

          <form onSubmit={submit} className="card space-y-4 p-5 sm:p-6">
            <div>
              <label htmlFor="email" className={fieldLabel}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                onChange={(event) => setEmail(event.target.value)}
                value={email}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="password" className={fieldLabel}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                required
                onChange={(event) => setPassword(event.target.value)}
                value={password}
                className="field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              Sign in
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

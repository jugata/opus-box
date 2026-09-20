"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="app-card w-full max-w-sm">
        <p className="label-tag mb-2">Get started</p>
        <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: "var(--font-display)" }}>Create an account</h1>
        {error && (
          <p className="text-sm mb-4" style={{ color: "var(--violet)" }}>{error}</p>
        )}
        <div className="flex flex-col gap-4">
          <div>
            <label className="label-tag block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label-tag block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field"
              placeholder="beethoven99"
            />
          </div>
          <div>
            <label className="label-tag block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="pill-btn justify-center mt-2"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </div>
        <p className="text-sm mt-5 text-center" style={{ color: "var(--soft)" }}>
          Already have an account?{" "}
          <Link href="/login" className="text-link">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

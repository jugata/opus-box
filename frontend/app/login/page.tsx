"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="app-card w-full max-w-sm">
        <p className="label-tag mb-2">Welcome back</p>
        <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: "var(--font-display)" }}>Log in</h1>
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
            {loading ? "Logging in…" : "Log in"}
          </button>
        </div>
        <p className="text-sm mt-5 text-center" style={{ color: "var(--soft)" }}>
          Don&rsquo;t have an account?{" "}
          <Link href="/register" className="text-link">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

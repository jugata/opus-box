"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav
      className="px-8 py-4 flex items-center justify-between"
      style={{ borderBottom: "1px solid var(--line)" }}
    >
      <Link href="/" className="font-bold text-xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
        OpusBox
      </Link>
      <div className="flex gap-6 text-sm font-semibold">
        <Link href="/composers" className="transition-colors" style={{ color: "var(--soft)" }}>
          Composers
        </Link>
        <Link href="/works" className="transition-colors" style={{ color: "var(--soft)" }}>
          Works
        </Link>
      </div>
      <div className="flex gap-4 items-center text-sm font-semibold">
        {session ? (
          <>
            <Link href="/journal" className="transition-colors" style={{ color: "var(--soft)" }}>
              Journal
            </Link>
            <span style={{ color: "var(--faint)" }}>
              Hi, {(session as any).user?.name ?? "there"}
            </span>
            <button
              onClick={() => signOut()}
              className="transition-colors"
              style={{ color: "var(--soft)" }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="transition-colors" style={{ color: "var(--soft)" }}>
              Log in
            </Link>
            <Link href="/register" className="pill-btn">
              Sign up
            </Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}

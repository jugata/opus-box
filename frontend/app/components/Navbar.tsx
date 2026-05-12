"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b px-8 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight">
        OpusBox
      </Link>
      <div className="flex gap-6 text-sm">
        <Link href="/composers" className="text-gray-600 hover:text-black transition-colors">
          Composers
        </Link>
        <Link href="/works" className="text-gray-600 hover:text-black transition-colors">
          Works
        </Link>
      </div>
      <div className="flex gap-3 text-sm items-center">
        {session ? (
          <>
            <span className="text-gray-600">Hi, {(session as any).user?.name ?? "there"}</span>
            <button
              onClick={() => signOut()}
              className="text-gray-600 hover:text-black transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:text-black transition-colors">
              Log in
            </Link>
            <Link href="/register" className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

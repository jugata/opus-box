import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="hero">
        <div className="blob" aria-hidden />
        <div className="blob-accent" aria-hidden />
        <h1 className="text-4xl font-extrabold relative mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Keep your ear
          <br />
          on record.
        </h1>
        <p className="relative max-w-sm mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
          A listening journal for classical music lovers — track what you&rsquo;ve
          heard, rate the recordings, build your archive.
        </p>
        <Link href="/composers" className="pill-btn pill-btn-accent relative">
          Enter the archive →
        </Link>
      </div>
    </main>
  );
}

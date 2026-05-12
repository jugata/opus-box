import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-2">OpusBox</h1>
      <p className="text-gray-500 text-lg mb-8">A listening journal for classical music lovers</p>
      <nav className="flex gap-4">
        <Link href="/composers" className="text-blue-600 hover:underline">
          Composers
        </Link>
      </nav>
    </main>
  );
}

import Link from "next/link";
import { getComposers } from "../lib/api";

export default async function ComposersPage() {
  const composers = await getComposers();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Composers</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {composers.map((composer) => (
          <Link key={composer.id} href={`/composers/${composer.id}`}>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold">{composer.name}</h2>
              {composer.nationality && (
                <p className="text-gray-500 text-sm mt-1">{composer.nationality}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

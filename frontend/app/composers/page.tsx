import Link from "next/link";
import { getComposers } from "../lib/api";
import ComposerSearch from "../components/ComposerSearch";

const TINTS = ["tint-blue", "tint-violet", "tint-neutral"];
const BADGES = ["badge-blue", "badge-violet", "badge-gold"];

export default async function ComposersPage() {
  const composers = await getComposers();

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Composers
      </h1>
      <ComposerSearch />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {composers.map((composer, i) => (
          <Link key={composer.id} href={`/composers/${composer.id}`}>
            <div className={`tint-card cursor-pointer ${TINTS[i % 3]}`}>
              <div className={`badge ${BADGES[i % 3]}`}>{composer.name[0]}</div>
              <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>{composer.name}</h2>
              {composer.nationality && (
                <p className="text-sm mt-0.5" style={{ color: "var(--soft)" }}>{composer.nationality}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

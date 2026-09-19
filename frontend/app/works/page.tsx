import Link from "next/link";
import { getWorks, getComposers } from "../lib/api";

export default async function WorksPage() {
  const [works, composers] = await Promise.all([getWorks(), getComposers()]);
  const composerNames = new Map(composers.map((c) => [c.id, c.name]));

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Works</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Link key={work.id} href={`/works/${work.id}`}>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <h2 className="text-lg font-semibold">{work.title}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {composerNames.get(work.composer_id) ?? "Unknown composer"}
              </p>
              {work.opus_number && (
                <p className="text-gray-400 text-xs mt-1">{work.opus_number}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

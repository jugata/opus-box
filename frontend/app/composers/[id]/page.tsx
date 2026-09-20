import Link from "next/link";
import { getComposer, getWorks } from "../../lib/api";
import WorkSearch from "../../components/WorkSearch";

export default async function ComposerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [composer, works] = await Promise.all([
    getComposer(id),
    getWorks(id),
  ]);

  return (
    <main className="min-h-screen p-8">
      <Link href="/composers" className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Back to Composers
      </Link>
      <h1 className="text-4xl font-bold mb-2">{composer.name}</h1>
      {composer.nationality && (
        <p className="text-gray-500 mb-8">{composer.nationality}</p>
      )}
      <h2 className="text-2xl font-semibold mb-4">Works</h2>
      <WorkSearch composerId={composer.id} />
      {works.length === 0 ? (
        <p className="text-gray-500">
          No works added yet — search above to find and add one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <Link key={work.id} href={`/works/${work.id}`}>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-medium">{work.title}</h3>
                {work.opus_number && (
                  <p className="text-gray-500 text-sm mt-1">{work.opus_number}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

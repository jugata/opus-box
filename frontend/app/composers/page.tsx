async function getComposers() {
  const res = await fetch("http://localhost:8000/composers", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch composers");
  return res.json();
}

export default async function ComposersPage() {
  const composers = await getComposers();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Composers</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {composers.map((composer: any) => (
          <div
            key={composer.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{composer.name}</h2>
            {composer.nationality && (
              <p className="text-gray-500 text-sm mt-1">{composer.nationality}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

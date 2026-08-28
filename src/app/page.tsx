import Link from "next/link";
import { listCreators } from "@/lib/creators";

export const dynamic = "force-dynamic";

export default async function Home() {
  const creators = await listCreators();

  return (
    <main className="mx-auto max-w-lg px-4 py-10 text-center space-y-6">
      <h1 className="text-lg font-medium">Creator support pages</h1>
      {creators.length > 0 ? (
        <ul className="space-y-2">
          {creators.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="underline">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">No creator pages yet.</p>
      )}
      <Link
        href="/register"
        className="inline-block rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium"
      >
        Create your page
      </Link>
    </main>
  );
}

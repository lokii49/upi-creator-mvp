import Link from "next/link";
import { creators } from "@/lib/creators";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10 text-center space-y-4">
      <h1 className="text-lg font-medium">Creator support pages</h1>
      <ul className="space-y-2">
        {creators.map((c) => (
          <li key={c.slug}>
            <Link href={`/${c.slug}`} className="underline">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

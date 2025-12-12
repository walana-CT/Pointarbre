import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  const user = sessionToken ? await getUserFromToken(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  const isCMOorAdmin = user.role === "CMO" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mes chantiers */}
        <Link
          href="/chantiers"
          className="block p-8 rounded-lg border transition-all hover:shadow-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >

          <h2 className="text-xl font-semibold mb-2">Mes chantiers</h2>
          <p className="text-sm text-[var(--color-muted)]">Gérer mes chantiers en cours</p>
        </Link>

        {/* CMO - visible uniquement pour CMO et ADMIN */}
        {isCMOorAdmin && (
          <Link
            href="/cmo"
            className="block p-8 rounded-lg border transition-all hover:shadow-lg"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-muted)",
            }}
          >
            <h2 className="text-xl font-semibold mb-2">CMO</h2>
            <p className="text-sm text-[var(--color-muted)]">Gestion CMO</p>
          </Link>
        )}

        {/* Administration - visible uniquement pour ADMIN */}
        {isAdmin && (
          <Link
            href="/admin"
            className="block p-8 rounded-lg border transition-all hover:shadow-lg"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-muted)",
            }}
          >
            <h2 className="text-xl font-semibold mb-2">Administration</h2>
            <p className="text-sm text-[var(--color-muted)]">gestion de la base de donnée</p>
          </Link>
        )}
      </div>
    </div>
  );
}

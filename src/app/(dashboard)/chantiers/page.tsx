import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";
import Link from "next/link";

export default async function ChantiersPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  const user = sessionToken ? await getUserFromToken(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="text-[var(--color-primary)] hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-4">Mes chantiers</h1>
      <p className="text-[var(--color-muted)] mb-8">
        Gérez vos chantiers en cours et consultez l'historique.
      </p>

      <div
        className="p-8 rounded-lg border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-muted)",
        }}
      >
        <p className="text-center text-[var(--color-muted)]">Page en construction... 🚧</p>
      </div>
    </div>
  );
}

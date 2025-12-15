import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";
import Link from "next/link";
import CMOClient from "./CMOClient";

export default async function CMOPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  const user = sessionToken ? await getUserFromToken(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  // Vérifier que l'utilisateur est CMO ou ADMIN
  if (user.role !== "CMO" && user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="mb-6">
        <Link href="/" className="text-[var(--color-primary)] hover:underline text-sm">
          ← Retour à l'accueil
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-[var(--color-text-secondary)] text-3xl sm:text-4xl font-bold mb-2">
          Gestion CMO
        </h1>
        <p className="text-[var(--color-muted)]">
          Visualisez et exportez les données des ouvriers par UT et par mois
        </p>
      </div>

      <CMOClient />
    </div>
  );
}

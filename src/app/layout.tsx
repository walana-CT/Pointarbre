import type { Metadata } from "next";
import "@/styles/globals.css";
import { cookies } from "next/headers";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { getUserFromToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Pointarbre",
  description: "Construit avec Next.js, React, Prisma et PostgreSQL",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value ?? "light";
  const sessionToken = cookieStore.get("session")?.value;
  const user = sessionToken ? await getUserFromToken(sessionToken) : null;

  return (
    <html lang="fr" className={`theme-${themeCookie}`}>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <header
          className="w-full bg-[var(--color-surface)] border-b"
          style={{ borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-[var(--color-text-secondary)] text-xl sm:text-2xl font-semibold">
                POINTARBRE
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link 
                    href="/profil" 
                    className="text-xs sm:text-sm hidden sm:block hover:opacity-80 transition-opacity"
                  >
                    <div className="font-medium">{user.prenom} {user.nom}</div>
                    <div className="text-xs text-[var(--color-muted)]">{user.email}</div>
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <Link href="/login" className="btn-secondary text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}

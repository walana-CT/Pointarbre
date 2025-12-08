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
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-lg font-semibold">
                POINTARBRE
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <div className="font-medium">{user.name ?? user.email}</div>
                    <div className="text-xs text-[var(--color-muted)]">{user.email}</div>
                  </div>
                  <LogoutButton />
                </div>
              ) : (
                <Link href="/login" className="btn-secondary">
                  Se connecter
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

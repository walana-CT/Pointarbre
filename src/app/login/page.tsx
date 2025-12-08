"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl rounded-lg shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left panel */}
        <div className="hidden md:flex flex-col items-center justify-center gap-6 p-10 bg-[var(--color-secondary)]">
          <div className="flex items-center justify-center w-40 h-20 rounded-full bg-[var(--color-primary)]">
            <span className="text-[var(--color-bg)] font-bold">POINTARBRE</span>
          </div>
          <h3 className="text-2xl font-semibold text-[var(--color-bg)]">
            Bienvenue sur l'espace interne
          </h3>
          <p className="text-sm text-[var(--color-surface)] max-w-xs text-center">
            Accédez aux outils métiers, gérez les sessions et consultez les ressources protégées.
          </p>
        </div>

        {/* Right / Form panel */}
        <div className="p-8 bg-[var(--color-surface)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">Se connecter</h2>
              <p className="text-sm text-[var(--color-secondary)] mt-1">
                Entrez vos identifiants pour continuer
              </p>
            </div>
            <ThemeToggle />
          </div>

          {error && (
            <div className="mt-4 rounded-md p-3 bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-[var(--color-text)] placeholder-gray-400 focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-[var(--color-text)] placeholder-gray-400 focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md px-4 py-2 text-[var(--color-bg)] font-medium bg-[var(--color-primary)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p>Identifiants de test :</p>
            <p className="mt-1 font-mono text-xs">
              <span className="font-semibold">Admin:</span> rob@mail.com / rob
            </p>
            <p className="font-mono text-xs">
              <span className="font-semibold">User:</span> bucheron@mail.com / bois
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

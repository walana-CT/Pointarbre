"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";

type Chantier = {
  id: string;
  date_debut: string;
  date_fin: string | null;
  date_cloture: string;
  foret: string;
  triage: string;
  parcelle: string;
  jours: { id: string }[];
};

export default function ArchivesPage() {
  const router = useRouter();
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    fetchArchivedChantiers();
  }, []);

  async function fetchArchivedChantiers() {
    try {
      const res = await fetch("/api/chantiers?archived=true");
      if (res.ok) {
        const data = await res.json();
        setChantiers(data);
      }
    } catch (error) {
      console.error("Erreur chargement archives:", error);
    } finally {
      setLoading(false);
    }
  }

  // Obtenir les années disponibles depuis les chantiers
  const availableYears = Array.from(
    new Set(chantiers.map((c) => new Date(c.date_cloture).getFullYear().toString()))
  ).sort((a, b) => parseInt(b) - parseInt(a));

  // Filtrer les chantiers
  const filteredChantiers = chantiers.filter((chantier) => {
    const clotureDate = new Date(chantier.date_cloture);
    const year = clotureDate.getFullYear().toString();
    const month = (clotureDate.getMonth() + 1).toString().padStart(2, "0");

    if (selectedYear && year !== selectedYear) return false;
    if (selectedMonth && month !== selectedMonth) return false;
    return true;
  });

  const months = [
    { value: "01", label: "Janvier" },
    { value: "02", label: "Février" },
    { value: "03", label: "Mars" },
    { value: "04", label: "Avril" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Juin" },
    { value: "07", label: "Juillet" },
    { value: "08", label: "Août" },
    { value: "09", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="mb-6">
        <Link
          href="/chantiers"
          className="text-[var(--color-primary)] hover:underline text-sm inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux chantiers
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Archives</h1>
        <p className="text-[var(--color-muted)]">Chantiers clôturés</p>
      </div>

      {/* Filtres */}
      <div
        className="mb-6 p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-muted)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5" />
          <h2 className="font-semibold">Filtres</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-muted)",
              }}
            >
              <option value="">Toutes les années</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-muted)",
              }}
            >
              <option value="">Tous les mois</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedYear("");
                setSelectedMonth("");
              }}
              className="btn-secondary w-full"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des chantiers archivés */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>
      ) : filteredChantiers.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)]">
            {chantiers.length === 0
              ? "Aucun chantier archivé"
              : "Aucun chantier ne correspond aux filtres sélectionnés"}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-[var(--color-muted)]">
            {filteredChantiers.length} chantier{filteredChantiers.length > 1 ? "s" : ""} trouvé
            {filteredChantiers.length > 1 ? "s" : ""}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChantiers.map((chantier) => (
              <div
                key={chantier.id}
                className="relative p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-muted)",
                }}
                onClick={() => router.push(`/chantiers/${chantier.id}`)}
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1 text-[var(--color-text-secondary)]">
                    {chantier.foret}
                  </h3>
                  <p className="text-sm text-[var(--color-text)]">
                    {chantier.triage} - {chantier.parcelle}
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)]">Début:</span>
                    <span>{new Date(chantier.date_debut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)]">Fin:</span>
                    <span>
                      {chantier.date_fin ? new Date(chantier.date_fin).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)]">Clôturé:</span>
                    <span className="font-medium">
                      {new Date(chantier.date_cloture).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)]">Jours:</span>
                    <span className="font-medium">{chantier.jours.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

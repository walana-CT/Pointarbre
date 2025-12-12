"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

type Chantier = {
  id: string;
  date_debut: string;
  date_fin: string;
  date_cloture: string;
  foret: string;
  triage: string;
  parcelle: string;
  jours: { id: string }[];
};

export default function ChantiersPage() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchChantiers();
  }, []);

  async function fetchChantiers() {
    try {
      const res = await fetch("/api/chantiers");
      if (res.ok) {
        const data = await res.json();
        setChantiers(data);
      }
    } catch (error) {
      console.error("Erreur chargement chantiers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateChantier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/chantiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_debut: formData.get("date_debut"),
          date_fin: formData.get("date_fin"),
          date_cloture: formData.get("date_cloture"),
          foret: formData.get("foret"),
          triage: formData.get("triage"),
          parcelle: formData.get("parcelle"),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        fetchChantiers();
        (e.target as HTMLFormElement).reset();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création chantier:", error);
      alert("Erreur serveur");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="mb-6">
        <Link href="/" className="text-[var(--color-primary)] hover:underline text-sm">
          ← Retour à l'accueil
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Mes chantiers</h1>
          <p className="text-[var(--color-muted)]">
            {chantiers.length} chantier{chantiers.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Nouveau chantier
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div
          className="mb-8 p-6 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Créer un nouveau chantier</h2>
          <form onSubmit={handleCreateChantier} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date début *</label>
                <input
                  type="date"
                  name="date_debut"
                  required
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date fin *</label>
                <input
                  type="date"
                  name="date_fin"
                  required
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date clôture</label>
                <input
                  type="date"
                  name="date_cloture"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Forêt *</label>
                <input
                  type="text"
                  name="foret"
                  required
                  placeholder="Nom de la forêt"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Triage *</label>
                <input
                  type="text"
                  name="triage"
                  required
                  placeholder="Nom du triage"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parcelle *</label>
                <input
                  type="text"
                  name="parcelle"
                  required
                  placeholder="Nom de la parcelle"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Créer le chantier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des chantiers */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>
      ) : chantiers.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)] mb-4">Aucun chantier pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer mon premier chantier
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chantiers.map((chantier) => (
            <div
              key={chantier.id}
              className="p-6 rounded-lg border hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
            >
              <div className="mb-3">
                <h3 className="font-semibold text-lg mb-1">{chantier.foret}</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {chantier.triage} - {chantier.parcelle}
                </p>
              </div>

              <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Début:</span>
                  <span>{new Date(chantier.date_debut).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Fin:</span>
                  <span>{new Date(chantier.date_fin).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Jours:</span>
                  <span className="font-medium">{chantier.jours.length}</span>
                </div>
              </div>

              <Link
                href={`/chantiers/${chantier.id}`}
                className="block text-center btn-secondary w-full"
              >
                Voir détails
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

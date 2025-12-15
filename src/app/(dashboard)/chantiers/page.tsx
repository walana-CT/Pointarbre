"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

type Chantier = {
  id: string;
  date_debut: string;
  date_fin: string | null;
  date_cloture: string | null;
  foret: string;
  triage: string;
  parcelle: string;
  jours: { id: string }[];
};

type Foret = { id: string; name: string; triageId: string };
type Triage = { id: string; name: string };
type Parcelle = { id: string; name: string; foretId: string };

export default function ChantiersPage() {
  const router = useRouter();
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [triages, setTriages] = useState<Triage[]>([]);
  const [forets, setForets] = useState<Foret[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);

  const [selectedTriage, setSelectedTriage] = useState("");
  const [selectedForet, setSelectedForet] = useState("");

  useEffect(() => {
    fetchChantiers();
    fetchTriages();
  }, []);

  useEffect(() => {
    if (selectedTriage) {
      fetchForetsByTriage(selectedTriage);
    } else {
      setForets([]);
      setSelectedForet("");
    }
  }, [selectedTriage]);

  useEffect(() => {
    if (selectedForet) {
      fetchParcellesByForet(selectedForet);
    } else {
      setParcelles([]);
    }
  }, [selectedForet]);

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

  async function fetchTriages() {
    try {
      const res = await fetch("/api/triages");
      if (res.ok) {
        const data = await res.json();
        setTriages(data);
      }
    } catch (error) {
      console.error("Erreur chargement triages:", error);
    }
  }

  async function fetchForetsByTriage(triageId: string) {
    try {
      const res = await fetch(`/api/forets?triageId=${triageId}`);
      if (res.ok) {
        const data = await res.json();
        setForets(data);
      }
    } catch (error) {
      console.error("Erreur chargement forêts:", error);
    }
  }

  async function fetchParcellesByForet(foretId: string) {
    try {
      const res = await fetch(`/api/parcelles?foretId=${foretId}`);
      if (res.ok) {
        const data = await res.json();
        setParcelles(data);
      }
    } catch (error) {
      console.error("Erreur chargement parcelles:", error);
    }
  }

  async function handleCreateChantier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const triageId = formData.get("triage") as string;
    const foretId = formData.get("foret") as string;
    const parcelleId = formData.get("parcelle") as string;

    const triage = triages.find((t) => t.id === triageId);
    const foret = forets.find((f) => f.id === foretId);
    const parcelle = parcelles.find((p) => p.id === parcelleId);

    try {
      const res = await fetch("/api/chantiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_debut: formData.get("date_debut"),
          foret: foret?.name || "",
          triage: triage?.name || "",
          parcelle: parcelle?.name || "",
        }),
      });

      if (res.ok) {
        setShowForm(false);
        fetchChantiers();
        (e.target as HTMLFormElement).reset();
        setSelectedTriage("");
        setSelectedForet("");
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création chantier:", error);
      alert("Erreur serveur");
    }
  }

  async function handleDeleteChantier(chantierId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce chantier ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/chantiers/${chantierId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchChantiers();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression chantier:", error);
      alert("Erreur serveur");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-[var(--color-primary)] hover:underline text-sm">
          ← Retour à l'accueil
        </Link>
        <Link href="/archives" className="text-[var(--color-primary)] hover:underline text-sm">
          Voir les archives →
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[var(--color-text-secondary)] text-3xl sm:text-4xl font-bold mb-2">
            Mes chantiers
          </h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date début</label>
                <input
                  type="date"
                  name="date_debut"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Triage</label>
                <select
                  name="triage"
                  required
                  value={selectedTriage}
                  onChange={(e) => setSelectedTriage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                >
                  <option value="">Sélectionner un triage</option>
                  {triages.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Forêt</label>
                <select
                  name="foret"
                  required
                  value={selectedForet}
                  onChange={(e) => setSelectedForet(e.target.value)}
                  disabled={!selectedTriage}
                  className="w-full px-3 py-2 rounded-lg border disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                >
                  <option value="">Sélectionner une forêt</option>
                  {forets.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parcelle</label>
                <select
                  name="parcelle"
                  required
                  disabled={!selectedForet}
                  className="w-full px-3 py-2 rounded-lg border disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                >
                  <option value="">Sélectionner une parcelle</option>
                  {parcelles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
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
              className="relative p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
              onClick={() => router.push(`/chantiers/${chantier.id}`)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChantier(chantier.id);
                }}
                className="absolute top-4 right-4 btn-danger px-3 py-1"
                title="Supprimer"
              >
                ✕
              </button>

              <div className="mb-3 pr-8">
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
                    {chantier.date_fin
                      ? new Date(chantier.date_fin).toLocaleDateString()
                      : "En cours"}
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
      )}
    </div>
  );
}

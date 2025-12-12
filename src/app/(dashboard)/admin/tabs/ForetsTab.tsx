"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Foret = {
  id: string;
  name: string;
  triageId: string;
  triage: {
    id: string;
    name: string;
  };
  _count: {
    parcelles: number;
  };
};

type Triage = {
  id: string;
  name: string;
};

export default function ForetsTab() {
  const [forets, setForets] = useState<Foret[]>([]);
  const [triages, setTriages] = useState<Triage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formTriageId, setFormTriageId] = useState("");

  useEffect(() => {
    fetchForets();
    fetchTriages();
  }, []);

  async function fetchForets() {
    try {
      const res = await fetch("/api/admin/forets");
      if (res.ok) {
        const data = await res.json();
        setForets(data);
      }
    } catch (error) {
      console.error("Erreur chargement forêts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTriages() {
    try {
      const res = await fetch("/api/admin/triages");
      if (res.ok) {
        const data = await res.json();
        setTriages(data);
      }
    } catch (error) {
      console.error("Erreur chargement triages:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formTriageId) return;

    try {
      const url = editingId ? `/api/admin/forets/${editingId}` : "/api/admin/forets";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, triageId: formTriageId }),
      });

      if (res.ok) {
        fetchForets();
        handleCancel();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur serveur");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer "${name}" ? Toutes ses parcelles seront également supprimées.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/forets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchForets();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur serveur");
    }
  }

  function handleEdit(foret: Foret) {
    setEditingId(foret.id);
    setFormName(foret.name);
    setFormTriageId(foret.triageId);
  }

  function handleCancel() {
    setEditingId(null);
    setFormName("");
    setFormTriageId("");
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Forêts</h2>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle forêt
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && !editingId && (
        <div
          className="mb-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <h3 className="font-semibold mb-3">Nouvelle forêt</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nom de la forêt"
                className="px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-muted)",
                }}
                required
                autoFocus
              />
              <select
                value={formTriageId}
                onChange={(e) => setFormTriageId(e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-muted)",
                }}
                required
              >
                <option value="">Sélectionner un triage</option>
                {triages.map((triage) => (
                  <option key={triage.id} value={triage.id}>
                    {triage.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Créer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormName("");
                  setFormTriageId("");
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {forets.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)]">Aucune forêt</p>
        </div>
      ) : (
        <div className="space-y-2">
          {forets.map((foret) => (
            <div
              key={foret.id}
              className="rounded-lg border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
            >
              {editingId === foret.id ? (
                // Mode édition inline
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nom de la forêt"
                        className="px-3 py-2 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-muted)",
                        }}
                        required
                        autoFocus
                      />
                      <select
                        value={formTriageId}
                        onChange={(e) => setFormTriageId(e.target.value)}
                        className="px-3 py-2 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-muted)",
                        }}
                        required
                      >
                        <option value="">Sélectionner un triage</option>
                        {triages.map((triage) => (
                          <option key={triage.id} value={triage.id}>
                            {triage.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary">
                        Enregistrer
                      </button>
                      <button type="button" onClick={handleCancel} className="btn-secondary">
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // Mode affichage normal
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{foret.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      Triage: {foret.triage.name} • {foret._count.parcelles} parcelle
                      {foret._count.parcelles > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(foret)}
                      className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(foret.id, foret.name)}
                      className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors text-[var(--color-danger)]"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

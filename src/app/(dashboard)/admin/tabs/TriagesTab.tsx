"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Triage = {
  id: string;
  name: string;
  _count: {
    forets: number;
  };
};

export default function TriagesTab() {
  const [triages, setTriages] = useState<Triage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");

  useEffect(() => {
    fetchTriages();
  }, []);

  async function fetchTriages() {
    try {
      const res = await fetch("/api/admin/triages");
      if (res.ok) {
        const data = await res.json();
        setTriages(data);
      }
    } catch (error) {
      console.error("Erreur chargement triages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const url = editingId ? `/api/admin/triages/${editingId}` : "/api/admin/triages";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName }),
      });

      if (res.ok) {
        fetchTriages();
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
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/triages/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTriages();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur serveur");
    }
  }

  function handleEdit(triage: Triage) {
    setEditingId(triage.id);
    setFormName(triage.name);
  }

  function handleCancel() {
    setEditingId(null);
    setFormName("");
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Triages</h2>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau triage
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
          <h3 className="font-semibold mb-3">Nouveau triage</h3>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Nom du triage"
              className="flex-1 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-muted)",
              }}
              required
              autoFocus
            />
            <button type="submit" className="btn-primary">
              Créer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormName("");
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
          </form>
        </div>
      )}

      {/* Liste */}
      {triages.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)]">Aucun triage</p>
        </div>
      ) : (
        <div className="space-y-2">
          {triages.map((triage) => (
            <div
              key={triage.id}
              className="rounded-lg border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
            >
              {editingId === triage.id ? (
                // Mode édition inline
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Nom du triage"
                      className="flex-1 px-3 py-2 rounded-lg border"
                      style={{
                        backgroundColor: "var(--color-bg)",
                        borderColor: "var(--color-muted)",
                      }}
                      required
                      autoFocus
                    />
                    <button type="submit" className="btn-primary">
                      Enregistrer
                    </button>
                    <button type="button" onClick={handleCancel} className="btn-secondary">
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                // Mode affichage normal
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{triage.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      {triage._count.forets} forêt{triage._count.forets > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(triage)}
                      className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(triage.id, triage.name)}
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

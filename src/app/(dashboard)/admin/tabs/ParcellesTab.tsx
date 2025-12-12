"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Parcelle = {
  id: string;
  name: string;
  foretId: string;
  foret: {
    id: string;
    name: string;
    triage: {
      id: string;
      name: string;
    };
  };
};

type Foret = {
  id: string;
  name: string;
  triageId: string;
};

export default function ParcellesTab() {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [forets, setForets] = useState<Foret[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formForetId, setFormForetId] = useState("");

  useEffect(() => {
    fetchParcelles();
    fetchForets();
  }, []);

  async function fetchParcelles() {
    try {
      const res = await fetch("/api/admin/parcelles");
      if (res.ok) {
        const data = await res.json();
        setParcelles(data);
      }
    } catch (error) {
      console.error("Erreur chargement parcelles:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchForets() {
    try {
      const res = await fetch("/api/admin/forets");
      if (res.ok) {
        const data = await res.json();
        setForets(data);
      }
    } catch (error) {
      console.error("Erreur chargement forêts:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formForetId) return;

    try {
      const url = editingId ? `/api/admin/parcelles/${editingId}` : "/api/admin/parcelles";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, foretId: formForetId }),
      });

      if (res.ok) {
        fetchParcelles();
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
      const res = await fetch(`/api/admin/parcelles/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchParcelles();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur serveur");
    }
  }

  function handleEdit(parcelle: Parcelle) {
    setEditingId(parcelle.id);
    setFormName(parcelle.name);
    setFormForetId(parcelle.foretId);
  }

  function handleCancel() {
    setEditingId(null);
    setFormName("");
    setFormForetId("");
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Parcelles</h2>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle parcelle
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
          <h3 className="font-semibold mb-3">Nouvelle parcelle</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nom de la parcelle"
                className="px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-muted)",
                }}
                required
                autoFocus
              />
              <select
                value={formForetId}
                onChange={(e) => setFormForetId(e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-muted)",
                }}
                required
              >
                <option value="">Sélectionner une forêt</option>
                {forets.map((foret) => (
                  <option key={foret.id} value={foret.id}>
                    {foret.name}
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
                  setFormForetId("");
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
      {parcelles.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)]">Aucune parcelle</p>
        </div>
      ) : (
        <div className="space-y-2">
          {parcelles.map((parcelle) => (
            <div
              key={parcelle.id}
              className="rounded-lg border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
            >
              {editingId === parcelle.id ? (
                // Mode édition inline
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nom de la parcelle"
                        className="px-3 py-2 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-muted)",
                        }}
                        required
                        autoFocus
                      />
                      <select
                        value={formForetId}
                        onChange={(e) => setFormForetId(e.target.value)}
                        className="px-3 py-2 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-muted)",
                        }}
                        required
                      >
                        <option value="">Sélectionner une forêt</option>
                        {forets.map((foret) => (
                          <option key={foret.id} value={foret.id}>
                            {foret.name}
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
                    <h3 className="font-semibold">{parcelle.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      Forêt: {parcelle.foret.name} • Triage: {parcelle.foret.triage.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(parcelle)}
                      className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(parcelle.id, parcelle.name)}
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

"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Agence = {
  id: string;
  name: string;
  _count: {
    users: number;
    uts: number;
  };
};

export default function AgencesTab() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");

  useEffect(() => {
    fetchAgences();
  }, []);

  async function fetchAgences() {
    try {
      const res = await fetch("/api/admin/agences");
      if (res.ok) {
        const data = await res.json();
        setAgences(data);
      }
    } catch (error) {
      console.error("Erreur chargement agences:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const url = editingId ? `/api/admin/agences/${editingId}` : "/api/admin/agences";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName }),
      });

      if (res.ok) {
        fetchAgences();
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
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'agence "${name}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/agences/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchAgences();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur serveur");
    }
  }

  function handleEdit(agence: Agence) {
    setEditingId(agence.id);
    setFormName(agence.name);
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
        <h2 className="text-2xl font-bold">Agences</h2>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle agence
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
          <h3 className="font-semibold mb-3">Nouvelle agence</h3>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Nom de l'agence"
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
      {agences.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)]">Aucune agence</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agences.map((agence) => (
            <div
              key={agence.id}
              className="rounded-lg border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
            >
              {editingId === agence.id ? (
                // Mode édition inline
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Nom de l'agence"
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
                    <h3 className="font-semibold">{agence.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      {agence._count.users} utilisateur{agence._count.users > 1 ? "s" : ""} •{" "}
                      {agence._count.uts} UT{agence._count.uts > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(agence)}
                      className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(agence.id, agence.name)}
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

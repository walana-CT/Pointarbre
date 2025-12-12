"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type UT = {
  id: string;
  number: string;
  _count: {
    users: number;
    agences: number;
  };
};

export default function UTsTab() {
  const [uts, setUts] = useState<UT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNumber, setFormNumber] = useState("");

  useEffect(() => {
    fetchUTs();
  }, []);

  async function fetchUTs() {
    try {
      const res = await fetch("/api/admin/uts");
      if (res.ok) {
        const data = await res.json();
        setUts(data);
      }
    } catch (error) {
      console.error("Erreur chargement UTs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formNumber.trim()) return;

    try {
      const url = editingId ? `/api/admin/uts/${editingId}` : "/api/admin/uts";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: formNumber }),
      });

      if (res.ok) {
        fetchUTs();
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

  async function handleDelete(id: string, number: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'UT "${number}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/uts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUTs();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur serveur");
    }
  }

  function handleEdit(ut: UT) {
    setEditingId(ut.id);
    setFormNumber(ut.number);
  }

  function handleCancel() {
    setEditingId(null);
    setFormNumber("");
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Unités Territoriales (UT)</h2>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle UT
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
          <h3 className="font-semibold mb-3">Nouvelle UT</h3>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={formNumber}
              onChange={(e) => setFormNumber(e.target.value)}
              placeholder="Numéro de l'UT"
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
                setFormNumber("");
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
          </form>
        </div>
      )}

      {/* Liste */}
      {uts.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)]">Aucune UT</p>
        </div>
      ) : (
        <div className="space-y-2">
          {uts.map((ut) => (
            <div
              key={ut.id}
              className="rounded-lg border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
            >
              {editingId === ut.id ? (
                // Mode édition inline
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      placeholder="Numéro de l'UT"
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
                    <h3 className="font-semibold">UT {ut.number}</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      {ut._count.users} utilisateur{ut._count.users > 1 ? "s" : ""} •{" "}
                      {ut._count.agences} agence{ut._count.agences > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ut)}
                      className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ut.id, ut.number)}
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

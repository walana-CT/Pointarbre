"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type User = {
  id: number;
  email: string;
  name: string | null;
  role: "CMO" | "OUVRIER";
  isDisabled: boolean;
  agenceId: string | null;
  agence: {
    id: string;
    name: string;
  } | null;
  ut: {
    id: string;
    number: string;
  }[];
};

type Agence = {
  id: string;
  name: string;
};

type UT = {
  id: string;
  number: string;
};

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [uts, setUts] = useState<UT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "OUVRIER" as "CMO" | "OUVRIER",
    agenceId: "",
    utIds: [] as string[],
    isDisabled: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAgences();
    fetchUTs();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAgences() {
    try {
      const res = await fetch("/api/admin/agences");
      if (res.ok) {
        const data = await res.json();
        setAgences(data);
      }
    } catch (error) {
      console.error("Erreur chargement agences:", error);
    }
  }

  async function fetchUTs() {
    try {
      const res = await fetch("/api/admin/uts");
      if (res.ok) {
        const data = await res.json();
        setUts(data);
      }
    } catch (error) {
      console.error("Erreur chargement UTs:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email.trim() || (!editingId && !formData.password.trim())) {
      alert("Email et mot de passe requis");
      return;
    }

    try {
      const url = editingId ? `/api/admin/users/${editingId}` : "/api/admin/users";
      const method = editingId ? "PATCH" : "POST";

      const payload: any = {
        email: formData.email,
        name: formData.name || null,
        role: formData.role,
        agenceId: formData.agenceId || null,
        utIds: formData.utIds,
        isDisabled: formData.isDisabled,
      };

      // N'envoyer le mot de passe que s'il est fourni
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchUsers();
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

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${email}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur serveur");
    }
  }

  function handleEdit(user: User) {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      name: user.name || "",
      password: "", // Ne pas pré-remplir le mot de passe
      role: user.role,
      agenceId: user.agenceId || "",
      utIds: user.ut.map((ut) => ut.id),
      isDisabled: user.isDisabled,
    });
    setShowPassword(false);
  }

  function handleCancel() {
    setEditingId(null);
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "OUVRIER",
      agenceId: "",
      utIds: [],
      isDisabled: false,
    });
    setShowPassword(false);
  }

  function toggleUT(utId: string) {
    setFormData((prev) => ({
      ...prev,
      utIds: prev.utIds.includes(utId)
        ? prev.utIds.filter((id) => id !== utId)
        : [...prev.utIds, utId],
    }));
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>;
  }

  const renderForm = (isInline: boolean = false) => (
    <form onSubmit={handleSubmit} className={isInline ? "p-4" : "space-y-3"}>
      <div className={isInline ? "space-y-3" : ""}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-muted)",
            }}
            required
            autoFocus
          />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nom (optionnel)"
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-muted)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingId ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
              className="w-full px-3 py-2 rounded-lg border pr-10"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-muted)",
              }}
              required={!editingId}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--color-surface)] rounded"
              title={showPassword ? "Masquer" : "Afficher"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as "CMO" | "OUVRIER" })
            }
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-muted)",
            }}
            required
          >
            <option value="OUVRIER">Ouvrier</option>
            <option value="CMO">CMO</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={formData.agenceId}
            onChange={(e) => setFormData({ ...formData, agenceId: e.target.value })}
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-muted)",
            }}
          >
            <option value="">Aucune agence</option>
            {agences.map((agence) => (
              <option key={agence.id} value={agence.id}>
                {agence.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3 py-2">
            <input
              type="checkbox"
              id="isDisabled"
              checked={formData.isDisabled}
              onChange={(e) => setFormData({ ...formData, isDisabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isDisabled" className="text-sm">
              Compte désactivé
            </label>
          </div>
        </div>

        {uts.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">UTs assignées :</label>
            <div className="flex flex-wrap gap-2">
              {uts.map((ut) => (
                <button
                  key={ut.id}
                  type="button"
                  onClick={() => toggleUT(ut.id)}
                  className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                    formData.utIds.includes(ut.id)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-muted)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  UT {ut.number}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn-primary">
          {editingId ? "Enregistrer" : "Créer"}
        </button>
        <button
          type="button"
          onClick={
            isInline
              ? handleCancel
              : () => {
                  setShowForm(false);
                  handleCancel();
                }
          }
          className="btn-secondary"
        >
          Annuler
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Utilisateurs</h2>
        <button
          onClick={() => {
            handleCancel();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
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
          <h3 className="font-semibold mb-3">Nouvel utilisateur</h3>
          {renderForm(false)}
        </div>
      )}

      {/* Liste */}
      {users.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)]">Aucun utilisateur</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-muted)",
              }}
            >
              {editingId === user.id ? (
                // Mode édition inline
                renderForm(true)
              ) : (
                // Mode affichage normal
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.email}</h3>
                      {user.isDisabled && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                          Désactivé
                        </span>
                      )}
                      <span
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                          backgroundColor:
                            user.role === "CMO" ? "var(--color-info-bg)" : "var(--color-surface)",
                          color: user.role === "CMO" ? "var(--color-info)" : "var(--color-muted)",
                        }}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-muted)] mt-1">
                      {user.name && <span>{user.name} • </span>}
                      {user.agence && <span>Agence: {user.agence.name} • </span>}
                      {user.ut.length > 0 && (
                        <span>UTs: {user.ut.map((ut) => ut.number).join(", ")}</span>
                      )}
                      {!user.agence && user.ut.length === 0 && <span>Aucune affectation</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
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

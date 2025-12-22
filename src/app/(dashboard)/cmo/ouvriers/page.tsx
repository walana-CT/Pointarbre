"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, X, Users, Search } from "lucide-react";

interface Ouvrier {
  id: number;
  name: string;
  email: string;
  isDisabled: boolean;
  attributionId?: string;
  attributedAt?: Date;
}

interface OuvriersData {
  attributedOuvriers: Ouvrier[];
  availableOuvriers: Ouvrier[];
}

export default function OuvriersPage() {
  const router = useRouter();
  const [data, setData] = useState<OuvriersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const fetchOuvriers = async () => {
    try {
      const res = await fetch("/api/cmo/ouvriers");
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/");
          return;
        }
        throw new Error("Erreur lors du chargement");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOuvriers();
  }, []);

  const handleAddOuvrier = async (ouvrierId: number) => {
    setActionLoading(ouvrierId);
    try {
      const res = await fetch("/api/cmo/ouvriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ouvrierId }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de l'ajout");
      }

      await fetchOuvriers();
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'ajout");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveOuvrier = async (attributionId: string) => {
    if (!confirm("Retirer cet ouvrier de votre liste ?")) return;

    setActionLoading(-1);
    try {
      const res = await fetch(`/api/cmo/ouvriers?attributionId=${attributionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la suppression");
      }

      await fetchOuvriers();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  // Filtrer les ouvriers par nom ou email
  const filteredAttributedOuvriers = useMemo(() => {
    if (!data?.attributedOuvriers) return [];
    if (!searchFilter.trim()) return data.attributedOuvriers;

    const search = searchFilter.toLowerCase();
    return data.attributedOuvriers.filter(
      (ouvrier) =>
        ouvrier.name?.toLowerCase().includes(search) ||
        ouvrier.email?.toLowerCase().includes(search)
    );
  }, [data?.attributedOuvriers, searchFilter]);

  const filteredAvailableOuvriers = useMemo(() => {
    if (!data?.availableOuvriers) return [];
    if (!searchFilter.trim()) return data.availableOuvriers;

    const search = searchFilter.toLowerCase();
    return data.availableOuvriers.filter(
      (ouvrier) =>
        ouvrier.name?.toLowerCase().includes(search) ||
        ouvrier.email?.toLowerCase().includes(search)
    );
  }, [data?.availableOuvriers, searchFilter]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        <p style={{ color: "var(--color-error)" }}>{error}</p>
        <Link href="/cmo" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          <ArrowLeft size={18} /> Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/cmo" className="btn btn-secondary" style={{ marginBottom: "1rem" }}>
          <ArrowLeft size={18} /> Retour au CMO
        </Link>
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Users size={32} /> Gestion des ouvriers
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Gérez la liste des ouvriers qui vous sont attribués
        </p>
      </div>

      {/* Champ de recherche */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-secondary)",
            }}
          />
          <input
            type="text"
            placeholder="Rechercher un ouvrier par nom ou email..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 0.75rem 0.75rem 2.5rem",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              backgroundColor: "var(--color-input-bg)",
              color: "var(--color-text)",
              fontSize: "0.95rem",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Colonne gauche : Ouvriers attribués */}
        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--color-primary)" }}>
            Mes ouvriers ({filteredAttributedOuvriers.length}
            {searchFilter && ` / ${data?.attributedOuvriers.length || 0}`})
          </h2>

          {!filteredAttributedOuvriers.length ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "var(--color-background-secondary)",
                borderRadius: "8px",
                color: "var(--color-text-secondary)",
              }}
            >
              <Users size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p>
                {searchFilter
                  ? "Aucun ouvrier ne correspond à votre recherche"
                  : "Aucun ouvrier attribué pour le moment"}
              </p>
              {!searchFilter && (
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Ajoutez des ouvriers depuis la liste disponible →
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredAttributedOuvriers.map((ouvrier) => (
                <div
                  key={ouvrier.id}
                  style={{
                    padding: "1rem",
                    backgroundColor: "var(--color-background-secondary)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: ouvrier.isDisabled
                      ? "2px solid var(--color-error)"
                      : "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                      {ouvrier.name || "Sans nom"}
                      {ouvrier.isDisabled && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.75rem",
                            padding: "0.125rem 0.5rem",
                            backgroundColor: "var(--color-error)",
                            color: "white",
                            borderRadius: "4px",
                          }}
                        >
                          Désactivé
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                      {ouvrier.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveOuvrier(ouvrier.attributionId!)}
                    disabled={actionLoading === -1}
                    className="btn btn-danger"
                    style={{
                      padding: "0.5rem",
                      minWidth: "auto",
                    }}
                    title="Retirer cet ouvrier"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite : Ouvriers disponibles */}
        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--color-success)" }}>
            Ouvriers disponibles ({filteredAvailableOuvriers.length}
            {searchFilter && ` / ${data?.availableOuvriers.length || 0}`})
          </h2>

          {!filteredAvailableOuvriers.length ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "var(--color-background-secondary)",
                borderRadius: "8px",
                color: "var(--color-text-secondary)",
              }}
            >
              <p>
                {searchFilter
                  ? "Aucun ouvrier disponible ne correspond à votre recherche"
                  : "Tous les ouvriers sont déjà attribués"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredAvailableOuvriers.map((ouvrier) => (
                <div
                  key={ouvrier.id}
                  style={{
                    padding: "1rem",
                    backgroundColor: "var(--color-background-secondary)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: ouvrier.isDisabled
                      ? "2px solid var(--color-warning)"
                      : "1px solid var(--color-border)",
                    opacity: ouvrier.isDisabled ? 0.7 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                      {ouvrier.name || "Sans nom"}
                      {ouvrier.isDisabled && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.75rem",
                            padding: "0.125rem 0.5rem",
                            backgroundColor: "var(--color-warning)",
                            color: "white",
                            borderRadius: "4px",
                          }}
                        >
                          Désactivé
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                      {ouvrier.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddOuvrier(ouvrier.id)}
                    disabled={actionLoading === ouvrier.id}
                    className="btn btn-success"
                    style={{
                      padding: "0.5rem",
                      minWidth: "auto",
                    }}
                    title="Ajouter cet ouvrier"
                  >
                    {actionLoading === ouvrier.id ? "..." : <UserPlus size={18} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

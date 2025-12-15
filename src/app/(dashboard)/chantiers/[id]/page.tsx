"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, ArrowLeft, ChevronRight, ChevronDown, Truck, Utensils } from "lucide-react";

type Phase = {
  id: string;
  type: string;
  duree: string;
};

type Jour = {
  id: string;
  date: string;
  h_rendement: number | null;
  location_materiel: number | null;
  ind_kilometrique: number | null;
  transport_materiel: boolean;
  panier: boolean;
  phases: Phase[];
};

type Chantier = {
  id: string;
  date_debut: string;
  date_fin: string | null;
  date_cloture: string | null;
  foret: string;
  triage: string;
  parcelle: string;
};

type TypePhase = {
  id: string;
  name: string;
  description: string | null;
};

export default function ChantierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chantierId = params.id as string;

  const [chantier, setChantier] = useState<Chantier | null>(null);
  const [jours, setJours] = useState<Jour[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJourId, setExpandedJourId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPhaseForm, setShowPhaseForm] = useState<string | null>(null);
  const [typesPhases, setTypesPhases] = useState<TypePhase[]>([]);
  const [copiedJourData, setCopiedJourData] = useState<Partial<Jour> | null>(null);

  useEffect(() => {
    fetchChantier();
    fetchJours();
  }, [chantierId]);

  useEffect(() => {
    fetchTypesPhases();
  }, []);

  async function fetchChantier() {
    try {
      const res = await fetch(`/api/chantiers/${chantierId}`);
      if (res.ok) {
        const data = await res.json();
        setChantier(data);
      }
    } catch (error) {
      console.error("Erreur chargement chantier:", error);
    }
  }

  async function fetchJours() {
    try {
      const res = await fetch(`/api/chantiers/${chantierId}/jours`);
      if (res.ok) {
        const data = await res.json();
        setJours(data);
      }
    } catch (error) {
      console.error("Erreur chargement jours:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTypesPhases() {
    try {
      const res = await fetch("/api/types-phases");
      if (res.ok) {
        const data = await res.json();
        setTypesPhases(data);
      }
    } catch (error) {
      console.error("Erreur chargement types phases:", error);
    }
  }

  function getNextWorkingDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Si c'est dimanche (0), passer au lundi
    if (nextDay.getDay() === 0) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  function getDefaultDate(): string {
    if (!chantier) return new Date().toISOString().split("T")[0];

    // Si aucun jour, utiliser la date de début du chantier
    if (jours.length === 0) {
      return new Date(chantier.date_debut).toISOString().split("T")[0];
    }

    // Sinon, utiliser le lendemain du dernier jour (en excluant les dimanches)
    const lastJour = jours.reduce((latest, jour) => {
      const jourDate = new Date(jour.date);
      const latestDate = new Date(latest.date);
      return jourDate > latestDate ? jour : latest;
    }, jours[0]);

    const nextDate = getNextWorkingDay(new Date(lastJour.date));
    return nextDate.toISOString().split("T")[0];
  }

  function handleCopyLastJour() {
    if (jours.length === 0) return;

    const lastJour = jours.reduce((latest, jour) => {
      const jourDate = new Date(jour.date);
      const latestDate = new Date(latest.date);
      return jourDate > latestDate ? jour : latest;
    }, jours[0]);

    setCopiedJourData({
      h_rendement: lastJour.h_rendement,
      location_materiel: lastJour.location_materiel,
      ind_kilometrique: lastJour.ind_kilometrique,
      transport_materiel: lastJour.transport_materiel,
      panier: lastJour.panier,
    });
  }

  async function handleCreateJour(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/chantiers/${chantierId}/jours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.get("date"),
          h_rendement: formData.get("h_rendement"),
          location_materiel: formData.get("location_materiel"),
          ind_kilometrique: formData.get("ind_kilometrique"),
          transport_materiel: formData.get("transport_materiel") === "on",
          panier: formData.get("panier") === "on",
        }),
      });

      if (res.ok) {
        const newJour = await res.json();
        setShowCreateForm(false);
        setCopiedJourData(null);
        fetchJours();
        setExpandedJourId(newJour.id);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création jour:", error);
      alert("Erreur serveur");
    }
  }

  async function handleUpdateJour(jourId: string, formData: FormData) {
    try {
      const res = await fetch(`/api/jours/${jourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          h_rendement: formData.get("h_rendement"),
          location_materiel: formData.get("location_materiel"),
          ind_kilometrique: formData.get("ind_kilometrique"),
          transport_materiel: formData.get("transport_materiel") === "on",
          panier: formData.get("panier") === "on",
        }),
      });

      if (res.ok) {
        fetchJours();
        setExpandedJourId(null);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur mise à jour jour:", error);
      alert("Erreur serveur");
    }
  }

  async function handleDeleteJour(jourId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce jour ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/jours/${jourId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchJours();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression jour:", error);
      alert("Erreur serveur");
    }
  }

  async function handleFinalizeChantier() {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir finaliser ce chantier ? La date de fin sera fixée au jour le plus récent."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/chantiers/${chantierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finalize" }),
      });

      if (res.ok) {
        router.push("/chantiers");
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la finalisation");
      }
    } catch (error) {
      console.error("Erreur finalisation chantier:", error);
      alert("Erreur serveur");
    }
  }

  async function handleReopenChantier() {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir rouvrir ce chantier ? Les dates de fin et de clôture seront supprimées."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/chantiers/${chantierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen" }),
      });

      if (res.ok) {
        fetchChantier();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la réouverture");
      }
    } catch (error) {
      console.error("Erreur réouverture chantier:", error);
      alert("Erreur serveur");
    }
  }

  async function handleCreatePhase(jourId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/jours/${jourId}/phases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          hours: formData.get("hours"),
          minutes: formData.get("minutes"),
        }),
      });

      if (res.ok) {
        setShowPhaseForm(null);
        fetchJours();
        (e.target as HTMLFormElement).reset();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création phase:", error);
      alert("Erreur serveur");
    }
  }

  async function handleDeletePhase(phaseId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette phase ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/phases/${phaseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchJours();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression phase:", error);
      alert("Erreur serveur");
    }
  }

  function calculateTotalDuration(phases: Phase[]): string {
    if (phases.length === 0) return "0h00";

    let totalMinutes = 0;
    phases.forEach((phase) => {
      const dureeDate = new Date(phase.duree);
      totalMinutes += dureeDate.getHours() * 60 + dureeDate.getMinutes();
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-[var(--color-muted)]">Chargement...</div>
      </div>
    );
  }

  if (!chantier) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-[var(--color-muted)]">Chantier introuvable</div>
      </div>
    );
  }

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

      {/* En-tête du chantier */}
      <div
        className="mb-8 p-6 rounded-lg border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-muted)",
        }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{chantier.foret}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--color-muted)]">Triage:</span>
            <p className="font-medium">{chantier.triage}</p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Parcelle:</span>
            <p className="font-medium">{chantier.parcelle}</p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Début:</span>
            <p className="font-medium">{new Date(chantier.date_debut).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Fin:</span>
            <p className="font-medium">
              {chantier.date_fin ? new Date(chantier.date_fin).toLocaleDateString() : "En cours"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Jours de travail</h2>
          <p className="text-[var(--color-muted)]">
            {jours.length} jour{jours.length > 1 ? "s" : ""} enregistré{jours.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          {chantier.date_fin ? (
            <button
              onClick={handleReopenChantier}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              Rouvrir chantier
            </button>
          ) : (
            jours.length > 0 && (
              <button
                onClick={handleFinalizeChantier}
                className="btn-secondary flex items-center gap-2 justify-center"
              >
                Finir chantier
              </button>
            )
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={!!chantier.date_fin}
            className="btn-primary flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Nouveau jour
          </button>
        </div>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div
          className="mb-8 p-6 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Créer un nouveau jour</h3>
            {jours.length > 0 && (
              <button type="button" onClick={handleCopyLastJour} className="btn-secondary text-sm">
                Copier jour précédent
              </button>
            )}
          </div>
          <form onSubmit={handleCreateJour} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  key={copiedJourData ? "copied" : "default"}
                  defaultValue={getDefaultDate()}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">H. rendement</label>
                <input
                  type="number"
                  name="h_rendement"
                  min="0"
                  placeholder="0"
                  key={copiedJourData ? "copied-h" : "default-h"}
                  defaultValue={copiedJourData?.h_rendement ?? ""}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location matériel</label>
                <input
                  type="number"
                  name="location_materiel"
                  min="0"
                  placeholder="0"
                  key={copiedJourData ? "copied-loc" : "default-loc"}
                  defaultValue={copiedJourData?.location_materiel ?? ""}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ind. kilométrique</label>
                <input
                  type="number"
                  name="ind_kilometrique"
                  min="0"
                  placeholder="0"
                  key={copiedJourData ? "copied-km" : "default-km"}
                  defaultValue={copiedJourData?.ind_kilometrique ?? ""}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-muted)",
                  }}
                />
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="transport_materiel"
                    key={copiedJourData ? "copied-trans" : "default-trans"}
                    defaultChecked={copiedJourData?.transport_materiel ?? false}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Transport matériel</span>
                </label>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="panier"
                    key={copiedJourData ? "copied-panier" : "default-panier"}
                    defaultChecked={copiedJourData?.panier ?? false}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Panier</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCopiedJourData(null);
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Créer le jour
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des jours */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-muted)]">Chargement...</div>
      ) : jours.length === 0 && !showCreateForm ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-muted)",
          }}
        >
          <p className="text-[var(--color-muted)] mb-4">Aucun jour enregistré</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer le premier jour
          </button>
        </div>
      ) : jours.length > 0 ? (
        <div className="space-y-4">
          {jours.map((jour) => {
            const isExpanded = expandedJourId === jour.id;
            return (
              <div
                key={jour.id}
                className="rounded-lg border"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-muted)",
                }}
              >
                {/* En-tête de la ligne - toujours visible */}
                <div
                  className="p-4 cursor-pointer hover:bg-[var(--color-bg)] transition-colors outline-none focus:outline-none rounded-lg"
                  onClick={() => setExpandedJourId(isExpanded ? null : jour.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg">
                          {new Date(jour.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                        <div className="flex items-center gap-2">
                          {jour.transport_materiel && (
                            <span
                              className="inline-flex items-center text-[var(--color-muted)]"
                              title="Transport de matériel"
                            >
                              <Truck className="w-4 h-4" />
                            </span>
                          )}
                          {jour.panier && (
                            <span className="inline-flex items-center text-[var(--color-muted)]" 
                                  title="Panier repas"
                            >
                              <Utensils className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
                        <span>
                          <span className="font-medium text-[var(--color-text)]">H. rend:</span> {jour.h_rendement ?? 0}
                        </span>
                        <span>
                          <span className="font-medium text-[var(--color-text)]">Location:</span>{" "}
                          {jour.location_materiel ?? 0}€
                        </span>
                        <span>
                          <span className="font-medium text-[var(--color-text)]">Km:</span> {jour.ind_kilometrique ?? 0}
                        </span>
                        <span>
                          <span className="font-medium text-[var(--color-text)]">Phases:</span> {jour.phases.length}
                        </span>
                        <span className="col-span-2">
                          <span className="font-medium text-[var(--color-text)]">Durée:</span>{" "}
                          {calculateTotalDuration(jour.phases)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!chantier.date_fin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJour(jour.id);
                          }}
                          className="btn-danger px-3 py-1 text-sm"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-[var(--color-muted)]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[var(--color-muted)]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulaire d'édition - visible quand développé */}
                {isExpanded && (
                  <div className="border-t p-6" style={{ borderColor: "var(--color-muted)" }}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUpdateJour(jour.id, formData);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Date</label>
                          <input
                            type="date"
                            value={new Date(jour.date).toISOString().split("T")[0]}
                            disabled
                            className="w-full px-3 py-2 rounded-lg border opacity-60 cursor-not-allowed"
                            style={{
                              backgroundColor: "var(--color-bg)",
                              borderColor: "var(--color-muted)",
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">H. rendement</label>
                          <input
                            type="number"
                            name="h_rendement"
                            min="0"
                            defaultValue={jour.h_rendement || ""}
                            placeholder="0"
                            disabled={!!chantier.date_fin}
                            className="w-full px-3 py-2 rounded-lg border disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: "var(--color-bg)",
                              borderColor: "var(--color-muted)",
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Location matériel
                          </label>
                          <input
                            type="number"
                            name="location_materiel"
                            min="0"
                            defaultValue={jour.location_materiel || ""}
                            placeholder="0"
                            disabled={!!chantier.date_fin}
                            className="w-full px-3 py-2 rounded-lg border disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: "var(--color-bg)",
                              borderColor: "var(--color-muted)",
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Ind. kilométrique
                          </label>
                          <input
                            type="number"
                            name="ind_kilometrique"
                            min="0"
                            defaultValue={jour.ind_kilometrique || ""}
                            placeholder="0"
                            disabled={!!chantier.date_fin}
                            className="w-full px-3 py-2 rounded-lg border disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: "var(--color-bg)",
                              borderColor: "var(--color-muted)",
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="transport_materiel"
                              defaultChecked={jour.transport_materiel}
                              disabled={!!chantier.date_fin}
                              className="w-4 h-4 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm">Transport matériel</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="panier"
                              defaultChecked={jour.panier}
                              disabled={!!chantier.date_fin}
                              className="w-4 h-4 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm">Panier</span>
                          </label>
                        </div>
                      </div>

                      {!chantier.date_fin && (
                        <div className="flex gap-3 justify-end">
                          <button type="submit" className="btn-primary">
                            Enregistrer
                          </button>
                        </div>
                      )}
                    </form>

                    {/* Section phases */}
                    <div
                      className="border-t mt-6 pt-6"
                      style={{ borderColor: "var(--color-muted)" }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">
                          Phases ({jour.phases.length}) - Durée totale:{" "}
                          {calculateTotalDuration(jour.phases)}
                        </h4>
                        {!chantier.date_fin && (
                          <button
                            onClick={() =>
                              setShowPhaseForm(showPhaseForm === jour.id ? null : jour.id)
                            }
                            className="btn-primary text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter phase
                          </button>
                        )}
                      </div>

                      {/* Formulaire d'ajout de phase */}
                      {showPhaseForm === jour.id && (
                        <div
                          className="mb-4 p-4 rounded-lg border"
                          style={{
                            backgroundColor: "var(--color-bg)",
                            borderColor: "var(--color-muted)",
                          }}
                        >
                          <form
                            onSubmit={(e) => handleCreatePhase(jour.id, e)}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Type *</label>
                                <select
                                  name="type"
                                  required
                                  className="w-full px-3 py-2 rounded-lg border"
                                  style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-muted)",
                                  }}
                                >
                                  <option value="">Sélectionner un type</option>
                                  {typesPhases.map((tp) => (
                                    <option key={tp.id} value={tp.name}>
                                      {tp.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Heures *</label>
                                <input
                                  type="number"
                                  name="hours"
                                  required
                                  min="0"
                                  max="23"
                                  defaultValue="0"
                                  className="w-full px-3 py-2 rounded-lg border"
                                  style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-muted)",
                                  }}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Minutes *</label>
                                <input
                                  type="number"
                                  name="minutes"
                                  required
                                  min="0"
                                  max="59"
                                  defaultValue="0"
                                  className="w-full px-3 py-2 rounded-lg border"
                                  style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-muted)",
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setShowPhaseForm(null)}
                                className="btn-secondary text-sm"
                              >
                                Annuler
                              </button>
                              <button type="submit" className="btn-primary text-sm">
                                Ajouter
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Liste des phases */}
                      {jour.phases.length > 0 && (
                        <div className="space-y-2">
                          {jour.phases.map((phase) => {
                            const dureeDate = new Date(phase.duree);
                            const hours = dureeDate.getHours();
                            const minutes = dureeDate.getMinutes();
                            return (
                              <div
                                key={phase.id}
                                className="flex justify-between items-center text-sm p-2 rounded group"
                                style={{ backgroundColor: "var(--color-bg)" }}
                              >
                                <span>{phase.type}</span>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {hours}h{minutes.toString().padStart(2, "0")}
                                  </span>
                                  {!chantier.date_fin && (
                                    <button
                                      onClick={() => handleDeletePhase(phase.id)}
                                      className="opacity-0 group-hover:opacity-100 text-[var(--color-danger)] hover:text-red-700 transition-opacity"
                                      title="Supprimer"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

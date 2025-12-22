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
  foret: string;
  triage: string;
  parcelle: string;
};

type TypePhase = {
  id: string;
  name: string;
  description: string | null;
};

// Utilitaire pour trouver le dernier jour
function getLatestJour(jours: Jour[]): Jour | null {
  if (jours.length === 0) return null;
  return jours.reduce((latest, jour) => {
    const jourDate = new Date(jour.date);
    const latestDate = new Date(latest.date);
    return jourDate > latestDate ? jour : latest;
  }, jours[0]);
}

// Utilitaire pour parser la durée HH:MM
function parseDuration(duree: string): [string, string] {
  if (!duree) return ["0", "0"];
  const parts = duree.split(":");
  return [parts[0] || "0", parts[1] || "0"];
}

// Utilitaire pour formater la durée
function formatDuration(hours: string, minutes: string): string {
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

// Utilitaire pour calculer la durée totale des phases
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

// Utilitaire pour convertir une durée (date/string) en format HH:MM
function convertDureeToHHMM(duree: string): string {
  const dureeDate = new Date(duree);
  const hours = dureeDate.getHours();
  const minutes = dureeDate.getMinutes();
  return formatDuration(hours.toString(), minutes.toString());
}

// Composant pour le formulaire d'ajout de phase (jours existants)
function PhaseAddForm({
  typesPhases,
  onSubmit,
  onCancel,
}: {
  typesPhases: TypePhase[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="mb-4 p-4 rounded-lg border"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-muted)",
      }}
    >
      <form onSubmit={onSubmit} className="space-y-3">
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
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">
            Annuler
          </button>
          <button type="submit" className="btn-primary text-sm">
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}

// Composant pour les champs du formulaire jour
function JourFormFields({
  showDate = false,
  defaultDate,
  defaultValues,
  disabled = false,
}: {
  showDate?: boolean;
  defaultDate?: string;
  defaultValues?: {
    h_rendement?: number | null;
    location_materiel?: number | null;
    ind_kilometrique?: number | null;
    transport_materiel?: boolean;
    panier?: boolean;
  };
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {showDate && (
        <div>
          <label className="block text-sm font-medium mb-1">Date {!disabled && "*"}</label>
          <input
            type="date"
            name="date"
            required={!disabled}
            disabled={disabled}
            {...(disabled ? { value: defaultDate } : { defaultValue: defaultDate })}
            className={`w-full px-3 py-2 rounded-lg border ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-muted)",
            }}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">H. rendement</label>
        <input
          type="number"
          name="h_rendement"
          min="0"
          placeholder="0"
          defaultValue={defaultValues?.h_rendement || ""}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-lg border ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
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
          defaultValue={defaultValues?.location_materiel || ""}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-lg border ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
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
          defaultValue={defaultValues?.ind_kilometrique || ""}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-lg border ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
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
            defaultChecked={defaultValues?.transport_materiel}
            disabled={disabled}
            className={`w-4 h-4 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          <span className="text-sm">Transport matériel</span>
        </label>
      </div>
      <div className="flex items-center gap-4 pt-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="panier"
            defaultChecked={defaultValues?.panier}
            disabled={disabled}
            className={`w-4 h-4 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          <span className="text-sm">Panier</span>
        </label>
      </div>
    </div>
  );
}

// Composant pour une phase individuelle en édition
function PhaseEditor({
  phase,
  index,
  typesPhases,
  onUpdate,
  onRemove,
}: {
  phase: { type: string; duree: string };
  index: number;
  typesPhases: TypePhase[];
  onUpdate: (index: number, field: "type" | "duree", value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [hours, minutes] = parseDuration(phase.duree);

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-muted)",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">Type *</label>
          <select
            value={phase.type}
            onChange={(e) => onUpdate(index, "type", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-muted)",
            }}
            required
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
            value={hours}
            onChange={(e) => onUpdate(index, "duree", formatDuration(e.target.value, minutes))}
            min="0"
            max="23"
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-muted)",
            }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Minutes *</label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => onUpdate(index, "duree", formatDuration(hours, e.target.value))}
            min="0"
            max="59"
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-muted)",
            }}
            required
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={() => onRemove(index)} className="btn-danger text-sm">
          Supprimer
        </button>
      </div>
    </div>
  );
}

// Composant réutilisable pour la liste des phases en édition
function PhasesList({
  phases,
  typesPhases,
  onAdd,
  onUpdate,
  onRemove,
  showAddButton = true,
}: {
  phases: Array<{ type: string; duree: string }>;
  typesPhases: TypePhase[];
  onAdd: () => void;
  onUpdate: (index: number, field: "type" | "duree", value: string) => void;
  onRemove: (index: number) => void;
  showAddButton?: boolean;
}) {
  return (
    <div className="border-t pt-4" style={{ borderColor: "var(--color-muted)" }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Phases</h4>
        {showAddButton && (
          <button
            type="button"
            onClick={onAdd}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Ajouter phase
          </button>
        )}
      </div>

      {phases.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] italic">Aucune phase ajoutée</p>
      ) : (
        <div className="space-y-3">
          {phases.map((phase, index) => (
            <PhaseEditor
              key={index}
              phase={phase}
              index={index}
              typesPhases={typesPhases}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Composant Modal de récapitulatif avant finalisation
function RecapitulatifModal({
  chantier,
  jours,
  onClose,
  onConfirm,
  certificationChecked,
  onCertificationChange,
}: {
  chantier: Chantier;
  jours: Jour[];
  onClose: () => void;
  onConfirm: () => void;
  certificationChecked: boolean;
  onCertificationChange: (checked: boolean) => void;
}) {
  // Calculer les totaux
  const totaux = {
    jours: jours.length,
    heuresRendement: jours.reduce((sum, j) => sum + (j.h_rendement || 0), 0),
    locationMateriel: jours.reduce((sum, j) => sum + (j.location_materiel || 0), 0),
    indKilometrique: jours.reduce((sum, j) => sum + (j.ind_kilometrique || 0), 0),
    transportMateriel: jours.filter((j) => j.transport_materiel).length,
    panier: jours.filter((j) => j.panier).length,
  };

  // Fonction pour générer le PDF (impression)
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const joursTriés = [...jours].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Récapitulatif Chantier - ${chantier.foret}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #2c5530;
              border-bottom: 3px solid #2c5530;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header-info {
              background-color: #f5f5f5;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
              border-left: 4px solid #2c5530;
            }
            .header-info p {
              margin: 5px 0;
            }
            .warning {
              background-color: #fff3cd;
              border: 2px solid #ffc107;
              padding: 10px;
              margin-bottom: 20px;
              border-radius: 5px;
              font-weight: bold;
              color: #856404;
            }
            .totaux {
              background-color: #e3f2fd;
              border: 2px solid #2196f3;
              padding: 15px;
              margin-bottom: 30px;
              border-radius: 5px;
            }
            .totaux h2 {
              color: #2c5530;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .totaux-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .totaux-item {
              text-align: center;
            }
            .totaux-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .totaux-value {
              font-size: 24px;
              font-weight: bold;
              color: #2196f3;
            }
            .jour-card {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
              page-break-inside: avoid;
              background-color: #fafafa;
            }
            .jour-header {
              background-color: #2c5530;
              color: white;
              padding: 10px;
              margin: -15px -15px 15px -15px;
              border-radius: 5px 5px 0 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .jour-details {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-bottom: 15px;
              padding: 10px;
              background-color: white;
              border-radius: 5px;
            }
            .detail-item {
              font-size: 14px;
            }
            .detail-label {
              color: #666;
              font-size: 12px;
            }
            .phases {
              padding: 10px;
              background-color: white;
              border-radius: 5px;
              border-top: 2px solid #e0e0e0;
            }
            .phases h4 {
              margin-top: 0;
              color: #2c5530;
              font-size: 14px;
            }
            .phase-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px solid #eee;
            }
            .phase-item:last-child {
              border-bottom: none;
            }
            @media print {
              body {
                padding: 10px;
              }
              .jour-card {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>Récapitulatif du Chantier</h1>
          
          <div class="header-info">
            <p><strong>Chantier :</strong> ${chantier.foret} - ${chantier.triage} - ${chantier.parcelle}</p>
            <p><strong>Date de début :</strong> ${new Date(chantier.date_debut).toLocaleDateString("fr-FR")}</p>
            <p><strong>Date d'impression :</strong> ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
          </div>

          <div class="warning">
            ⚠️ Document de validation - Ce chantier sera finalisé et ne pourra plus être modifié
          </div>

          <div class="totaux">
            <h2>Totaux du chantier</h2>
            <div class="totaux-grid">
              <div class="totaux-item">
                <div class="totaux-label">Jours travaillés</div>
                <div class="totaux-value">${totaux.jours}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Heures rendement</div>
                <div class="totaux-value">${totaux.heuresRendement}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Location matériel</div>
                <div class="totaux-value">${totaux.locationMateriel}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Ind. kilométrique</div>
                <div class="totaux-value">${totaux.indKilometrique}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Transport matériel</div>
                <div class="totaux-value">${totaux.transportMateriel}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Paniers repas</div>
                <div class="totaux-value">${totaux.panier}</div>
              </div>
            </div>
          </div>

          <h2 style="color: #2c5530; margin-bottom: 15px;">Détail des journées</h2>

          ${joursTriés
            .map(
              (jour) => `
            <div class="jour-card">
              <div class="jour-header">
                <strong>${new Date(jour.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</strong>
                <span>${jour.phases.length} phase${jour.phases.length > 1 ? "s" : ""}</span>
              </div>

              <div class="jour-details">
                <div class="detail-item">
                  <div class="detail-label">H. Rendement</div>
                  <strong>${jour.h_rendement || 0}</strong>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Loc. Matériel</div>
                  <strong>${jour.location_materiel || 0}</strong>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Ind. Km</div>
                  <strong>${jour.ind_kilometrique || 0}</strong>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Transport</div>
                  <strong>${jour.transport_materiel ? "✓ Oui" : "✗ Non"}</strong>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Panier</div>
                  <strong>${jour.panier ? "✓ Oui" : "✗ Non"}</strong>
                </div>
              </div>

              ${
                jour.phases.length > 0
                  ? `
              <div class="phases">
                <h4>Phases réalisées :</h4>
                ${jour.phases
                  .map(
                    (phase) => `
                  <div class="phase-item">
                    <span>${phase.type}</span>
                    <span><strong>${convertDureeToHHMM(phase.duree)}</strong></span>
                  </div>
                `
                  )
                  .join("")}
              </div>
              `
                  : ""
              }
            </div>
          `
            )
            .join("")}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #2c5530;">
            <p style="text-align: center; color: #666; font-size: 12px;">
              Document généré automatiquement par POINTARBRE - ${new Date().toLocaleString("fr-FR")}
            </p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold mb-2">Récapitulatif du chantier</h2>
          <div className="text-sm text-[var(--color-muted)]">
            <p>
              <strong>Chantier :</strong> {chantier.foret} - {chantier.triage} - {chantier.parcelle}
            </p>
            <p>
              <strong>Début :</strong> {new Date(chantier.date_debut).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-red-600 font-semibold mt-2">
              ⚠️ Attention : Une fois validé, le chantier ne pourra plus être modifié
            </p>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Totaux */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-3 text-lg">Totaux</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[var(--color-muted)]">Jours travaillés</div>
                <div className="text-xl font-bold text-blue-600">{totaux.jours}</div>
              </div>
              <div>
                <div className="text-[var(--color-muted)]">Heures rendement</div>
                <div className="text-xl font-bold text-blue-600">{totaux.heuresRendement}</div>
              </div>
              <div>
                <div className="text-[var(--color-muted)]">Location matériel</div>
                <div className="text-xl font-bold text-blue-600">{totaux.locationMateriel}</div>
              </div>
              <div>
                <div className="text-[var(--color-muted)]">Ind. kilométrique</div>
                <div className="text-xl font-bold text-blue-600">{totaux.indKilometrique}</div>
              </div>
              <div>
                <div className="text-[var(--color-muted)]">Transport matériel</div>
                <div className="text-xl font-bold text-blue-600">{totaux.transportMateriel}</div>
              </div>
              <div>
                <div className="text-[var(--color-muted)]">Paniers repas</div>
                <div className="text-xl font-bold text-blue-600">{totaux.panier}</div>
              </div>
            </div>
          </div>

          {/* Liste des jours */}
          <h3 className="font-semibold mb-3 text-lg">Détail des jours</h3>
          <div className="space-y-4">
            {jours
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((jour) => (
                <div
                  key={jour.id}
                  className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">
                      {new Date(jour.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h4>
                    <span className="text-sm text-[var(--color-muted)]">
                      {jour.phases.length} phase{jour.phases.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-muted)]">H. Rend.:</span>
                      <span className="font-medium">{jour.h_rendement || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-muted)]">Loc. Mat.:</span>
                      <span className="font-medium">{jour.location_materiel || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-muted)]">Ind. Km:</span>
                      <span className="font-medium">{jour.ind_kilometrique || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-gray-500" />
                      <span
                        className={jour.transport_materiel ? "text-green-600" : "text-gray-400"}
                      >
                        {jour.transport_materiel ? "Oui" : "Non"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils size={16} className="text-gray-500" />
                      <span className={jour.panier ? "text-green-600" : "text-gray-400"}>
                        {jour.panier ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>

                  {/* Phases */}
                  {jour.phases.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                      <div className="text-sm font-medium mb-2">Phases :</div>
                      <div className="space-y-1">
                        {jour.phases.map((phase) => (
                          <div key={phase.id} className="flex justify-between text-sm">
                            <span>{phase.type}</span>
                            <span className="font-mono text-[var(--color-muted)]">
                              {convertDureeToHHMM(phase.duree)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          {/* Certification */}
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={certificationChecked}
                onChange={(e) => onCertificationChange(e.target.checked)}
                className="mt-1"
                style={{ accentColor: "#3b82f6" }}
              />
              <span className="text-sm">
                Je certifie avoir vérifié l'ensemble de ma saisie et être conscient(e) que ce
                chantier ne pourra plus être modifié une fois validé.
              </span>
            </label>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 justify-between">
            <button
              onClick={handleExportPDF}
              className="btn-secondary px-6 py-2 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Exporter en PDF
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary px-6 py-2">
                Retour
              </button>
              <button
                onClick={onConfirm}
                disabled={!certificationChecked}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer et finaliser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [newJourPhases, setNewJourPhases] = useState<Array<{ type: string; duree: string }>>([]);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [certificationChecked, setCertificationChecked] = useState(false);

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
    const lastJour = getLatestJour(jours);
    if (!lastJour) return new Date().toISOString().split("T")[0];

    const nextDate = getNextWorkingDay(new Date(lastJour.date));
    return nextDate.toISOString().split("T")[0];
  }

  function handleCopyLastJour() {
    const lastJour = getLatestJour(jours);
    if (!lastJour) return;

    // Copier les phases du dernier jour (convertir la durée en format HH:MM)
    setNewJourPhases(
      lastJour.phases.map((p) => ({
        type: p.type,
        duree: convertDureeToHHMM(p.duree),
      }))
    );

    // Pré-remplir le formulaire (on va utiliser des refs ou états)
    const form = document.querySelector("form[data-create-jour]") as HTMLFormElement;
    if (form) {
      const hRendementInput = form.elements.namedItem("h_rendement") as HTMLInputElement;
      const locationInput = form.elements.namedItem("location_materiel") as HTMLInputElement;
      const indKmInput = form.elements.namedItem("ind_kilometrique") as HTMLInputElement;
      const transportInput = form.elements.namedItem("transport_materiel") as HTMLInputElement;
      const panierInput = form.elements.namedItem("panier") as HTMLInputElement;

      if (hRendementInput) hRendementInput.value = lastJour.h_rendement?.toString() || "";
      if (locationInput) locationInput.value = lastJour.location_materiel?.toString() || "";
      if (indKmInput) indKmInput.value = lastJour.ind_kilometrique?.toString() || "";
      if (transportInput) transportInput.checked = lastJour.transport_materiel;
      if (panierInput) panierInput.checked = lastJour.panier;
    }
  }

  // Fonction utilitaire pour créer les phases d'un jour
  async function createPhasesForJour(
    jourId: string,
    phases: Array<{ type: string; duree: string }>
  ): Promise<void> {
    for (const phase of phases) {
      const [hours, minutes] = parseDuration(phase.duree);
      await fetch(`/api/jours/${jourId}/phases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: phase.type,
          hours: hours,
          minutes: minutes,
        }),
      });
    }
  }

  async function handleCreateJour(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

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

        // Créer les phases si il y en a
        if (newJourPhases.length > 0) {
          await createPhasesForJour(newJour.id, newJourPhases);
        }

        setShowCreateForm(false);
        setNewJourPhases([]);
        form.reset();
        fetchJours();
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
        setExpandedJourId(null);
        fetchJours();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur mise à jour jour:", error);
      alert("Erreur serveur");
    }
  }

  function handleAddPhaseToNewJour() {
    setNewJourPhases([...newJourPhases, { type: "", duree: "" }]);
  }

  function handleRemovePhaseFromNewJour(index: number) {
    setNewJourPhases(newJourPhases.filter((_, i) => i !== index));
  }

  function handleUpdateNewJourPhase(index: number, field: "type" | "duree", value: string) {
    const updated = [...newJourPhases];
    updated[index][field] = value;
    setNewJourPhases(updated);
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

  function handleFinalizeChantier() {
    console.log("Ouverture du modal de récapitulatif");
    setShowRecapModal(true);
    setCertificationChecked(false);
  }

  async function confirmFinalizeChantier() {
    if (!certificationChecked) {
      alert("Veuillez certifier avoir vérifié votre saisie");
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
    if (!confirm("Êtes-vous sûr de vouloir rouvrir ce chantier ? La date de fin sera supprimée.")) {
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
          <form data-create-jour onSubmit={handleCreateJour} className="space-y-4">
            <JourFormFields showDate defaultDate={getDefaultDate()} />

            {/* Section Phases */}
            <PhasesList
              phases={newJourPhases}
              typesPhases={typesPhases}
              onAdd={handleAddPhaseToNewJour}
              onUpdate={handleUpdateNewJourPhase}
              onRemove={handleRemovePhaseFromNewJour}
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewJourPhases([]);
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
                            <span
                              className="inline-flex items-center text-[var(--color-muted)]"
                              title="Panier repas"
                            >
                              <Utensils className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
                        <span>
                          <span className="font-medium text-[var(--color-text)]">H. rend:</span>{" "}
                          {jour.h_rendement ?? 0}
                        </span>
                        <span>
                          <span className="font-medium text-[var(--color-text)]">Location:</span>{" "}
                          {jour.location_materiel ?? 0}€
                        </span>
                        <span>
                          <span className="font-medium text-[var(--color-text)]">Km:</span>{" "}
                          {jour.ind_kilometrique ?? 0}
                        </span>
                        <span>
                          <span className="font-medium text-[var(--color-text)]">Phases:</span>{" "}
                          {jour.phases.length}
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
                      <JourFormFields
                        showDate
                        defaultDate={new Date(jour.date).toISOString().split("T")[0]}
                        defaultValues={{
                          h_rendement: jour.h_rendement,
                          location_materiel: jour.location_materiel,
                          ind_kilometrique: jour.ind_kilometrique,
                          transport_materiel: jour.transport_materiel,
                          panier: jour.panier,
                        }}
                        disabled={!!chantier.date_fin}
                      />

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
                        <PhaseAddForm
                          typesPhases={typesPhases}
                          onSubmit={(e) => handleCreatePhase(jour.id, e)}
                          onCancel={() => setShowPhaseForm(null)}
                        />
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

      {/* Modal de récapitulatif */}
      {showRecapModal && chantier && (
        <>
          {console.log(
            "Affichage du modal, showRecapModal:",
            showRecapModal,
            "chantier:",
            chantier
          )}
          <RecapitulatifModal
            chantier={chantier}
            jours={jours}
            onClose={() => setShowRecapModal(false)}
            onConfirm={confirmFinalizeChantier}
            certificationChecked={certificationChecked}
            onCertificationChange={setCertificationChecked}
          />
        </>
      )}
    </div>
  );
}

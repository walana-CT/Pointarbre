"use client";

import { useState, useEffect } from "react";
import { Download, Printer, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Jour {
  id: string;
  date: string;
  h_rendement: number | null;
  location_materiel: number | null;
  type_location: string | null;
  ind_kilometrique: number | null;
  transport_materiel: boolean;
  panier: boolean;
  phases: Phase[];
}

interface Phase {
  id: string;
  type: string;
  duree: string;
}

interface Chantier {
  id: string;
  foret: string;
  triage: string;
  parcelle: string;
  date_debut: string;
  date_fin: string | null;
  jours: Jour[];
}

interface OuvrierData {
  ouvrier: {
    id: number;
    nom: string | null;
    prenom: string | null;
    email: string;
  };
  chantiers: Chantier[];
  totaux: {
    jours: number;
    heuresRendement: number;
    locationMateriel: number;
    indKilometrique: number;
    transportMateriel: number;
    panier: number;
  };
}

export default function CMOClient() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<OuvrierData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOuvrier, setExpandedOuvrier] = useState<number | null>(null);

  // Fonction pour formater le type de location
  const formatTypeLocation = (type: string | null): string => {
    if (!type) return "-";
    switch (type) {
      case "TRONCONNEUSE_EXPLOITATION":
        return "Tronçonneuse exploitation";
      case "TRONCONNEUSE_SYLVICOLE":
        return "Tronçonneuse sylvicole";
      case "DEBROUSAILLEUSE":
        return "Débroussailleuse";
      default:
        return type;
    }
  };

  // Fonction pour calculer la durée totale d'un jour
  const calculateTotalDuration = (phases: Phase[]): string => {
    let totalMinutes = 0;
    phases.forEach((phase) => {
      const dureeDate = new Date(phase.duree);
      totalMinutes += dureeDate.getHours() * 60 + dureeDate.getMinutes();
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  };

  // Récupérer les données quand les filtres changent
  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cmo/chantiers?month=${selectedMonth}&year=${selectedYear}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (ouvrierData: OuvrierData) => {
    const rows: string[][] = [];

    // En-tête
    rows.push([
      "Ouvrier",
      "Email",
      "Mois",
      "Année",
      "Chantier",
      "Forêt",
      "Triage",
      "Parcelle",
      "Date",
      "Heures rendement",
      "Location matériel",
      "Type location",
      "Ind. kilométrique",
      "Transport matériel",
      "Panier repas",
      "Phases",
    ]);

    // Données
    ouvrierData.chantiers.forEach((chantier) => {
      chantier.jours.forEach((jour) => {
        const phases = jour.phases.map((p) => `${p.type} (${p.duree})`).join("; ");
        rows.push([
          ouvrierData.ouvrier.nom || "",
          ouvrierData.ouvrier.prenom || "",
          ouvrierData.ouvrier.email,
          selectedMonth.toString(),
          selectedYear.toString(),
          `${chantier.foret} - ${chantier.triage} - ${chantier.parcelle}`,
          chantier.foret,
          chantier.triage,
          chantier.parcelle,
          new Date(jour.date).toLocaleDateString("fr-FR"),
          (jour.h_rendement || 0).toString(),
          `${jour.location_materiel || 0}h`,
          formatTypeLocation(jour.type_location),
          (jour.ind_kilometrique || 0).toString(),
          jour.transport_materiel ? "Oui" : "Non",
          jour.panier ? "Oui" : "Non",
          phases,
        ]);
      });
    });

    // Ligne de totaux
    rows.push([]);
    rows.push([
      "TOTAUX",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `${ouvrierData.totaux.jours} jours`,
      ouvrierData.totaux.heuresRendement.toString(),
      `${ouvrierData.totaux.locationMateriel}h`,
      ouvrierData.totaux.indKilometrique.toString(),
      ouvrierData.totaux.transportMateriel.toString(),
      ouvrierData.totaux.panier.toString(),
      "",
    ]);

    // Convertir en CSV
    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    // Télécharger
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `CMO_${ouvrierData.ouvrier.nom}_${ouvrierData.ouvrier.prenom}_${selectedMonth}-${selectedYear}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printFiche = (ouvrierData: OuvrierData) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fiche CMO - ${ouvrierData.ouvrier.prenom} ${ouvrierData.ouvrier.nom}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #2c5530;
              border-bottom: 2px solid #2c5530;
              padding-bottom: 10px;
            }
            .header {
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
            }
            .chantier {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .chantier-header {
              background-color: #2c5530;
              color: white;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .totaux {
              margin-top: 30px;
              padding: 15px;
              background-color: #f9f9f9;
              border: 2px solid #2c5530;
              border-radius: 4px;
            }
            .totaux-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c5530;
              margin-bottom: 10px;
            }
            .totaux-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .totaux-item {
              padding: 5px;
            }
            .totaux-label {
              font-size: 11px;
              color: #666;
            }
            .totaux-value {
              font-size: 16px;
              font-weight: bold;
              color: #2c5530;
            }
            @media print {
              body {
                padding: 10px;
              }
              .chantier {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>Fiche récapitulative CMO</h1>
          <div class="header">
            <div class="info-row">
              <span><span class="info-label">Ouvrier:</span>  ${ouvrierData.ouvrier.prenom} ${ouvrierData.ouvrier.nom}</span>
              <span><span class="info-label">Email:</span> ${ouvrierData.ouvrier.email}</span>
            </div>
            <div class="info-row">
              <span><span class="info-label">Période:</span> ${monthNames[selectedMonth - 1]} ${selectedYear}</span>
              <span><span class="info-label">Date d'impression:</span> ${new Date().toLocaleDateString("fr-FR")}</span>
            </div>
          </div>

          ${ouvrierData.chantiers
            .map(
              (chantier) => `
            <div class="chantier">
              <div class="chantier-header">
                <strong>Chantier:</strong> ${chantier.foret} - ${chantier.triage} - ${chantier.parcelle}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>H. Rend.</th>
                    <th>Loc. Mat.</th>
                    <th>Type Loc.</th>
                    <th>Ind. Km</th>
                    <th>Transport</th>
                    <th>Panier</th>
                    <th>Phases</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  ${chantier.jours
                    .map((jour) => {
                      const totalDuration = calculateTotalDuration(jour.phases);
                      const totalHours = parseInt(totalDuration.split("h")[0]);
                      const isOvertime = totalHours >= 10;
                      return `
                    <tr style="${isOvertime ? "background-color: #fef3c7; border: 2px solid #fde68a;" : ""}">
                      <td>${new Date(jour.date).toLocaleDateString("fr-FR")}</td>
                      <td>${jour.h_rendement || 0}</td>
                      <td>${jour.location_materiel || 0}h</td>
                      <td>${formatTypeLocation(jour.type_location)}</td>
                      <td>${jour.ind_kilometrique || 0}</td>
                      <td>${jour.transport_materiel ? "Oui" : "Non"}</td>
                      <td>${jour.panier ? "Oui" : "Non"}</td>
                      <td>${jour.phases.map((p) => `${p.type} (${p.duree})`).join(", ")}</td>
                      <td style="font-weight: ${isOvertime ? "bold" : "normal"}; color: ${isOvertime ? "#92400e" : "inherit"};">
                        ${totalDuration} ${isOvertime ? "⚠️ ≥10h" : ""}
                      </td>
                    </tr>
                  `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          `
            )
            .join("")}

          <div class="totaux">
            <div class="totaux-title">Totaux du mois</div>
            <div class="totaux-grid">
              <div class="totaux-item">
                <div class="totaux-label">Jours travaillés</div>
                <div class="totaux-value">${ouvrierData.totaux.jours}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Heures rendement</div>
                <div class="totaux-value">${ouvrierData.totaux.heuresRendement}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Location matériel</div>
                <div class="totaux-value">${ouvrierData.totaux.locationMateriel}h</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Ind. kilométrique</div>
                <div class="totaux-value">${ouvrierData.totaux.indKilometrique}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Transport matériel</div>
                <div class="totaux-value">${ouvrierData.totaux.transportMateriel}</div>
              </div>
              <div class="totaux-item">
                <div class="totaux-label">Paniers repas</div>
                <div class="totaux-value">${ouvrierData.totaux.panier}</div>
              </div>
            </div>
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

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  return (
    <div>
      {/* Lien vers la gestion des ouvriers */}
      <div className="mb-6">
        <Link
          href="/cmo/ouvriers"
          className="btn btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Users size={20} />
          Gérer mes ouvriers
        </Link>
      </div>

      {/* Filtres */}
      <div
        className="mb-6 p-6 rounded-lg border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtre Mois */}
          <div>
            <label className="block text-sm font-medium mb-2">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              style={{
                backgroundColor: "var(--color-input-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Année */}
          <div>
            <label className="block text-sm font-medium mb-2">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              style={{
                backgroundColor: "var(--color-input-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Données */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-muted)]">Chargement...</p>
        </div>
      ) : data.length === 0 ? (
        <div
          className="p-8 rounded-lg border text-center"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <p className="text-[var(--color-muted)]">Aucune donnée pour cette période et cette UT</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((ouvrierData) => (
            <div
              key={ouvrierData.ouvrier.id}
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* En-tête ouvrier */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                style={{ backgroundColor: "var(--color-background)" }}
                onClick={() =>
                  setExpandedOuvrier(
                    expandedOuvrier === ouvrierData.ouvrier.id ? null : ouvrierData.ouvrier.id
                  )
                }
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {ouvrierData.ouvrier.nom}
                    {ouvrierData.ouvrier.prenom}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">{ouvrierData.ouvrier.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <div className="text-sm text-[var(--color-muted)]">Jours travaillés</div>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">
                      {ouvrierData.totaux.jours}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportCSV(ouvrierData);
                    }}
                    className="btn-secondary flex items-center gap-2"
                    title="Exporter en CSV"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      printFiche(ouvrierData);
                    }}
                    className="btn-primary flex items-center gap-2"
                    title="Imprimer la fiche"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                </div>
              </div>

              {/* Détails ouvrier (expandable) */}
              {expandedOuvrier === ouvrierData.ouvrier.id && (
                <div className="p-6 border-t" style={{ borderColor: "var(--color-border)" }}>
                  {/* Totaux */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div>
                      <div className="text-xs text-[var(--color-muted)]">Jours</div>
                      <div className="text-xl font-bold">{ouvrierData.totaux.jours}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-muted)]">H. Rendement</div>
                      <div className="text-xl font-bold">{ouvrierData.totaux.heuresRendement}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-muted)]">Loc. Matériel</div>
                      <div className="text-xl font-bold">
                        {ouvrierData.totaux.locationMateriel}h
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-muted)]">Ind. Km</div>
                      <div className="text-xl font-bold">{ouvrierData.totaux.indKilometrique}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-muted)]">Transport</div>
                      <div className="text-xl font-bold">
                        {ouvrierData.totaux.transportMateriel}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-muted)]">Paniers</div>
                      <div className="text-xl font-bold">{ouvrierData.totaux.panier}</div>
                    </div>
                  </div>

                  {/* Chantiers */}
                  <div className="space-y-4">
                    {ouvrierData.chantiers.map((chantier) => (
                      <div
                        key={chantier.id}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-background)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <div className="font-semibold mb-2">
                          {chantier.foret} - {chantier.triage} - {chantier.parcelle}
                        </div>
                        <div className="text-sm text-[var(--color-muted)] mb-3">
                          {chantier.jours.length} jour{chantier.jours.length > 1 ? "s" : ""}
                        </div>

                        {/* Liste des jours */}
                        <div className="space-y-2">
                          {chantier.jours.map((jour) => {
                            const totalDuration = calculateTotalDuration(jour.phases);
                            const totalHours = parseInt(totalDuration.split("h")[0]);
                            const isOvertime = totalHours >= 10;
                            return (
                              <div
                                key={jour.id}
                                className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2 text-sm p-2 rounded"
                                style={{
                                  backgroundColor: "var(--color-surface)",
                                  border: isOvertime ? "2px solid var(--color-warning)" : "none",
                                }}
                              >
                                <div>
                                  <span className="text-[var(--color-muted)]">Date: </span>
                                  {new Date(jour.date).toLocaleDateString("fr-FR")}
                                </div>
                                <div>
                                  <span className="text-[var(--color-muted)]">H. Rend: </span>
                                  {jour.h_rendement || 0}
                                </div>
                                <div>
                                  <span className="text-[var(--color-muted)]">Loc: </span>
                                  {jour.location_materiel || 0}h
                                </div>
                                <div>
                                  <span className="text-[var(--color-muted)]">Type: </span>
                                  {formatTypeLocation(jour.type_location)}
                                </div>
                                <div>
                                  <span className="text-[var(--color-muted)]">Km: </span>
                                  {jour.ind_kilometrique || 0}
                                </div>
                                <div>
                                  <span className="text-[var(--color-muted)]">Trans: </span>
                                  {jour.transport_materiel ? "✓" : "✗"}
                                </div>
                                <div>
                                  <span className="text-[var(--color-muted)]">Panier: </span>
                                  {jour.panier ? "✓" : "✗"}
                                </div>
                                <div>
                                  <span className="text-[var(--color-muted)]">Phases: </span>
                                  {jour.phases.length}
                                </div>
                                <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center gap-1">
                                  <span className="text-[var(--color-muted)]">Durée: </span>
                                  <span className="font-medium">{totalDuration}</span>
                                  {isOvertime && (
                                    <span
                                      className="px-1.5 py-0.5 text-xs font-semibold rounded inline-flex items-center gap-1"
                                      style={{
                                        backgroundColor: "#fef3c7",
                                        color: "#92400e",
                                        border: "1px solid #fde68a",
                                      }}
                                    >
                                      <AlertTriangle className="w-3 h-3" />
                                      ≥10h
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
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

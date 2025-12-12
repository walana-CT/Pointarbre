"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TriagesTab from "./tabs/TriagesTab";
import ForetsTab from "./tabs/ForetsTab";
import ParcellesTab from "./tabs/ParcellesTab";
import UTsTab from "./tabs/UTsTab";
import AgencesTab from "./tabs/AgencesTab";
import UsersTab from "./tabs/UsersTab";

type Tab = "triages" | "forets" | "parcelles" | "uts" | "agences" | "users";

export default function AdminClient() {
  const [activeTab, setActiveTab] = useState<Tab>("triages");

  const tabs = [
    { id: "triages" as Tab, label: "Triages" },
    { id: "forets" as Tab, label: "Forêts" },
    { id: "parcelles" as Tab, label: "Parcelles" },
    { id: "uts" as Tab, label: "UTs" },
    { id: "agences" as Tab, label: "Agences" },
    { id: "users" as Tab, label: "Utilisateurs" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="text-[var(--color-primary)] hover:underline text-sm inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Administration</h1>
        <p className="text-[var(--color-muted)]">Gestion des données de référence</p>
      </div>

      {/* Navigation par onglets */}
      <div className="mb-6 border-b" style={{ borderColor: "var(--color-muted)" }}>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === "triages" && <TriagesTab />}
        {activeTab === "forets" && <ForetsTab />}
        {activeTab === "parcelles" && <ParcellesTab />}
        {activeTab === "uts" && <UTsTab />}
        {activeTab === "agences" && <AgencesTab />}
        {activeTab === "users" && <UsersTab />}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Shield, Calendar, Truck } from "lucide-react";
import Link from "next/link";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  isDisabled: boolean;
  uts?: Array<{
    id: string;
    number: string;
    name: string;
  }>;
};

export default function ProfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--color-muted)]">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrateur",
    USER: "Utilisateur",
    GUEST: "Invité",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 p-2 rounded hover:bg-[var(--color-surface)] transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour à l'accueil</span>
        </Link>
      </div>

      {/* Carte principale */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6">
        {/* Avatar et nom */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[var(--color-border)]">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            {(user.name?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-1">{user.name || "Utilisateur"}</h2>
            <p className="text-[var(--color-muted)]">{roleLabels[user.role] || user.role}</p>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="space-y-6">
          {/* Nom */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[var(--color-muted)] mb-1">Nom</div>
              <div className="font-medium">{user.name || "Non renseigné"}</div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Mail size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[var(--color-muted)] mb-1">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
          </div>

          {/* Rôle */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Shield size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[var(--color-muted)] mb-1">Rôle</div>
              <div className="font-medium">{roleLabels[user.role] || user.role}</div>
            </div>
          </div>

          {/* Date de création */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Calendar size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[var(--color-muted)] mb-1">Membre depuis</div>
              <div className="font-medium">
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* UTs */}
          {user.uts && user.uts.length > 0 && (
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                <Truck size={20} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[var(--color-muted)] mb-1">
                  UT{user.uts.length > 1 ? "s" : ""}
                </div>
                <div className="space-y-1">
                  {user.uts.map((ut) => (
                    <div key={ut.id} className="font-medium">
                      {ut.number} - {ut.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statut du compte */}
          {user.isDisabled && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ Ce compte est actuellement désactivé
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

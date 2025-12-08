import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  const user = sessionToken ? await getUserFromToken(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="text-5xl font-bold text-gray-900 mb-4">Bienvenue ! 👋</h1>
      <p className="text-xl text-gray-600 mb-8">
        Votre stack Next.js + Prisma + PostgreSQL est prête à l'emploi, avec authentification.
      </p>

      {/* Stack Info */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">✨ Votre Stack</h2>
        <ul className="text-left space-y-3">
          <li className="flex items-center text-gray-700">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
            <strong>Next.js 15</strong> - Framework React moderne
          </li>
          <li className="flex items-center text-gray-700">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            <strong>React 19</strong> - Dernière version de React
          </li>
          <li className="flex items-center text-gray-700">
            <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
            <strong>Prisma</strong> - ORM pour PostgreSQL
          </li>
          <li className="flex items-center text-gray-700">
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
            <strong>PostgreSQL</strong> - Base de données robuste
          </li>
          <li className="flex items-center text-gray-700">
            <span className="inline-block w-3 h-3 bg-cyan-500 rounded-full mr-3"></span>
            <strong>Tailwind CSS</strong> - Styling moderne
          </li>
          <li className="flex items-center text-gray-700">
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
            <strong>TypeScript</strong> - Type safety
          </li>
          <li className="flex items-center text-gray-700">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-3"></span>
            <strong>Authentification</strong> - Sessions sécurisées + argon2
          </li>
        </ul>
      </div>

      {/* Auth Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8 text-left">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔐 Authentification</h3>
        <p className="text-gray-700 mb-4">
          Vous êtes maintenant connecté ! Le système d'authentification vous protège des accès non
          autorisés.
        </p>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>✅ Sessions stockées côté serveur</li>
          <li>✅ Mots de passe hashés avec argon2</li>
          <li>✅ Cookies HttpOnly sécurisés</li>
          <li>✅ Middleware de protection automatique</li>
        </ul>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8 text-left">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Prochaines étapes :</h3>
        <ol className="space-y-2 text-gray-700">
          <li>1. Créer des endpoints admin pour gérer les utilisateurs</li>
          <li>2. Ajouter des permissions par rôle (ADMIN, USER, etc.)</li>
          <li>
            3. Consulter Prisma Studio :
            <code className="bg-gray-200 px-2 py-1 rounded block mt-2">pnpm run prisma:studio</code>
          </li>
          <li>4. Vérifier vos utilisateurs en base de données</li>
        </ol>
      </div>

      {/* Links */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/api/health" className="btn-primary">
          Tester l'API
        </Link>
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Documentation Next.js
        </a>
        <a
          href="https://www.prisma.io"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Documentation Prisma
        </a>
      </div>
    </div>
  );
}

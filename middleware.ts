import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken, parseTokenFromCookieHeader } from "@/lib/auth";

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = ["/login"];
const PUBLIC_API_ROUTES = ["/api/auth/login", "/api/auth/me"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Laisser passer les routes publiques et les assets statiques
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_API_ROUTES.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Laisser passer les POST /api/auth/login (sans vérifier la session)
  if (pathname === "/api/auth/login" && req.method === "POST") {
    return NextResponse.next();
  }

  // Vérifier l'authentification pour les routes protégées
  const cookieHeader = req.headers.get("cookie") || "";
  const token = parseTokenFromCookieHeader(cookieHeader);
  const user = await getUserFromToken(token || undefined);

  if (!user) {
    // Si c'est une route API, retourner une erreur
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Si c'est une page, rediriger vers login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Matcher toutes les routes sauf:
     * - _next/static (assets statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - etc...
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

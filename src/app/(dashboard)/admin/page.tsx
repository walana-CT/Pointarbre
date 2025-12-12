import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  const user = sessionToken ? await getUserFromToken(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  // Vérifier que l'utilisateur est ADMIN
  if (user.role !== "ADMIN") {
    return redirect("/");
  }

  return <AdminClient />;
}

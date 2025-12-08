"use client";
import React from "react";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // redirect to home after logout
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
      window.location.reload();
    }
  };

  return (
    <button type="button" className="btn-secondary" onClick={handleLogout}>
      Déconnexion
    </button>
  );
}

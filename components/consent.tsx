"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("nexo:preference", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nexo:preference", callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem("nexo-consent") || "";
  } catch {
    return "unavailable";
  }
}
export default function Consent() {
  const stored = useSyncExternalStore(subscribe, snapshot, () => "pending");
  const [settings, setSettings] = useState(false);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-cookie-settings]"))
        setSettings(true);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  function save(optional: boolean) {
    try {
      localStorage.setItem(
        "nexo-consent",
        JSON.stringify({
          optional,
          date: new Date().toISOString(),
          version: 1,
        }),
      );
    } catch {}
    window.dispatchEvent(new Event("nexo:preference"));
    window.dispatchEvent(
      new CustomEvent("nexo:consent", { detail: { analytics: optional } }),
    );
    setSettings(false);
  }
  return stored === "" || settings ? (
    <aside className="cookie-banner" aria-label="Preferências de privacidade">
      <div>
        <strong>Sua privacidade faz parte do cuidado.</strong>
        <p>
          Sem rastreamento de marketing nesta versão. Você escolhe se autoriza
          futuras métricas opcionais.{" "}
          <Link href="/privacidade">Saiba mais</Link>.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="button button-outline" onClick={() => save(false)}>
          Somente necessários
        </button>
        <button className="button" onClick={() => save(true)}>
          Permitir opcionais
        </button>
      </div>
    </aside>
  ) : null;
}

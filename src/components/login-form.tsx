"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      method="post"
      action="/api/auth/login"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const data = new FormData(e.currentTarget);
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(data)),
          });
          if (!response.ok) {
            setError((await response.json()).error);
            return;
          }
          router.push("/");
          router.refresh();
        } catch {
          setError("Não foi possível conectar. Tente novamente.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="eyebrow green">BEM-VINDO AO NEXO</p>
      <h2>Vamos conectar?</h2>
      <p className="muted">Entre para acompanhar o que importa.</p>
      <label>
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="voce@instituicao.com.br"
        />
      </label>
      <label>
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="primary wide" disabled={busy}>
        {busy ? "Entrando…" : "Entrar na plataforma →"}
      </button>
      <p className="muted small">
        <Link href="/recuperar">Esqueci minha senha</Link>
      </p>
    </form>
  );
}

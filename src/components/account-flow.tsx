"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
const subscribe = () => () => {};
export function AccountFlow({
  invitation = false,
  recoveryAvailable = true,
}: {
  invitation?: boolean;
  recoveryAvailable?: boolean;
}) {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return ready ? (
    <AccountForm
      invitation={invitation}
      recoveryAvailable={recoveryAvailable}
    />
  ) : (
    <main className="account-page">
      <p>Carregando…</p>
    </main>
  );
}
function AccountForm({
  invitation = false,
  recoveryAvailable,
}: {
  invitation?: boolean;
  recoveryAvailable: boolean;
}) {
  const [token, setToken] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "",
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const value =
      new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    if (value) window.history.replaceState(null, "", window.location.pathname);
    // Opening another recovery link can change only the fragment without remounting React.
    const receiveLink = () => {
      const incoming = new URLSearchParams(window.location.hash.slice(1)).get(
        "token",
      );
      if (!incoming) return;
      setToken(incoming);
      setMessage("");
      setError("");
      window.history.replaceState(null, "", window.location.pathname);
    };
    window.addEventListener("hashchange", receiveLink);
    return () => window.removeEventListener("hashchange", receiveLink);
  }, []);
  return (
    <main className="account-page">
      <section className="panel">
        <Link href="/login" className="text-button">
          ← Ir para login
        </Link>
        <p className="eyebrow green">NEXO · CERTTIFICA</p>
        <h1>
          {invitation
            ? "Aceitar convite"
            : token
              ? "Definir nova senha"
              : "Recuperar acesso"}
        </h1>
        {!invitation && !token && !recoveryAvailable ? (
          <p role="status" className="muted">
            A recuperação por e-mail ainda não está disponível nesta
            demonstração online. Contate o responsável Certtifica para recuperar
            o acesso.
          </p>
        ) : invitation && !token && !message ? (
          <p role="alert" className="error">
            Link de convite ausente. Solicite um novo à Certtifica.
          </p>
        ) : message ? (
          <div role="status">
            <p>{message}</p>
            <Link href="/login" className="primary">
              Entrar na plataforma
            </Link>
          </div>
        ) : (
          <form
            method="post"
            action="/api/auth/recovery"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const fields = Object.fromEntries(new FormData(e.currentTarget));
              try {
                const endpoint = invitation
                  ? "invitations/accept"
                  : token
                    ? "reset"
                    : "recovery";
                const response = await fetch("/api/auth/" + endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...fields,
                    token: token || undefined,
                    password: fields.password || undefined,
                  }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setToken("");
                setMessage(
                  invitation
                    ? "Convite aceito. Entre com sua conta para acessar a instituição."
                    : token
                      ? "Senha alterada. Suas sessões anteriores foram encerradas."
                      : "Se houver uma conta cadastrada, as instruções estarão na caixa de saída local privada da demonstração. Nenhum e-mail externo é enviado nesta versão.",
                );
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {invitation && (
              <>
                <p className="muted small">
                  Para uma conta nova, informe nome e senha. Se já tem conta,
                  entre com o e-mail convidado e abra novamente o link; sua
                  senha existente será preservada.
                </p>
                <label>
                  Nome
                  <input
                    name="name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </label>
              </>
            )}
            {!invitation && !token && (
              <>
                <p className="muted small">
                  Demonstração: o operador consulta a caixa de saída local
                  privada. Entrega por e-mail ainda não está configurada.
                </p>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </label>
              </>
            )}
            {(invitation || token) && (
              <label>
                {invitation
                  ? "Senha para conta nova (deixe vazia se já tem conta)"
                  : "Nova senha"}
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={14}
                  maxLength={256}
                  required={!invitation}
                />
              </label>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button disabled={busy} className="primary wide">
              {busy
                ? "Processando…"
                : invitation
                  ? "Aceitar convite"
                  : token
                    ? "Salvar nova senha"
                    : "Solicitar recuperação"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

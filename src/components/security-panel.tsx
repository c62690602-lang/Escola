"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
type Status = {
  enabled: boolean;
  required: boolean;
  needsSetup: boolean;
  configured: boolean;
  recoveryCodesRemaining: number;
};
async function action(path: string, body: unknown) {
  const response = await fetch("/api/auth/mfa/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
export function SecurityPanel({
  initial,
  name,
}: {
  initial: Status;
  name: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initial);
  const [setup, setSetup] = useState<{
    manualKey: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="account-page security-page">
      <section className="panel">
        <p className="eyebrow green">NEXO · PROTEÇÃO DE ACESSO</p>
        <h1>Segurança da conta</h1>
        <p className="muted">{name}</p>
        {status.needsSetup && (
          <p role="status" className="demo-banner">
            Conclua o cadastro do segundo fator para liberar o acesso
            administrativo. Sua sessão está restrita a esta configuração.
          </p>
        )}
        {!status.configured && (
          <p role="alert" className="error">
            A proteção MFA ainda não foi configurada neste ambiente. O
            responsável pela hospedagem precisa configurar a chave de proteção.
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {codes.length > 0 ? (
          <div>
            <h2>Guarde seus códigos de recuperação</h2>
            <p className="muted small">
              Estes códigos aparecem somente agora. Cada um funciona uma vez.
              Guarde-os em local privado, separado da senha, e não compartilhe.
            </p>
            <ul className="recovery-codes">
              {codes.map((c) => (
                <li key={c}>
                  <code>{c}</code>
                </li>
              ))}
            </ul>
            <button
              className="primary wide"
              onClick={() => {
                setCodes([]);
                router.push("/");
                router.refresh();
              }}
            >
              Guardei os códigos. Continuar
            </button>
          </div>
        ) : status.enabled ? (
          <>
            <p role="status" className="badge">
              Segundo fator ativo
            </p>
            <p className="muted small">
              {status.recoveryCodesRemaining} códigos de recuperação
              disponíveis. Ao entrar, use o código do aplicativo autenticador.
              Aguarde um código novo se o atual já foi usado.
            </p>
            {status.required ? (
              <p className="muted small">
                MFA é obrigatório para administradores neste ambiente.
              </p>
            ) : (
              <details>
                <summary>Desativar segundo fator</summary>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError("");
                    const body = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );
                    try {
                      await action("disable", body);
                      router.push("/login");
                      router.refresh();
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label>
                    Senha atual
                    <input
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      maxLength={256}
                    />
                  </label>
                  <label>
                    Código novo do autenticador ou de recuperação
                    <input
                      name="code"
                      required
                      autoComplete="one-time-code"
                      maxLength={40}
                    />
                  </label>
                  <button className="secondary wide" disabled={busy}>
                    Desativar e encerrar sessões
                  </button>
                </form>
              </details>
            )}
            <Link href="/" className="primary wide">
              Voltar ao painel
            </Link>
          </>
        ) : setup ? (
          <>
            <h2>Conecte seu aplicativo autenticador</h2>
            <p className="muted small">
              Leia o QR no aplicativo autenticador de sua preferência ou
              cadastre a chave manualmente. A configuração expira em 10 minutos.
            </p>
            {/* PNG generated by the server; never loaded from an external QR service. */}
            <Image
              unoptimized
              className="mfa-qr"
              src={setup.qrCodeDataUrl}
              width={240}
              height={240}
              alt="QR para cadastrar o segundo fator no autenticador"
            />
            <label>
              Chave manual
              <input
                readOnly
                value={setup.manualKey}
                onFocus={(e) => e.target.select()}
              />
            </label>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                try {
                  const data = await action(
                    "confirm",
                    Object.fromEntries(new FormData(e.currentTarget)),
                  );
                  setCodes(data.recoveryCodes);
                  setSetup(null);
                  setStatus({
                    ...status,
                    enabled: true,
                    needsSetup: false,
                    recoveryCodesRemaining: data.recoveryCodes.length,
                  });
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                Código de seis dígitos
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  minLength={6}
                  required
                />
              </label>
              <button className="primary wide" disabled={busy}>
                Confirmar segundo fator
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="muted small">
              Proteja o acesso com um aplicativo autenticador. Confirme sua
              senha para iniciar o cadastro.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                try {
                  const data = await action(
                    "setup",
                    Object.fromEntries(new FormData(e.currentTarget)),
                  );
                  setSetup(data);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                Senha atual
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  maxLength={256}
                />
              </label>
              <button
                className="primary wide"
                disabled={busy || !status.configured}
              >
                Configurar segundo fator
              </button>
            </form>
          </>
        )}
        {!status.needsSetup && !status.enabled && !codes.length && (
          <Link href="/" className="text-button">
            ← Voltar ao painel
          </Link>
        )}
        <button
          className="text-button"
          disabled={busy}
          onClick={async () => {
            try {
              const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
              });
              if (!response.ok) throw new Error("Não foi possível sair");
              router.push("/login");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Sair da conta
        </button>
      </section>
    </main>
  );
}

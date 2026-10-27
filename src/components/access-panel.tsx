"use client";
import Link from "next/link";
import {
  permissionKeys,
  permissionLabels,
  effectivePermissions,
  type Permission,
} from "@/lib/permissions";
import { useState, useEffect, useCallback } from "react";
type Access = {
  members: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[] | null;
  }[];
  invitations: {
    id: string;
    email: string;
    role: string;
    expiresAt: string;
    usedAt: string | null;
    revokedAt: string | null;
  }[];
};
const roles: Record<string, string> = {
  gestor: "Gestor de operações",
  diretor: "Diretor",
  especialista: "Especialista",
  rh: "RH",
  acolhimento: "Acolhimento (módulo indisponível)",
};
async function api(url: string, method = "GET", body?: unknown) {
  const response = await fetch("/api/" + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Falha na operação");
  return data;
}
export function AccessPanel({
  schools,
}: {
  schools: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState(schools[0]?.id ?? "");
  const [data, setData] = useState<Access | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (selected) setData(await api(`institutions/${selected}/access`));
  }, [selected]);
  useEffect(() => {
    let active = true;
    if (selected)
      api(`institutions/${selected}/access`)
        .then((d) => {
          if (active) setData(d);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [selected]);
  async function mutate(route: string, body: unknown) {
    setBusy(true);
    setError("");
    try {
      await api(`institutions/${selected}/${route}`, "PATCH", body);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="access-page">
      <Link href="/" className="text-button">
        ← Voltar ao painel
      </Link>
      <p className="eyebrow green">CERTTIFICA · ADMINISTRAÇÃO</p>
      <h1>Usuários e acessos</h1>
      <p className="muted">
        Atribua papéis e controle quem pode acessar cada instituição.
      </p>
      <label>
        Instituição
        <select
          aria-label="Instituição"
          disabled={busy}
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setData(null);
            setLink("");
            setError("");
          }}
        >
          {!schools.length && (
            <option value="">Nenhuma instituição cadastrada</option>
          )}
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {selected && (
        <>
          <section className="panel">
            <h2>Convidar pessoa</h2>
            <p className="muted small">
              O convite expira em 48 horas e só pode ser usado uma vez.
              Compartilhe o link apenas com o destinatário. Esta versão não
              envia e-mails.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                setBusy(true);
                setError("");
                setLink("");
                try {
                  const result = await api(
                    `institutions/${selected}/invitations`,
                    "POST",
                    Object.fromEntries(new FormData(form)),
                  );
                  setLink(
                    window.location.origin + "/convite#token=" + result.token,
                  );
                  form.reset();
                  await load();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="form-row">
                <label>
                  E-mail do convidado
                  <input name="email" type="email" maxLength={254} required />
                </label>
                <label>
                  Papel
                  <select aria-label="Papel" name="role" defaultValue="diretor">
                    {Object.entries(roles).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button disabled={busy} className="primary">
                Gerar convite
              </button>
            </form>
            {link && (
              <div className="invite-result" role="status">
                <label>
                  Link privado do convite
                  <input
                    value={link}
                    readOnly
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <p className="muted small">
                  O link é exibido somente nesta geração. Gerar outro revoga os
                  convites anteriores para o mesmo e-mail e instituição.
                </p>
              </div>
            )}
          </section>
          <section className="panel">
            <h2>Pessoas com acesso</h2>
            <p className="muted small">
              O papel define permissões iniciais; personalizações substituem
              esse padrão apenas nesta instituição. Alterar ou revogar acesso
              encerra as sessões da pessoa em todas as instituições.
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>PESSOA</th>
                    <th>PAPEL</th>
                    <th>PERMISSÕES</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.members.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.name}</strong>
                        <small>{m.email}</small>
                      </td>
                      <td>
                        <select
                          aria-label={"Papel de " + m.name}
                          value={m.role}
                          disabled={busy}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Alterar o papel e encerrar as sessões desta pessoa?",
                              )
                            )
                              void mutate("members/" + m.id, {
                                role: e.target.value,
                              });
                          }}
                        >
                          {Object.entries(roles).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <details>
                          <summary>Personalizar permissões</summary>
                          <form
                            key={JSON.stringify(m.permissions) + m.role}
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const values = new FormData(
                                e.currentTarget,
                              ).getAll("permissions") as Permission[];
                              await mutate("members/" + m.id, {
                                permissions: values,
                              });
                            }}
                          >
                            {permissionKeys.map((key) => (
                              <label className="permission-option" key={key}>
                                <input
                                  type="checkbox"
                                  name="permissions"
                                  value={key}
                                  defaultChecked={effectivePermissions(
                                    m,
                                  ).includes(key)}
                                />
                                {permissionLabels[key]}
                              </label>
                            ))}
                            <button className="secondary" disabled={busy}>
                              Salvar permissões
                            </button>
                            <button
                              type="button"
                              className="text-button"
                              disabled={busy}
                              onClick={() =>
                                void mutate("members/" + m.id, {
                                  permissions: null,
                                })
                              }
                            >
                              Restaurar padrão do papel
                            </button>
                          </form>
                        </details>
                      </td>
                      <td>
                        <button
                          className="text-button"
                          disabled={busy}
                          onClick={() => {
                            if (
                              confirm(
                                "Revogar o acesso a esta instituição e encerrar as sessões?",
                              )
                            )
                              void mutate("members/" + m.id, { revoke: true });
                          }}
                        >
                          Revogar acesso
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data && !data.members.length && (
              <p className="muted small">
                Nenhum vínculo institucional. Administradores globais mantêm
                acesso pela função Certtifica.
              </p>
            )}
          </section>
          <section className="panel">
            <h2>Histórico de convites</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>E-MAIL</th>
                    <th>PAPEL</th>
                    <th>STATUS</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.invitations.map((i) => {
                    const active =
                      !i.usedAt &&
                      !i.revokedAt &&
                      new Date(i.expiresAt) > new Date();
                    return (
                      <tr key={i.id}>
                        <td>{i.email}</td>
                        <td>{roles[i.role]}</td>
                        <td>
                          {i.usedAt
                            ? "Aceito"
                            : i.revokedAt
                              ? "Revogado"
                              : active
                                ? "Pendente"
                                : "Expirado"}
                        </td>
                        <td>
                          {active && (
                            <button
                              disabled={busy}
                              className="text-button"
                              onClick={() =>
                                void mutate("invitations/" + i.id, {
                                  revoke: true,
                                })
                              }
                            >
                              Revogar convite
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data && !data.invitations.length && (
              <p className="muted small">Nenhum convite registrado.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}

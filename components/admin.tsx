"use client";
import { useEffect, useState } from "react";
type Lead = {
  id: string;
  createdAt: string;
  name: string;
  institution: string;
  role: string;
  city: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  employees: string;
  units: string;
  marketing: boolean;
  privacyVersion: string;
  source: string;
};
export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  async function load(p = 0) {
    setPending(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/leads?page=${p}`, {
        cache: "no-store",
      });
      if (r.status === 401) {
        setLogged(false);
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setLeads(d.leads);
      setLogged(true);
      setPage(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão.");
    } finally {
      setPending(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/leads?page=0", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (r) => {
        if (r.status === 401) return;
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setLeads(d.leads);
        setLogged(true);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Falha de conexão.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending(false);
      });
    return () => controller.abort();
  }, []);
  async function login(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = e.currentTarget;
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: new FormData(form).get("password") }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      form.reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão.");
    } finally {
      setPending(false);
    }
  }
  async function logout() {
    try {
      const r = await fetch("/api/admin/logout", { method: "POST" });
      if (!r.ok) throw Error("Não foi possível encerrar a sessão.");
      setLogged(false);
      setLeads([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão.");
    }
  }
  async function remove(id: string) {
    if (!window.confirm("Excluir permanentemente este contato?")) return;
    try {
      const r = await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        const d = await r.json();
        throw Error(d.error || "Não foi possível excluir.");
      }
      await load(page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão.");
    }
  }
  return (
    <section className="admin-panel">
      <div className="container">
        {!logged ? (
          <form className="contact-form admin-login" onSubmit={login}>
            <span className="eyebrow">ACESSO RESTRITO</span>
            <h1>Contatos NEXO</h1>
            <p>Use a senha administrativa configurada no servidor.</p>
            <div className="field">
              <label htmlFor="password">Senha administrativa</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={512}
              />
            </div>
            <button className="button" disabled={pending}>
              {pending ? "Verificando…" : "Entrar"}
            </button>
          </form>
        ) : (
          <>
            <div className="admin-header">
              <div>
                <span className="eyebrow">ADMINISTRAÇÃO · DADOS PESSOAIS</span>
                <h1>Solicitações recebidas</h1>
              </div>
              <div className="admin-controls">
                <button
                  className="button button-outline"
                  disabled={pending}
                  onClick={() => load(page)}
                >
                  Atualizar
                </button>
                <button className="button" onClick={logout}>
                  Sair
                </button>
              </div>
            </div>
            <p>
              Contatos em ordem de recebimento, 50 por página. A busca filtra
              somente a página atual.
            </p>
            <div className="field" style={{ maxWidth: 450, marginBottom: 25 }}>
              <label htmlFor="search">Buscar na página</label>
              <input
                id="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome, instituição, e-mail ou interesse"
              />
            </div>
            <div className="leads-list">
              {leads
                .filter((l) =>
                  [l.name, l.institution, l.email, l.interest]
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((l) => (
                  <article className="lead-card" key={l.id}>
                    <span className="eyebrow">
                      {new Date(l.createdAt).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}{" "}
                      · {l.source}
                    </span>
                    <h2>{l.institution}</h2>
                    <p>
                      {l.name} · {l.role} · {l.city}
                    </p>
                    <p>
                      <strong>Contato:</strong> {l.email} · {l.phone}
                    </p>
                    <p>
                      <strong>Interesse:</strong> {l.interest}
                    </p>
                    <p>
                      <strong>Equipe / unidades:</strong>{" "}
                      {l.employees || "Não informado"} /{" "}
                      {l.units || "Não informado"}
                    </p>
                    {l.message && (
                      <p style={{ whiteSpace: "pre-wrap" }}>{l.message}</p>
                    )}
                    <p>
                      Comunicações adicionais:{" "}
                      {l.marketing ? "autorizadas" : "não autorizadas"} ·
                      Ciência de privacidade v{l.privacyVersion}
                    </p>
                    <p>Protocolo: {l.id}</p>
                    <button
                      className="button button-outline"
                      onClick={() => remove(l.id)}
                    >
                      Excluir contato
                    </button>
                  </article>
                ))}
            </div>
            {leads.length === 0 && (
              <p className="empty-state">Nenhuma solicitação nesta página.</p>
            )}
            <div className="admin-controls" style={{ marginTop: 25 }}>
              <button
                className="button button-outline"
                disabled={page === 0 || pending}
                onClick={() => load(page - 1)}
              >
                Anterior
              </button>
              <span>Página {page + 1}</span>
              <button
                className="button button-outline"
                disabled={leads.length < 50 || pending}
                onClick={() => load(page + 1)}
              >
                Próxima
              </button>
            </div>
          </>
        )}
        {error && (
          <p className="form-status error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

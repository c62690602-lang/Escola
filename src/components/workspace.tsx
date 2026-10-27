"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  CalendarDays,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  Search,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Flag,
  Activity,
  Download,
  Menu,
  X,
  Layers,
} from "lucide-react";
import type { Actor } from "@/lib/auth";
type School = {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
};
type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueOn: string;
  ownerName: string;
  onboarding: boolean;
};
type Overview = {
  canManage: boolean;
  institution: School;
  tasks: Task[];
  progress: number | null;
  project: { startsOn: string; endsOn: string } | null;
  units: { id: string; name: string }[];
  history: { id: string; action: string; createdAt: string }[];
};
const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  em_validacao: "Em validação",
  concluida: "Concluída",
};
const date = (v: string) =>
  new Date(v.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
async function request(path: string, method = "GET", body?: unknown) {
  const res = await fetch("/api/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Falha na operação");
  return data;
}
export function Workspace({
  actor,
  initialSchools,
  demo,
}: {
  actor: Actor;
  initialSchools: School[];
  demo: boolean;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [schools, setSchools] = useState(initialSchools);
  const [selected, setSelected] = useState(initialSchools[0]?.id ?? "");
  const [data, setData] = useState<Overview | null>(null);
  const [view, setView] = useState("overview");
  const [modal, setModal] = useState<
    "institution" | "task" | "unit" | "onboarding" | null
  >(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
  }, [modal]);
  const refresh = useCallback(async () => {
    if (!selected) {
      setData(null);
      return;
    }
    try {
      setData(await request("institutions/" + selected));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [selected]);
  useEffect(() => {
    let active = true;
    if (selected)
      request("institutions/" + selected)
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
  const today = new Date().toISOString().slice(0, 10);
  const tasks = data?.tasks ?? [];
  const open = tasks.filter((t) => t.status !== "concluida");
  const overdue = open.filter((t) => t.dueOn < today);
  const completed = tasks.filter((t) => t.status === "concluida");
  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()),
  );
  const canWrite = actor.platformAdmin || data?.canManage === true;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (modal === "institution") {
        const { id } = await request("institutions", "POST", values);
        setSchools(await request("institutions"));
        setSelected(id);
      } else {
        await request(
          `institutions/${selected}/${modal === "task" ? "tasks" : modal === "unit" ? "units" : "onboarding"}`,
          "POST",
          values,
        );
        await refresh();
      }
      setModal(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function changeTask(t: Task, status: string) {
    let completionNote: string | undefined;
    if (status === "concluida") {
      completionNote =
        window.prompt("Registre o resultado da verificação para concluir:") ??
        undefined;
      if (!completionNote) return;
    }
    try {
      await request(`institutions/${selected}/tasks/${t.id}`, "PATCH", {
        status,
        completionNote,
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <div className="brand">
          nexo<span>●</span>
          <small>POR CERTTIFICA</small>
        </div>
        <p className="nav-caption">ESPAÇO DE TRABALHO</p>
        <nav>
          {[
            { id: "overview", label: "Visão geral", icon: LayoutDashboard },
            { id: "institutions", label: "Instituições", icon: Building2 },
            { id: "onboarding", label: "Implantação", icon: Layers },
            { id: "tasks", label: "Planos e tarefas", icon: ClipboardList },
            { id: "calendar", label: "Agenda", icon: CalendarDays },
            { id: "audit", label: "Auditoria", icon: ShieldCheck },
          ].map((n) => (
            <button
              key={n.id}
              className={view === n.id ? "nav-active" : ""}
              onClick={() => {
                setView(n.id);
                setMobile(false);
              }}
            >
              <n.icon size={19} />
              {n.label}
              {view === n.id && <ChevronRight size={15} />}
            </button>
          ))}
          {actor.platformAdmin && (
            <button onClick={() => router.push("/acessos")}>
              <ShieldCheck size={19} />
              Usuários e acessos
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="program-icon">
            <Activity size={22} />
          </div>
          <strong>Conectar para transformar.</strong>
          <p>Pessoas, processos e prioridades em um só lugar.</p>
          <span className="version">NEXO ESCOLAS · v0.1</span>
        </div>
        <button
          className="user-profile"
          onClick={async () => {
            await request("auth/logout", "POST");
            router.push("/login");
            router.refresh();
          }}
        >
          <span className="avatar">{actor.name.slice(0, 2).toUpperCase()}</span>
          <span>
            <strong>{actor.name.split(" · ")[0]}</strong>
            <small>
              {actor.platformAdmin ? "Equipe Certtifica" : "Instituição"}
            </small>
          </span>
          <LogOut size={17} />
        </button>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-toggle icon-button"
            aria-label="Abrir menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <strong>
              {view === "overview"
                ? "Visão geral"
                : view === "institutions"
                  ? "Instituições"
                  : view === "onboarding"
                    ? "Implantação"
                    : view === "tasks"
                      ? "Planos e tarefas"
                      : view === "calendar"
                        ? "Agenda"
                        : "Auditoria"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="live-dot" />
            {demo ? "Ambiente de demonstração" : "Ambiente operacional"}
            <span className="avatar light">
              {actor.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow green">GESTÃO INTEGRADA • NEXO ESCOLAS</p>
              <h1>
                {view === "overview"
                  ? "Um olhar para o que importa."
                  : view === "institutions"
                    ? "Instituições conectadas."
                    : view === "onboarding"
                      ? "O começo de uma transformação."
                      : view === "tasks"
                        ? "Prioridades em movimento."
                        : view === "calendar"
                          ? "Cada próximo passo."
                          : "Histórico que traz confiança."}
              </h1>
              <p className="muted">
                {view === "overview"
                  ? "Acompanhe a instituição, organize prioridades e avance com clareza."
                  : "Informações reais, acompanhamento próximo e decisões rastreáveis."}
              </p>
            </div>
            {(view === "institutions" || !selected
              ? actor.platformAdmin
              : canWrite) && (
              <button
                className="primary"
                onClick={() =>
                  setModal(
                    view === "institutions" || !selected
                      ? "institution"
                      : "task",
                  )
                }
              >
                <Plus size={17} />
                {view === "institutions" || !selected
                  ? "Nova instituição"
                  : "Nova tarefa"}
              </button>
            )}
          </div>
          {demo && (
            <div className="demo-banner">
              <ShieldCheck size={16} /> Demonstração • Instituições e usuários
              fictícios. Indicadores calculados apenas a partir dos registros
              cadastrados.
            </div>
          )}
          {error && (
            <div role="alert" className="error error-banner">
              {error}
              <button onClick={() => setError("")} aria-label="Fechar aviso">
                <X size={16} />
              </button>
            </div>
          )}
          <div className="context-row">
            <label className="school-select">
              <Building2 size={18} />
              <select
                aria-label="Instituição ativa"
                value={selected}
                onChange={(e) => {
                  setData(null);
                  setSelected(e.target.value);
                }}
              >
                {schools.length === 0 && (
                  <option value="">Nenhuma instituição cadastrada</option>
                )}
                {schools.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <span className="muted small">
              {new Date().toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {view === "institutions" ? (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Carteira de instituições</h2>
                  <p>Acesso limitado às instituições autorizadas.</p>
                </div>
                <span className="count">{schools.length}</span>
              </div>
              <div className="school-grid">
                {schools.map((s) => (
                  <button
                    className="school-card"
                    key={s.id}
                    onClick={() => {
                      setSelected(s.id);
                      setView("overview");
                    }}
                  >
                    <span className="tile-icon">
                      <Building2 />
                    </span>
                    <h3>{s.name}</h3>
                    <p>
                      {[s.city, s.state].filter(Boolean).join(" / ") ||
                        "Localização não informada"}
                    </p>
                    <span className="badge">
                      Em acompanhamento <ArrowUpRight size={14} />
                    </span>
                  </button>
                ))}
              </div>
              {!schools.length && (
                <Empty text="Sua carteira começa aqui. Cadastre a primeira instituição." />
              )}
            </section>
          ) : !data ? (
            <section className="panel">
              <Empty
                text={
                  selected
                    ? "Carregando informações…"
                    : "Cadastre uma instituição para iniciar o acompanhamento."
                }
              />
            </section>
          ) : (
            <>
              {view === "overview" && (
                <>
                  <section className="welcome-card">
                    <div>
                      <span className="badge pale">
                        <span className="live-dot" />
                        ACOMPANHAMENTO CONTÍNUO
                      </span>
                      <h2>
                        Uma gestão presente.
                        <br />
                        Uma escola em evolução.
                      </h2>
                      <p>
                        Cada ação registrada conecta o planejamento
                        <br className="desktop" /> ao cuidado com a comunidade
                        escolar.
                      </p>
                      <button onClick={() => setView("onboarding")}>
                        Acompanhar implantação <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="orbit-art" aria-hidden="true">
                      <div className="orbit-ring ring-one" />
                      <div className="orbit-ring ring-two" />
                      <span className="orbit-center">
                        <Activity size={46} />
                      </span>
                      <span className="orbit-point point-one">
                        <ShieldCheck size={22} />
                      </span>
                      <span className="orbit-point point-two">
                        <Building2 size={22} />
                      </span>
                      <span className="orbit-point point-three">
                        <CheckCircle2 size={22} />
                      </span>
                    </div>
                  </section>
                  <section className="stats-grid">
                    <Stat
                      title="Ações em aberto"
                      value={open.length}
                      text="Pendentes de conclusão"
                      icon={<ClipboardList size={20} />}
                    />
                    <Stat
                      title="Prazos em atenção"
                      value={overdue.length}
                      text="Ações com prazo ultrapassado"
                      icon={<Clock3 size={20} />}
                      warning={overdue.length > 0}
                    />
                    <Stat
                      title="Ações concluídas"
                      value={completed.length}
                      text="Com verificação registrada"
                      icon={<CheckCircle2 size={20} />}
                    />
                    <Stat
                      title="Implantação"
                      value={data.progress === null ? "—" : data.progress + "%"}
                      text={
                        data.progress === null
                          ? "Jornada ainda não iniciada"
                          : "Etapas efetivamente concluídas"
                      }
                      icon={<Flag size={20} />}
                    />
                  </section>
                  <div className="two-columns">
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Prioridades do momento</h2>
                          <p>Pequenos passos. Impactos importantes.</p>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => setView("tasks")}
                        >
                          Ver todas <ArrowUpRight size={15} />
                        </button>
                      </div>
                      {open.slice(0, 4).map((t) => (
                        <div key={t.id} className="priority-row">
                          <span className={"priority-dot " + t.priority} />
                          <div>
                            <strong>{t.title}</strong>
                            <p>
                              {t.ownerName || "Responsável a definir"} ·{" "}
                              {date(t.dueOn)}
                            </p>
                          </div>
                          <span
                            className={
                              "badge " + (t.dueOn < today ? "late" : "")
                            }
                          >
                            {t.dueOn < today
                              ? "Atrasado"
                              : statusLabels[t.status]}
                          </span>
                        </div>
                      ))}
                      {!open.length && (
                        <Empty text="Nenhuma prioridade em aberto. As novas tarefas aparecerão aqui." />
                      )}
                    </section>
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Jornada de implantação</h2>
                          <p>Estrutura para começar bem.</p>
                        </div>
                        <Layers size={21} className="green" />
                      </div>
                      <div className="progress-summary">
                        <span>
                          {data.progress ?? 0}
                          <small>%</small>
                        </span>
                        <p>
                          {data.project
                            ? "de etapas concluídas"
                            : "Aguardando início da jornada"}
                        </p>
                      </div>
                      <div className="progress-track">
                        <div style={{ width: `${data.progress ?? 0}%` }} />
                      </div>
                      <p className="muted small">
                        12 etapas · 60 dias · progresso por conclusão verificada
                      </p>
                      <button
                        className="secondary wide"
                        onClick={() => setView("onboarding")}
                      >
                        Ver jornada completa <ChevronRight size={16} />
                      </button>
                    </section>
                  </div>
                  <section className="panel unit-panel">
                    <div>
                      <h2>Unidades da instituição</h2>
                      <p className="muted small">
                        Organize o acompanhamento por local de atuação.
                      </p>
                    </div>
                    <div>
                      {data.units.map((u) => (
                        <span className="badge" key={u.id}>
                          {u.name}
                        </span>
                      ))}
                      {!data.units.length && (
                        <span className="muted small">
                          Nenhuma unidade cadastrada.
                        </span>
                      )}
                    </div>
                    {canWrite && (
                      <button
                        className="secondary"
                        onClick={() => setModal("unit")}
                      >
                        <Plus size={16} />
                        Adicionar unidade
                      </button>
                    )}
                  </section>
                </>
              )}
              {view === "onboarding" && (
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Implantação NEXO · primeiros 60 dias</h2>
                      <p>
                        {data.project
                          ? `${date(data.project.startsOn)} a ${date(data.project.endsOn)} · ${data.progress}% concluído`
                          : "Uma jornada estruturada, do diagnóstico ao acompanhamento."}
                      </p>
                    </div>
                    {!data.project && canWrite && (
                      <button
                        className="primary"
                        onClick={() => setModal("onboarding")}
                      >
                        <Plus size={17} />
                        Iniciar implantação
                      </button>
                    )}
                  </div>
                  {data.project ? (
                    <div className="timeline">
                      {tasks
                        .filter((t) => t.onboarding)
                        .map((t, i) => (
                          <div className="timeline-step" key={t.id}>
                            <span
                              className={
                                "step-number " +
                                (t.status === "concluida" ? "done" : "")
                              }
                            >
                              {t.status === "concluida" ? (
                                <CheckCircle2 size={18} />
                              ) : (
                                String(i + 1).padStart(2, "0")
                              )}
                            </span>
                            <div>
                              <h3>{t.title}</h3>
                              <p>
                                {date(t.dueOn)} ·{" "}
                                {t.ownerName || "Responsável a definir"}
                              </p>
                            </div>
                            <span className="badge">
                              {statusLabels[t.status]}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <Empty text="A implantação gera 12 tarefas com prazos distribuídos em 60 dias. O tempo decorrido não conclui etapas automaticamente." />
                  )}
                </section>
              )}
              {(view === "tasks" || view === "calendar") && (
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        {view === "calendar"
                          ? "Agenda de ações"
                          : "Planos e tarefas"}
                      </h2>
                      <p>
                        {tasks.length} registros · {completed.length} concluídos
                      </p>
                    </div>
                    <label className="search">
                      <Search size={16} />
                      <input
                        aria-label="Buscar tarefas"
                        placeholder="Buscar uma tarefa…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>ATIVIDADE</th>
                          <th>RESPONSÁVEL</th>
                          <th>PRAZO</th>
                          <th>PRIORIDADE</th>
                          <th>STATUS</th>
                          {canWrite && <th>AÇÕES</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <strong>{t.title}</strong>
                              <small>
                                {t.onboarding ? "Implantação" : "Plano de ação"}
                              </small>
                            </td>
                            <td>{t.ownerName || "A definir"}</td>
                            <td>
                              <span
                                className={
                                  t.dueOn < today && t.status !== "concluida"
                                    ? "overdue"
                                    : ""
                                }
                              >
                                {date(t.dueOn)}
                              </span>
                            </td>
                            <td>
                              <span className={"badge " + t.priority}>
                                {t.priority === "media"
                                  ? "Média"
                                  : t.priority === "alta"
                                    ? "Alta"
                                    : "Baixa"}
                              </span>
                            </td>
                            <td>
                              {canWrite ? (
                                <select
                                  aria-label={"Status de " + t.title}
                                  value={t.status}
                                  onChange={(e) =>
                                    changeTask(t, e.target.value)
                                  }
                                >
                                  {Object.entries(statusLabels).map(
                                    ([k, v]) => (
                                      <option value={k} key={k}>
                                        {v}
                                      </option>
                                    ),
                                  )}
                                </select>
                              ) : (
                                statusLabels[t.status]
                              )}
                            </td>
                            {canWrite && (
                              <td>
                                <button
                                  disabled={t.onboarding}
                                  title={
                                    t.onboarding
                                      ? "Etapas obrigatórias não podem ser arquivadas"
                                      : undefined
                                  }
                                  className="text-button"
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        "Arquivar esta tarefa? O histórico será preservado.",
                                      )
                                    )
                                      return;
                                    try {
                                      await request(
                                        `institutions/${selected}/tasks/${t.id}`,
                                        "PATCH",
                                        { archive: true },
                                      );
                                      await refresh();
                                    } catch (e) {
                                      setError((e as Error).message);
                                    }
                                  }}
                                >
                                  Arquivar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!filtered.length && (
                    <Empty text="Nenhuma tarefa encontrada. Cadastre uma ação ou inicie a implantação." />
                  )}
                </section>
              )}
              {view === "audit" && (
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Trilha de auditoria</h2>
                      <p>Últimas 30 operações registradas no servidor.</p>
                    </div>
                    <button
                      className="secondary"
                      onClick={async () => {
                        try {
                          const report = await request(
                            `institutions/${selected}/report`,
                          );
                          const url = URL.createObjectURL(
                            new Blob([JSON.stringify(report, null, 2)], {
                              type: "application/json",
                            }),
                          );
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "nexo-relatorio-operacional.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (e) {
                          setError((e as Error).message);
                        }
                      }}
                    >
                      <Download size={16} />
                      Exportar relatório JSON
                    </button>
                  </div>
                  {data.history.map((h) => (
                    <div key={h.id} className="audit-row">
                      <ShieldCheck size={17} />
                      <strong>{h.action}</strong>
                      <span>
                        {new Date(h.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                  {!data.history.length && (
                    <Empty text="Nenhuma operação registrada." />
                  )}
                </section>
              )}
            </>
          )}
          <footer className="footer">
            <span>
              nexo <span className="green">●</span>{" "}
              <span>Inteligência que conecta. Gestão que transforma.</span>
            </span>
            <span>Uma plataforma Certtifica</span>
          </footer>
        </main>
      </div>
      {modal && (
        <div className="modal-backdrop">
          <dialog
            ref={dialogRef}
            onCancel={() => setModal(null)}
            aria-labelledby="dialog-title"
            className="modal"
          >
            <button
              className="close-modal icon-button"
              aria-label="Fechar formulário"
              onClick={() => setModal(null)}
            >
              <X />
            </button>
            <p className="eyebrow green">NEXO · GESTÃO INTEGRADA</p>
            <h2 id="dialog-title">
              {modal === "institution"
                ? "Nova instituição"
                : modal === "task"
                  ? "Nova tarefa"
                  : modal === "unit"
                    ? "Nova unidade"
                    : "Iniciar implantação"}
            </h2>
            <form onSubmit={submit}>
              {(modal === "institution" || modal === "unit") && (
                <label>
                  Nome
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={160}
                    autoFocus
                  />
                </label>
              )}
              {modal === "institution" && (
                <div className="form-row">
                  <label>
                    Cidade
                    <input name="city" maxLength={100} />
                  </label>
                  <label>
                    UF
                    <input name="state" maxLength={2} />
                  </label>
                </div>
              )}
              {modal === "task" && (
                <>
                  <label>
                    Título
                    <input
                      name="title"
                      required
                      minLength={2}
                      maxLength={160}
                      autoFocus
                    />
                  </label>
                  <label>
                    Descrição
                    <textarea name="description" maxLength={2000} />
                  </label>
                  <div className="form-row">
                    <label>
                      Prazo
                      <input name="dueOn" type="date" required />
                    </label>
                    <label>
                      Prioridade
                      <select name="priority" defaultValue="media">
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Responsável
                    <input name="ownerName" maxLength={120} />
                  </label>
                </>
              )}
              {modal === "onboarding" && (
                <>
                  <p className="muted">
                    Serão criadas 12 etapas. Cada conclusão exige registro de
                    verificação pelo gestor.
                  </p>
                  <label>
                    Data de início
                    <input
                      name="startsOn"
                      type="date"
                      defaultValue={today}
                      required
                    />
                  </label>
                </>
              )}
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              <button className="primary wide" disabled={busy}>
                {busy
                  ? "Salvando…"
                  : modal === "onboarding"
                    ? "Iniciar jornada"
                    : "Salvar cadastro"}
              </button>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <div>
        <ClipboardList size={24} />
      </div>
      <p>{text}</p>
    </div>
  );
}
function Stat({
  title,
  value,
  text,
  icon,
  warning = false,
}: {
  title: string;
  value: string | number;
  text: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <article className={"stat-card " + (warning ? "warning" : "")}>
      <div className="stat-top">
        <span>{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>{text}</p>
    </article>
  );
}

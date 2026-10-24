"use client";
import { useState } from "react";
import {
  Activity,
  HeartPulse,
  ShieldCheck,
  CalendarDays,
  Layers,
  ArrowUpRight,
  Check,
  Sprout,
} from "./icons";
export default function Dashboard({ full = false }: { full?: boolean }) {
  const [tab, setTab] = useState("Visão geral");
  const [month, setMonth] = useState("Agosto");
  const isSep = month === "Setembro";
  return (
    <div className={`dashboard ${full ? "dashboard-full" : ""}`}>
      <div className="dash-sidebar">
        <span className="dash-logo">
          n<span>↗</span>
        </span>
        {[Layers, HeartPulse, ShieldCheck, Sprout, CalendarDays].map(
          (Icon, i) => (
            <span className={i === 0 ? "dash-side-active" : ""} key={i}>
              <Icon size={17} />
            </span>
          ),
        )}
        <span className="dash-avatar">CE</span>
      </div>
      <div className="dash-main">
        <div className="dash-top">
          <span>
            Central de Inteligência <span className="dash-slash">/</span>{" "}
            <strong>Painel Executivo</strong>
          </span>
          <span className="demo-tag">DEMONSTRAÇÃO</span>
        </div>
        <div className="dash-heading">
          <div>
            <span className="dash-eyebrow">
              CUIDADO QUE SE TRANSFORMA EM AÇÃO
            </span>
            <h3>Uma visão do que importa.</h3>
            <p>Instituição Exemplo · Dados fictícios</p>
          </div>
          <label className="month-select">
            <CalendarDays size={13} />
            <select
              aria-label="Mês da demonstração"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option>Agosto</option>
              <option>Setembro</option>
            </select>
          </label>
        </div>
        <div
          className="dash-tabs"
          role="tablist"
          aria-label="Visualização do painel"
        >
          {["Visão geral", "Planos de ação", "Calendário"].map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              role="tab"
              aria-selected={tab === t}
              aria-controls="dash-panel"
              tabIndex={tab === t ? 0 : -1}
              onKeyDown={(e) => {
                const tabs = ["Visão geral", "Planos de ação", "Calendário"];
                const i = tabs.indexOf(t);
                const next =
                  e.key === "ArrowRight"
                    ? (i + 1) % 3
                    : e.key === "ArrowLeft"
                      ? (i + 2) % 3
                      : e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? 2
                          : -1;
                if (next >= 0) {
                  e.preventDefault();
                  setTab(tabs[next]);
                  document.getElementById(`tab-${tabs[next]}`)?.focus();
                }
              }}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div
          id="dash-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          tabIndex={0}
        >
          {tab === "Visão geral" ? (
            <>
              <div className="dash-metrics">
                <div>
                  <span>
                    Equipe preparada <ShieldCheck size={14} />
                  </span>
                  <strong>
                    {isSep ? "91" : "86"}
                    <small>%</small>
                  </strong>
                  <div className="mini-progress">
                    <i style={{ width: isSep ? "91%" : "86%" }} />
                  </div>
                  <em>Prontidão em primeiros socorros</em>
                </div>
                <div>
                  <span>
                    Ações em dia <Activity size={14} />
                  </span>
                  <strong>
                    {isSep ? "21" : "18"}
                    <small>/24</small>
                  </strong>
                  <div className="mini-progress blue">
                    <i style={{ width: isSep ? "87%" : "75%" }} />
                  </div>
                  <em>Planos em acompanhamento</em>
                </div>
                <div>
                  <span>
                    Saúde preventiva <HeartPulse size={14} />
                  </span>
                  <strong>
                    {isSep ? "05" : "04"}
                    <small> ações</small>
                  </strong>
                  <span className="metric-badge">
                    <Check size={10} /> No calendário do mês
                  </span>
                  <em>Campanhas e orientações</em>
                </div>
              </div>
              <div className="dash-lower">
                <div className="chart-card">
                  <div className="chart-title">
                    Evolução do programa <span>Últimos 6 meses</span>
                  </div>
                  <div
                    className="chart"
                    role="img"
                    aria-label="Gráfico ilustrativo: evolução de 35% a 86% em seis meses"
                  >
                    <div className="chart-grid">
                      <span>100%</span>
                      <span>50%</span>
                      <span>0%</span>
                    </div>
                    <svg
                      viewBox="0 0 300 110"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#27a87b"
                            stopOpacity=".23"
                          />
                          <stop
                            offset="100%"
                            stopColor="#27a87b"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 90 C35 85 38 70 60 72 S100 58 120 60 S160 30 180 35 S215 15 240 20 S270 10 300 9 L300 110 L0 110Z"
                        fill="url(#area)"
                      />
                      <path
                        d="M0 90 C35 85 38 70 60 72 S100 58 120 60 S160 30 180 35 S215 15 240 20 S270 10 300 9"
                        stroke="#269b79"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="chart-months">
                    {["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
                <div className="priorities">
                  <div className="chart-title">
                    No radar da gestão <span className="live-dot" />
                  </div>
                  <p>
                    <span className="priority-icon">
                      <CalendarDays size={15} />
                    </span>
                    <span>
                      <strong>Integração de novos profissionais</strong>
                      <small>2 colaboradores · Próxima ação</small>
                    </span>
                  </p>
                  <p>
                    <span className="priority-icon green">
                      <HeartPulse size={15} />
                    </span>
                    <span>
                      <strong>Campanha de saúde preventiva</strong>
                      <small>Planejamento em acompanhamento</small>
                    </span>
                  </p>
                  <div className="next-meeting">
                    Reunião estratégica{" "}
                    <span>
                      28 {isSep ? "SET" : "AGO"} <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
              <div className="dash-extra">
                <span>
                  Protocolos <b>8 implantados</b>
                </span>
                <span>
                  Treinamentos <b>12 concluídos · 2 pendentes</b>
                </span>
                <span>
                  Psicossocial <b>3 fatores acompanhados</b>
                </span>
                <span>
                  Bem-estar <b>2 experiências planejadas</b>
                </span>
              </div>
            </>
          ) : tab === "Planos de ação" ? (
            <div className="demo-table">
              <h4>Próximas prioridades · dados fictícios</h4>
              {[
                [
                  "Revisar distribuição de atividades",
                  "Coordenação · 15/09",
                  "Em andamento",
                ],
                [
                  "Integrar novos colaboradores",
                  "Gestão de pessoas · 18/09",
                  "Planejado",
                ],
                [
                  "Revisar protocolos de prevenção",
                  "Equipe técnica · 22/09",
                  "Planejado",
                ],
              ].map((r) => (
                <div key={r[0]}>
                  <strong>{r[0]}</strong>
                  <span>{r[1]}</span>
                  <em>{r[2]}</em>
                </div>
              ))}
            </div>
          ) : (
            <div className="demo-table">
              <h4>Calendário preventivo · exemplos de ações</h4>
              {[
                ["Retorno às aulas", "Acolhimento e revisão de protocolos"],
                ["Campanha sazonal", "Orientações sobre viroses"],
                ["Cuidado com a equipe", "Educação postural e pausas"],
                ["Reunião mensal", "Revisão de evidências e prioridades"],
              ].map((r) => (
                <div key={r[0]}>
                  <strong>{r[0]}</strong>
                  <span>{r[1]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dash-foot">
          <span>
            <span className="live-dot" /> Informações conectadas. Cuidado
            contínuo.
          </span>
          <span>Ambiente ilustrativo</span>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { commandCenter } from "@/lib/service";
export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await sessionUser((await cookies()).get("nexo_session")?.value);
  if (!actor) redirect("/login");
  if (actor.needsMfaSetup) redirect("/seguranca");
  if (!actor.platformAdmin) redirect("/");
  const data = await commandCenter(actor);
  return (
    <main className="access-page command-center">
      <Link className="text-button" href="/">
        ← Portal da instituição
      </Link>
      <p className="eyebrow green">CERTTIFICA · OPERAÇÃO REMOTA</p>
      <h1>Painel de Comando Geral</h1>
      <p className="muted">
        Uma visão da carteira e das prioridades, com origem nos registros das
        instituições.
      </p>
      <div className="stats-grid">
        {[
          { name: "Instituições", value: data.totals.institutions },
          { name: "Unidades ativas", value: data.totals.units },
          { name: "Ações em aberto", value: data.totals.openTasks },
          { name: "Ações atrasadas", value: data.totals.overdueTasks },
        ].map((s) => (
          <article key={s.name} className="stat-card">
            <div className="stat-top">{s.name}</div>
            <strong>{s.value}</strong>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Acompanhamento das instituições</h2>
            <p>
              {data.totals.onboardingStarted} implantações iniciadas ·{" "}
              {data.totals.highPriority} ações abertas de prioridade alta
            </p>
          </div>
          <Link href="/acessos" className="secondary">
            Gerenciar acessos
          </Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>INSTITUIÇÃO</th>
                <th>UNIDADES</th>
                <th>EM ABERTO</th>
                <th>ATRASADAS</th>
                <th>IMPLANTAÇÃO</th>
                <th>ACESSO</th>
              </tr>
            </thead>
            <tbody>
              {data.institutions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    <small>
                      {[s.city, s.state].filter(Boolean).join(" / ") ||
                        "Localização não informada"}
                    </small>
                  </td>
                  <td>{s.units}</td>
                  <td>{s.open_tasks}</td>
                  <td>
                    <span className={s.overdue_tasks ? "overdue" : ""}>
                      {s.overdue_tasks}
                    </span>
                  </td>
                  <td>
                    {s.progress === null ? "Não iniciada" : s.progress + "%"}
                    {s.progress !== null && (
                      <progress
                        aria-label={"Progresso de " + s.name}
                        value={s.progress}
                        max={100}
                      />
                    )}
                  </td>
                  <td>
                    <Link
                      className="text-button"
                      href={"/?institution=" + s.id}
                    >
                      Abrir instituição →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.institutions.length && (
          <p className="muted">
            Nenhuma instituição cadastrada. Os indicadores serão calculados após
            os primeiros registros.
          </p>
        )}
      </section>
      <section className="panel">
        <h2>Fontes e limites dos indicadores</h2>
        <p className="muted small">
          Carteira completa autorizada da administração Certtifica. Período:
          todos os registros ativos. Ações arquivadas são excluídas. Atraso é
          calculado pela data civil no fuso de cada instituição; conclusão
          depende de registro verificado, não de tempo decorrido. Implantação:
          etapas concluídas divididas pelo total de etapas ativas.
        </p>
        <p className="muted small">
          Atualização:{" "}
          {new Date(data.updatedAt).toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })}{" "}
          (São Paulo).
        </p>
        <h3>Indicadores ainda indisponíveis</h3>
        <p className="muted small">
          {data.unavailableIndicators.join(" · ")}. Os módulos ainda não foram
          implementados; ausência de fonte não significa zero.
        </p>
      </section>
    </main>
  );
}

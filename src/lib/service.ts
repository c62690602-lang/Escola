import { and, eq, isNull, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import {
  institutions,
  memberships,
  tasks,
  units,
  projects,
  audits,
} from "./schema";
import type { Actor } from "./auth";
import {
  effectivePermissions,
  permissionKeys,
  type Permission,
} from "./permissions";
export class AccessError extends Error {}
export class ConflictError extends Error {}
export const uuid = z.uuid();
const short = z.string().trim().min(2).max(160);
export const timezoneInput = z
  .string()
  .max(80)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("pt-BR", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Fuso horário IANA inválido");
export const institutionInput = z.object({
  timezone: timezoneInput.default("America/Sao_Paulo"),
  name: short,
  city: z.string().trim().max(100).default(""),
  state: z.string().trim().max(2).default(""),
});
export const taskInput = z.object({
  title: short,
  description: z.string().trim().max(2000).default(""),
  priority: z.enum(["baixa", "media", "alta"]),
  dueOn: z.iso.date(),
  ownerName: z.string().trim().max(120).default(""),
});
export async function authorize(
  actor: Actor,
  institutionId: string,
  write: boolean | Permission = false,
) {
  if (actor.needsMfaSetup)
    throw new AccessError("Conclua o cadastro do segundo fator");
  uuid.parse(institutionId);
  const [institution] = await db
    .select()
    .from(institutions)
    .where(eq(institutions.id, institutionId));
  if (!institution) throw new AccessError("Instituição indisponível");
  if (actor.platformAdmin) return true;
  const [member] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, actor.id),
        eq(memberships.institutionId, institutionId),
      ),
    );
  if (!member) throw new AccessError("Acesso negado");
  const capabilities = effectivePermissions(member);
  const required = write === true ? "tasks.write" : write;
  if (required && !capabilities.includes(required))
    throw new AccessError("Permissão insuficiente");
  return capabilities.includes("tasks.write");
}
export async function portfolio(actor: Actor) {
  if (actor.needsMfaSetup)
    throw new AccessError("Conclua o cadastro do segundo fator");
  if (actor.platformAdmin)
    return db.select().from(institutions).orderBy(institutions.name);
  return db
    .select({
      id: institutions.id,
      name: institutions.name,
      city: institutions.city,
      state: institutions.state,
      status: institutions.status,
      createdAt: institutions.createdAt,
    })
    .from(institutions)
    .innerJoin(memberships, eq(memberships.institutionId, institutions.id))
    .where(eq(memberships.userId, actor.id))
    .orderBy(institutions.name);
}
export async function createInstitution(actor: Actor, input: unknown) {
  if (!actor.platformAdmin || actor.needsMfaSetup)
    throw new AccessError("Acesso negado");
  const data = institutionInput.parse(input);
  const id = randomUUID();
  await db.transaction(async (tx) => {
    await tx
      .insert(institutions)
      .values({ ...data, id, status: "implantacao" });
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action: "institution.created",
      entityId: id,
    });
  });
  return id;
}
export async function overview(actor: Actor, id: string) {
  await authorize(actor, id);
  const [member] = actor.platformAdmin
    ? []
    : await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, actor.id),
            eq(memberships.institutionId, id),
          ),
        );
  if (!actor.platformAdmin && !member) throw new AccessError("Acesso negado");
  const capabilities = actor.platformAdmin
    ? [...permissionKeys]
    : effectivePermissions(member!);
  const canManage = capabilities.includes("tasks.write");
  const [institution] = await db
    .select()
    .from(institutions)
    .where(eq(institutions.id, id));
  const records = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.institutionId, id), isNull(tasks.archivedAt)))
    .orderBy(tasks.dueOn);
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.institutionId, id));
  const unitList = await db
    .select()
    .from(units)
    .where(and(eq(units.institutionId, id), isNull(units.archivedAt)));
  const history = capabilities.includes("audit.read")
    ? await db
        .select()
        .from(audits)
        .where(eq(audits.institutionId, id))
        .orderBy(desc(audits.createdAt))
        .limit(30)
    : [];
  const steps = records.filter((t) => t.onboarding);
  return {
    canManage,
    capabilities,
    institution,
    tasks: records,
    project: project ?? null,
    units: unitList,
    history,
    progress: steps.length
      ? Math.round(
          (100 * steps.filter((t) => t.status === "concluida").length) /
            steps.length,
        )
      : null,
  };
}
export async function createTask(actor: Actor, id: string, input: unknown) {
  await authorize(actor, id, true);
  const data = taskInput.parse(input);
  const entityId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(tasks).values({
      ...data,
      id: entityId,
      institutionId: id,
      status: "pendente",
      onboarding: false,
    });
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action: "task.created",
      entityId,
    });
  });
  return entityId;
}
export async function updateTask(
  actor: Actor,
  id: string,
  taskId: string,
  input: unknown,
) {
  await authorize(actor, id, true);
  uuid.parse(taskId);
  const change = z
    .object({
      status: z
        .enum(["pendente", "em_andamento", "em_validacao", "concluida"])
        .optional(),
      completionNote: z.string().trim().max(2000).optional(),
      archive: z.boolean().optional(),
    })
    .parse(input);
  if (change.status === "concluida" && !change.completionNote)
    throw new ConflictError("Informe o resultado da verificação para concluir");
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.institutionId, id),
          isNull(tasks.archivedAt),
        ),
      )
      .for("update");
    if (!existing) throw new AccessError("Tarefa indisponível");
    if (change.archive && existing.onboarding)
      throw new ConflictError(
        "Etapas obrigatórias da implantação não podem ser arquivadas",
      );
    const result = await tx
      .update(tasks)
      .set({
        status: change.status,
        completionNote: change.completionNote,
        archivedAt: change.archive ? new Date() : undefined,
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.institutionId, id),
          isNull(tasks.archivedAt),
        ),
      )
      .returning({ id: tasks.id });
    if (!result.length) throw new AccessError("Tarefa indisponível");
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action: change.archive ? "task.archived" : `task.${change.status}`,
      entityId: taskId,
    });
  });
}
export const steps = [
  "Conhecimento da instituição",
  "Diagnóstico inicial",
  "Recebimento e análise documental",
  "Mapeamento dos processos",
  "Levantamento de riscos e necessidades",
  "Definição de prioridades",
  "Configuração dos módulos contratados",
  "Estruturação de protocolos e processos",
  "Capacitações iniciais",
  "Preparação dos indicadores e painel",
  "Validação com a direção",
  "Encerramento da implantação",
];
export async function startOnboarding(
  actor: Actor,
  id: string,
  input: unknown,
) {
  await authorize(actor, id, true);
  const { startsOn } = z.object({ startsOn: z.iso.date() }).parse(input);
  const add = (days: number) => {
    const d = new Date(`${startsOn}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  await db.transaction(async (tx) => {
    const result = await tx
      .insert(projects)
      .values({
        id: randomUUID(),
        institutionId: id,
        startsOn,
        endsOn: add(60),
      })
      .onConflictDoNothing()
      .returning();
    if (!result.length) throw new ConflictError("Implantação já iniciada");
    await tx.insert(tasks).values(
      steps.map((title, i) => ({
        id: randomUUID(),
        institutionId: id,
        title,
        description:
          "Conclusão exige registro do resultado e validação pelo gestor.",
        status: "pendente",
        priority: "media",
        dueOn: add((i + 1) * 5),
        ownerName: "",
        onboarding: true,
      })),
    );
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action: "onboarding.started",
      entityId: result[0].id,
    });
  });
}
export async function createUnit(actor: Actor, id: string, input: unknown) {
  await authorize(actor, id, "units.write");
  const data = z.object({ name: short }).parse(input);
  const entityId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(units).values({ id: entityId, institutionId: id, ...data });
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action: "unit.created",
      entityId,
    });
  });
}
export async function confidentialAccess() {
  throw new AccessError("Módulo de acolhimento não habilitado nesta versão");
}

export async function commandCenter(actor: Actor) {
  if (!actor.platformAdmin || actor.needsMfaSetup)
    throw new AccessError("Painel restrito à administração Certtifica");
  const result = await db.execute(sql`
 SELECT i.id,i.name,i.city,i.state,i.timezone,i.status,
 (SELECT count(*)::int FROM units u WHERE u.institution_id=i.id AND u.archived_at IS NULL) AS units,
 (SELECT count(*)::int FROM tasks t WHERE t.institution_id=i.id AND t.archived_at IS NULL AND t.status<>'concluida') AS open_tasks,
 (SELECT count(*)::int FROM tasks t WHERE t.institution_id=i.id AND t.archived_at IS NULL AND t.status<>'concluida' AND t.due_on < (CURRENT_TIMESTAMP AT TIME ZONE i.timezone)::date) AS overdue_tasks,
 (SELECT count(*)::int FROM tasks t WHERE t.institution_id=i.id AND t.archived_at IS NULL AND t.status<>'concluida' AND t.priority='alta') AS high_priority,
 (SELECT count(*)::int FROM tasks t WHERE t.institution_id=i.id AND t.archived_at IS NULL AND t.onboarding) AS steps,
 (SELECT count(*)::int FROM tasks t WHERE t.institution_id=i.id AND t.archived_at IS NULL AND t.onboarding AND t.status='concluida') AS completed_steps,
 EXISTS(SELECT 1 FROM onboarding_projects p WHERE p.institution_id=i.id) AS has_project
 FROM institutions i ORDER BY i.name`);
  type Row = {
    id: string;
    name: string;
    city: string;
    state: string;
    timezone: string;
    status: string;
    units: number;
    open_tasks: number;
    overdue_tasks: number;
    high_priority: number;
    steps: number;
    completed_steps: number;
    has_project: boolean;
  };
  const institutionsData = (result.rows as Row[]).map((r) => ({
    ...r,
    progress: r.steps ? Math.round((r.completed_steps / r.steps) * 100) : null,
  }));
  return {
    updatedAt: new Date().toISOString(),
    institutions: institutionsData,
    totals: {
      institutions: institutionsData.length,
      units: institutionsData.reduce((n, r) => n + r.units, 0),
      openTasks: institutionsData.reduce((n, r) => n + r.open_tasks, 0),
      overdueTasks: institutionsData.reduce((n, r) => n + r.overdue_tasks, 0),
      highPriority: institutionsData.reduce((n, r) => n + r.high_priority, 0),
      onboardingStarted: institutionsData.filter((r) => r.has_project).length,
    },
    unavailableIndicators: [
      "Colaboradores",
      "Treinamentos",
      "Documentos",
      "Contratos",
      "Receita recorrente",
    ],
  };
}

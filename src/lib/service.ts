import { and, eq, isNull, desc } from "drizzle-orm";
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
export class AccessError extends Error {}
export class ConflictError extends Error {}
export const uuid = z.uuid();
const short = z.string().trim().min(2).max(160);
export const institutionInput = z.object({
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
  write = false,
) {
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
  if (!member || (write && member.role !== "gestor"))
    throw new AccessError("Acesso negado");
  return member.role === "gestor";
}
export async function portfolio(actor: Actor) {
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
  if (!actor.platformAdmin) throw new AccessError("Acesso negado");
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
  const canManage = await authorize(actor, id);
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
  const history = await db
    .select()
    .from(audits)
    .where(eq(audits.institutionId, id))
    .orderBy(desc(audits.createdAt))
    .limit(30);
  const steps = records.filter((t) => t.onboarding);
  return {
    canManage,
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
  await authorize(actor, id, true);
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

import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { and, eq, desc, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db, pool } from "./db";
import { accountTokens, users, memberships, audits, sessions } from "./schema";
import { digest, hashPassword, type Actor } from "./auth";
import { authorize, AccessError, ConflictError, uuid } from "./service";
export const roleInput = z.enum([
  "gestor",
  "diretor",
  "especialista",
  "rh",
  "acolhimento",
]);
const passwordInput = z.string().min(14).max(256);
const tokenInput = z.string().regex(/^[a-f0-9]{64}$/);
async function manage(actor: Actor, id: string) {
  await authorize(actor, id);
  if (!actor.platformAdmin)
    throw new AccessError(
      "Somente a administração Certtifica gerencia acessos",
    );
}
export async function listAccess(actor: Actor, id: string) {
  await manage(actor, id);
  return {
    members: await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.institutionId, id))
      .orderBy(users.name),
    invitations: await db
      .select({
        id: accountTokens.id,
        email: accountTokens.email,
        role: accountTokens.role,
        expiresAt: accountTokens.expiresAt,
        usedAt: accountTokens.usedAt,
        revokedAt: accountTokens.revokedAt,
      })
      .from(accountTokens)
      .where(
        and(
          eq(accountTokens.institutionId, id),
          eq(accountTokens.kind, "invitation"),
        ),
      )
      .orderBy(desc(accountTokens.createdAt))
      .limit(100),
  };
}
export async function invite(actor: Actor, id: string, input: unknown) {
  await manage(actor, id);
  const data = z
    .object({
      email: z
        .email()
        .max(254)
        .transform((v) => v.toLowerCase()),
      role: roleInput,
    })
    .parse(input);
  const token = randomBytes(32).toString("hex"),
    invitationId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${id + data.email},0))`,
    );
    const [member] = await tx
      .select({ id: users.id })
      .from(users)
      .innerJoin(memberships, eq(memberships.userId, users.id))
      .where(
        and(eq(users.email, data.email), eq(memberships.institutionId, id)),
      );
    if (member)
      throw new ConflictError(
        "Usuário já possui acesso; altere o papel existente",
      );
    await tx
      .update(accountTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(accountTokens.institutionId, id),
          eq(accountTokens.email, data.email),
          isNull(accountTokens.usedAt),
          isNull(accountTokens.revokedAt),
        ),
      );
    await tx.insert(accountTokens).values({
      id: invitationId,
      tokenHash: digest(token),
      kind: "invitation",
      email: data.email,
      institutionId: id,
      role: data.role,
      createdBy: actor.id,
      expiresAt: new Date(Date.now() + 48 * 3600_000),
    });
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action: "invitation.created",
      entityId: invitationId,
    });
  });
  // Returned only to the authorized administrator once; never stored as plaintext in DB or audit.
  return { id: invitationId, token };
}
export async function revokeInvitation(
  actor: Actor,
  id: string,
  invitationId: string,
) {
  await manage(actor, id);
  uuid.parse(invitationId);
  await db.transaction(async (tx) => {
    const result = await tx
      .update(accountTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(accountTokens.id, invitationId),
          eq(accountTokens.institutionId, id),
          eq(accountTokens.kind, "invitation"),
          isNull(accountTokens.usedAt),
          isNull(accountTokens.revokedAt),
        ),
      )
      .returning({ id: accountTokens.id });
    if (!result.length) throw new ConflictError("Convite indisponível");
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action: "invitation.revoked",
      entityId: invitationId,
    });
  });
}
export async function changeMembership(
  actor: Actor,
  id: string,
  userId: string,
  input: unknown,
) {
  await manage(actor, id);
  uuid.parse(userId);
  const change = z
    .union([
      z.object({ role: roleInput }),
      z.object({ revoke: z.literal(true) }),
    ])
    .parse(input);
  await db.transaction(async (tx) => {
    const [target] = await tx
      .select({ platformAdmin: users.platformAdmin })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(
        and(eq(memberships.institutionId, id), eq(memberships.userId, userId)),
      )
      .for("update");
    if (!target)
      throw new AccessError("Usuário não pertence a esta instituição");
    if (target.platformAdmin)
      throw new ConflictError(
        "Administradores globais não são gerenciados por vínculo institucional",
      );
    const filter = and(
      eq(memberships.institutionId, id),
      eq(memberships.userId, userId),
    );
    if ("revoke" in change) await tx.delete(memberships).where(filter);
    else await tx.update(memberships).set({ role: change.role }).where(filter);
    // Revoke all sessions so stale navigation cannot imply an obsolete authorization.
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: id,
      actorId: actor.id,
      action:
        "revoke" in change
          ? "membership.revoked"
          : `membership.role.${change.role}`,
      entityId: userId,
    });
  });
}
export async function acceptInvitation(input: unknown, actor: Actor | null) {
  const data = z
    .object({
      token: tokenInput,
      name: z.string().trim().min(2).max(120),
      password: passwordInput.optional(),
    })
    .parse(input);
  // Compute any new hash outside the transaction to avoid holding locks during scrypt.
  const passwordHash = data.password ? await hashPassword(data.password) : null;
  await db.transaction(async (tx) => {
    const [invitation] = await tx
      .select()
      .from(accountTokens)
      .where(
        and(
          eq(accountTokens.tokenHash, digest(data.token)),
          eq(accountTokens.kind, "invitation"),
          gt(accountTokens.expiresAt, new Date()),
          isNull(accountTokens.usedAt),
          isNull(accountTokens.revokedAt),
        ),
      )
      .for("update");
    if (!invitation)
      throw new ConflictError("Convite inválido, expirado ou já utilizado");
    const [existing] = await tx
      .select()
      .from(users)
      .where(eq(users.email, invitation.email));
    let userId: string;
    if (existing) {
      if (!actor || actor.id !== existing.id)
        throw new AccessError(
          "Esta conta já existe. Entre com o e-mail convidado antes de aceitar.",
        );
      userId = existing.id;
    } else {
      if (!passwordHash)
        throw new ConflictError(
          "Defina uma senha com pelo menos 14 caracteres",
        );
      userId = randomUUID();
      await tx.insert(users).values({
        id: userId,
        name: data.name,
        email: invitation.email,
        passwordHash,
        platformAdmin: false,
      });
    }
    const result = await tx
      .insert(memberships)
      .values({
        userId,
        institutionId: invitation.institutionId!,
        role: invitation.role!,
      })
      .onConflictDoNothing()
      .returning();
    if (!result.length)
      throw new ConflictError(
        "Acesso já atribuído; solicite a revisão do administrador",
      );
    await tx
      .update(accountTokens)
      .set({ usedAt: new Date() })
      .where(eq(accountTokens.id, invitation.id));
    await tx.insert(audits).values({
      id: randomUUID(),
      institutionId: invitation.institutionId,
      actorId: userId,
      action: "invitation.accepted",
      entityId: invitation.id,
    });
  });
}
export class DeliveryUnavailable extends Error {}
export async function requestRecovery(input: unknown) {
  const { email } = z
    .object({
      email: z
        .email()
        .max(254)
        .transform((v) => v.toLowerCase()),
    })
    .parse(input);
  // Local-only delivery is explicit; never pretend a real e-mail was sent.
  if (process.env.DEMO_MODE !== "true" || process.env.PUBLIC_DEMO === "true")
    throw new DeliveryUnavailable(
      "Recuperação por e-mail ainda não configurada. Contate a Certtifica.",
    );
  const rate = await pool.query(
    `INSERT INTO login_attempts(key_hash,attempts,resets_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN login_attempts.resets_at<now() THEN 1 ELSE login_attempts.attempts+1 END,resets_at=CASE WHEN login_attempts.resets_at<now() THEN now()+interval '15 minutes' ELSE login_attempts.resets_at END RETURNING attempts`,
    [digest("recovery:" + email)],
  );
  // Same response for missing accounts and rate-limited requests.
  if (rate.rows[0].attempts > 3) return;
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
  if (!user) return;
  const token = randomBytes(32).toString("hex"),
    id = randomUUID();
  const directory = path.join(process.cwd(), ".local", "mail");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, id + ".json");
  try {
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${"recovery:" + email},0))`,
      );
      await tx
        .update(accountTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(accountTokens.email, email),
            eq(accountTokens.kind, "recovery"),
            isNull(accountTokens.usedAt),
            isNull(accountTokens.revokedAt),
          ),
        );
      await tx.insert(accountTokens).values({
        id,
        tokenHash: digest(token),
        kind: "recovery",
        email,
        expiresAt: new Date(Date.now() + 30 * 60_000),
      });
      await writeFile(
        file,
        JSON.stringify({
          to: email,
          kind: "recovery",
          path: "/recuperar#token=" + token,
          expiresInMinutes: 30,
        }),
        { mode: 0o600, flag: "wx" },
      );
    });
  } catch (error) {
    await unlink(file).catch(() => {});
    throw error;
  }
}
export async function resetPassword(input: unknown) {
  const data = z
    .object({ token: tokenInput, password: passwordInput })
    .parse(input);
  const passwordHash = await hashPassword(data.password);
  await db.transaction(async (tx) => {
    const [token] = await tx
      .select()
      .from(accountTokens)
      .where(
        and(
          eq(accountTokens.tokenHash, digest(data.token)),
          eq(accountTokens.kind, "recovery"),
          gt(accountTokens.expiresAt, new Date()),
          isNull(accountTokens.usedAt),
          isNull(accountTokens.revokedAt),
        ),
      )
      .for("update");
    if (!token)
      throw new ConflictError("Link inválido, expirado ou já utilizado");
    const [user] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, token.email));
    if (!user) throw new ConflictError("Link inválido");
    await tx.update(users).set({ passwordHash }).where(eq(users.id, user.id));
    await tx.delete(sessions).where(eq(sessions.userId, user.id));
    await tx
      .update(accountTokens)
      .set({ usedAt: new Date() })
      .where(eq(accountTokens.id, token.id));
    await tx
      .update(accountTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(accountTokens.email, token.email),
          eq(accountTokens.kind, "recovery"),
          isNull(accountTokens.usedAt),
          isNull(accountTokens.revokedAt),
        ),
      );
    await tx.insert(audits).values({
      id: randomUUID(),
      actorId: user.id,
      action: "password.reset",
      entityId: user.id,
    });
  });
}

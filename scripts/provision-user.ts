import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, pool } from "../src/lib/db";
import { users, memberships } from "../src/lib/schema";
import { hashPassword } from "../src/lib/auth";
// Operator-only CLI. Never expose this operation through a public endpoint.
const input = z
  .object({
    name: z.string().min(2).max(120),
    email: z.email(),
    password: z.string().min(14).max(256),
    institutionId: z.uuid(),
    role: z.enum(["gestor", "diretor", "especialista", "rh", "acolhimento"]),
  })
  .parse({
    name: process.env.USER_NAME,
    email: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
    institutionId: process.env.INSTITUTION_ID,
    role: process.env.USER_ROLE,
  });
try {
  await db.transaction(async (tx) => {
    const id = randomUUID();
    await tx.insert(users).values({
      id,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      platformAdmin: false,
    });
    await tx.insert(memberships).values({
      userId: id,
      institutionId: input.institutionId,
      role: input.role,
    });
  });
  console.log("Usuário e atribuição criados.");
} finally {
  await pool.end();
}
